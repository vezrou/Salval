"""
Analyzer subagent — reads fetched repo files and extracts a structured
project context snapshot that all other agents use to understand the
existing codebase before generating anything new.

The snapshot shape:
{
    "stack":      ["React", "TypeScript", "Tailwind CSS"],
    "components": ["Button", "Card", "Modal"],
    "hooks":      ["useAuth", "useFetch"],
    "css_tokens": ["--color-primary", "--space-4"],
    "patterns":   ["compound component", "custom hook for data fetching"],
    "summary":    "A React + TypeScript SPA using Tailwind CSS..."
}
"""

import json
import re

from .llm_client import generate
from agents.repository_scope import file_scope

_SYSTEM_PROMPT = """\
You are a frontend codebase analyzer. You will be given a list of files from a \
frontend project, each with its path and content.

Your job is to extract a structured context snapshot of the project so that other \
AI agents can understand the existing codebase before writing new code.

Focus exclusively on frontend findings. Some files are labeled backend and are
included ONLY to understand integration: API routes/methods, request/response
shapes, authentication, validation errors and data contracts used by the UI.
Do not review server architecture, databases or backend code quality. Keep the
stack, components, hooks, utilities, tokens and patterns frontend-only. Inspect
the code as well as the provisional file labels to determine its actual role.
In the summary state that this is a frontend-focused analysis, with backend used
only as integration context when available. Never invent API contracts.

Respond with ONLY a valid JSON object — no explanation, no markdown fences, \
no commentary before or after. The object must have these keys:

"stack"      — array of strings: frameworks, languages, and major libraries detected
               (e.g. ["React", "TypeScript", "Tailwind CSS", "Vite"])
"components" — array of strings: names and file paths of reusable UI components found
               (e.g. ["Button", "Card", "Modal", "Navbar"])
"utilities" — array of strings: reusable utility functions with file paths
"hooks"      — array of strings: names and file paths of custom hooks found
               (e.g. ["useAuth", "useFetch", "useToggle"])
"css_tokens" — array of strings: CSS custom property names found (--variable-name)
               (e.g. ["--color-primary", "--space-4", "--font-size-base"])
"patterns"   — array of strings: architectural or design patterns detected
               (e.g. ["compound component", "render prop", "feature-based folder structure"])
"summary"    — one paragraph (3-5 sentences) describing the project: what it is,
               its tech stack, how it is structured, and any notable conventions
"backend_integration" — array of strings: evidenced API contracts and constraints
               relevant to frontend recommendations, with source paths; [] if absent

If a category has no findings, return an empty array [] for that key.
Never invent components, hooks, or tokens that are not present in the files.\
"""


def _format_files(files: list[dict]) -> str:
    """Format the file list into a single string for the LLM prompt."""
    parts = []
    for f in files:
        scope = f.get("scope", file_scope(f["path"]))
        parts.append(f"### {f['path']} [role: {scope}]\n```\n{f['content']}\n```")
    return "\n\n".join(parts)


def _parse_snapshot(raw: str) -> dict:
    """
    Extract the JSON object from the model's response.
    Tries strict parsing first, then falls back to regex extraction.
    Returns a validated snapshot dict with all required keys present.
    """
    text = raw.strip()
    candidates = [text]

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        candidates.append(match.group(0))

    list_keys = ("stack", "components", "hooks", "css_tokens", "patterns", "utilities", "backend_integration")
    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if not isinstance(parsed, dict):
                continue
            snapshot = {}
            for key in list_keys:
                value = parsed.get(key, [])
                if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
                    raise ValueError("Invalid snapshot list")
                snapshot[key] = value
            summary = parsed.get("summary")
            if not isinstance(summary, str) or not summary.strip():
                raise ValueError("Missing summary")
            snapshot["summary"] = summary
            return snapshot
        except (json.JSONDecodeError, ValueError):
            continue
    raise RuntimeError("The repository analysis returned an invalid result. Please retry.")


def analyze(files: list[dict]) -> dict:
    """
    Analyze a list of repo files and return a project context snapshot.

    Args:
        files: List of {"path": str, "content": str} dicts from the GitHub fetcher.

    Returns:
        Context snapshot dict with keys: stack, components, hooks,
        css_tokens, patterns, summary.
    """
    formatted = _format_files(files)
    user_message = (
        f"Here are the frontend and supporting backend files ({len(files)} files total):\n\n"
        f"{formatted}"
    )
    raw = generate(_SYSTEM_PROMPT, user_message)
    snapshot = _parse_snapshot(raw)
    snapshot["files"] = [f["path"] for f in files]
    snapshot["scope"] = {
        "focus": "frontend",
        "frontend_files": sum(f.get("scope", file_scope(f["path"])) == "frontend" for f in files),
        "backend_files": sum(f.get("scope", file_scope(f["path"])) == "backend" for f in files),
    }
    return snapshot

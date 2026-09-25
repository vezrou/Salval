"""
Code-analysis assistant.

check_code() sends the user's code to watsonx and returns a structured list
of issues, each with an accurate line number, a problem description, and a
hint for what to write.
"""

import json
import re

from agents.subagents.llm_client import generate

# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are a strict code-quality analyzer. You will be given source code with \
line numbers prepended in the format "N | <code>".

Your job is to find every real issue in the code: syntax errors, logic bugs, \
bad practices, missing error handling, type mismatches, undefined variables, \
unreachable code, and similar problems. Do NOT invent issues that do not exist.

Respond with ONLY a valid JSON array — no explanation, no markdown fences, \
no commentary before or after. Each element must have exactly these three \
string/integer fields:
  "line"    – the 1-based line number where the issue occurs (integer)
  "problem" – a concise description of what is wrong (string)
  "hint"    – a concrete suggestion of what to write or change (string)

If there are no issues, respond with an empty array: []\
"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _number_lines(code: str) -> str:
    """Return the code with "N | " prefixes so the model can cite line numbers."""
    return "\n".join(
        f"{i + 1} | {line}" for i, line in enumerate(code.splitlines())
    )


def _parse_issues(raw: str) -> list[dict]:
    """
    Extract the JSON array from the model's response.

    Tries strict parsing first; if that fails, uses a regex to pull out the
    first [...] block in case the model added surrounding prose.
    Returns a list of validated issue dicts (unknown keys are dropped).
    """
    text = raw.strip()

    # Attempt 1 – the whole response is valid JSON
    candidates = [text]

    # Attempt 2 – grab the first [...] block
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        candidates.append(match.group(0))

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if not isinstance(parsed, list):
                continue
            issues = []
            for item in parsed:
                if not isinstance(item, dict):
                    continue
                # Require all three keys; coerce line to int defensively
                if not {"line", "problem", "hint"}.issubset(item.keys()):
                    continue
                issues.append({
                    "line": int(item["line"]),
                    "problem": str(item["problem"]),
                    "hint": str(item["hint"]),
                })
            return issues
        except (json.JSONDecodeError, ValueError):
            continue

    # Model returned something unparseable — return no issues rather than crash
    return []


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_code(code: str, language: str = "python") -> dict:
    """
    Analyze *code* (written in *language*) and return real issues.

    Return shape:
        {
            "issues": [
                {"line": <int>, "problem": "<str>", "hint": "<str>"},
                ...
            ]
        }
    """
    numbered = _number_lines(code)
    user_message = f"Language: {language}\n\n{numbered}"

    raw = generate(_SYSTEM_PROMPT, user_message)
    issues = _parse_issues(raw)

    return {"issues": issues}

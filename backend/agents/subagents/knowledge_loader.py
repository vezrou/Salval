"""
Loads knowledge base markdown files for each agent.

Files live in backend/knowledge/ relative to this package.
Each agent calls load() with its specific filename and gets
shared.md + its own file concatenated.
"""

import pathlib

_KNOWLEDGE_DIR = pathlib.Path(__file__).parent.parent.parent / "knowledge"


def load(agent_file: str) -> str:
    """
    Return the contents of shared.md and agent_file concatenated.
    If a file is missing, that section is silently skipped so a
    missing knowledge file never crashes the server.
    """
    parts = []
    for filename in ("shared.md", agent_file):
        path = _KNOWLEDGE_DIR / filename
        if path.exists():
            parts.append(path.read_text(encoding="utf-8"))
    return "\n\n---\n\n".join(parts)

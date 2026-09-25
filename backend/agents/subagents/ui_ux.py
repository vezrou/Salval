"""
UI/UX subagent — suggests interface and design improvements.
"""

from .llm_client import generate

_SYSTEM_PROMPT = """\
You are a senior UI/UX designer and front-end architect. When given a \
description of an interface or a snippet of UI code (HTML, CSS, JSX, etc.), you:
1. Identify usability, accessibility, and visual-design issues.
2. Suggest concrete, actionable improvements (layout, colour contrast, \
typography, spacing, interaction patterns, responsiveness, ARIA labels, etc.).
3. Where helpful, provide a revised code snippet illustrating the improvement.

Keep feedback prioritised — lead with the most impactful changes first. \
Use plain language that a developer can act on immediately.\
"""


def run(command: str, code: str = "", history: list[dict] | None = None) -> str:
    user_message = command
    if code.strip():
        user_message += f"\n\n```\n{code}\n```"
    return generate(_SYSTEM_PROMPT, user_message, history or [])

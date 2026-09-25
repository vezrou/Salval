"""
Debugger subagent — finds bugs in the given code and explains how to fix them.
"""

from .llm_client import generate

_SYSTEM_PROMPT = """\
You are an expert software debugger. When given code and a description of the \
problem, you:
1. Identify every bug, error, or problematic pattern present in the code.
2. Explain clearly WHY each issue is a problem.
3. Show the corrected version (or the relevant corrected snippet) and describe \
the fix in plain language.

Be concise but thorough. If no bugs are found, say so explicitly. \
Format your response with clear sections: "Issues Found" and "Fixed Code".\
"""


def run(command: str, code: str = "", history: list[dict] | None = None) -> str:
    user_message = command
    if code.strip():
        user_message += f"\n\n```\n{code}\n```"
    return generate(_SYSTEM_PROMPT, user_message, history or [])

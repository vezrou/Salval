from agents.subagents import debugger, ui_ux, coder, architect

_subagents = {
    "debug": debugger.run,
    "ui": ui_ux.run,
    "code": coder.run,
    "architect": architect.run,
}

_subagent_names = {
    "debug": "Salma",
    "ui": "Valerie",
    "code": "Leo",
    "architect": "Aria",
}


def classify(command: str) -> str:
    """
    Use Gemini to classify the command into one of the four subagent categories.
    Falls back to keyword matching if the LLM call fails.
    """
    from agents.subagents.llm_client import generate

    system_prompt = (
        "You are a request classifier for a developer assistant. "
        "Given a developer's message, respond with EXACTLY one of these words "
        "and nothing else: debug, ui, code, architect.\n\n"
        "Use these rules:\n"
        "- debug: fixing errors, bugs, crashes, exceptions, stack traces\n"
        "- ui: interface design, layout, CSS, colours, UX, accessibility, components\n"
        "- architect: project structure, folder layout, tech stack choice, design patterns, "
        "scalability, microservices, system design, how to start a project\n"
        "- code: everything else — writing new code, code review, algorithms, APIs, logic"
    )

    try:
        label = generate(system_prompt, command).strip().lower()
        if label in _subagents:
            return label
    except Exception:
        pass

    # Keyword fallback
    c = command.lower()
    if any(w in c for w in ["error", "bug", "fix", "crash", "exception", "traceback"]):
        return "debug"
    if any(w in c for w in ["design", "ui", "layout", "color", "colour", "ux", "css", "style"]):
        return "ui"
    if any(w in c for w in ["architect", "structure", "folder", "scaffold", "stack", "pattern",
                             "microservice", "monolith", "system design", "how to start"]):
        return "architect"
    return "code"


def main_agent(command: str, code: str = "", history: list[dict] | None = None) -> dict:
    choice = classify(command)
    result = _subagents[choice](command, code, history or [])
    return {
        "routed_to": choice,
        "agent_name": _subagent_names[choice],
        "result": result,
    }

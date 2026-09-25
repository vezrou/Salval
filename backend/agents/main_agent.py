from agents.subagents import debugger, ui_ux, coder

subagents = {
    "debug": debugger.run,
    "ui": ui_ux.run,
    "code": coder.run,
}

def classify(command: str) -> str:
    c = command.lower()
    if any(w in c for w in ["error", "bug", "fix", "crash"]):
        return "debug"
    if any(w in c for w in ["design", "ui", "layout", "color", "ux" ]):
         return "ui"
    return "code"
def main_agent(command: str, code: str = "") -> dict:
    choice = classify(command)
    result = subagents[choice](command, code)
    return{"routed_to": choice, "result": result}
    
            
    
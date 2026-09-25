# SalVal Backend: API Contract

**Base URL (local):** `http://127.0.0.1:8000`
**Live test page:**`http://127.0.0.1:8000/docs`

## Run the backend

```bash
pip install -r requirements.txt
univcorn main:app --reload
```
## POST /build  (Section 1: "Build with the right agent")

Request:
```json
{"command": "fix this error", "code": "print('hi'"}
```

Response:
```json
{"routed_to": "debug", "agent_name": "Salma", "result": "..."}
```

- `command`: what the developer wants (required)
- `code`: the developer's code (optional, can be `""`)
- `routed_to`: which subagent answered: `debug`, `ui`, or `code`
- `agent_name`: the display name of the subagent that answered (e.g. "Salma", "Valeria", "Leo")
- `result`: the subagent's answer, as text

## POST /assist  (Section 2: "Understand the codebase")

Request:
```json
{"code": "print('hi'", "language": "python"}
```

Response:
```json
{
  "issues": [
    {"line": 1, "problem": "...", "hint": "..."}
  ]
}
```

- `line`: line number where the AI icon should appear
- `problem`: what is wrong
- `hint`: what the developer should write to fix it

## Notes

- Field names must match exactly: `command`, `code`, `language`.
- Currently the responses are placeholders. Real AI will be connected during the hackathon, but the format will stay the same.

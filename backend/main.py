# Connecting everything
from dotenv import load_dotenv
load_dotenv()

import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.main_agent import main_agent
from agents.assistant import check_code

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory session store
# Each session holds a list of Gemini-compatible history entries:
#   {"role": "user" | "model", "parts": [{"text": "..."}]}
# Sessions are kept for the lifetime of the server process. For persistence
# across restarts, swap this dict for a Redis or database store.
# ---------------------------------------------------------------------------
_sessions: dict[str, list[dict]] = {}
_MAX_HISTORY = 20  # keep last 20 turns (10 exchanges) to stay within token limits


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class BuildRequest(BaseModel):
    command: str
    code: str = ""
    session_id: str = ""   # optional; server creates one if blank


class CodeCheck(BaseModel):
    code: str
    language: str = "python"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/build")
def build(req: BuildRequest):
    # Resolve or create a session
    sid = req.session_id.strip() or str(uuid.uuid4())
    history = _sessions.get(sid, [])

    response = main_agent(req.command, req.code, history)

    # Append this exchange to the session history (Gemini format)
    history.append({"role": "user",  "parts": [{"text": req.command}]})
    history.append({"role": "model", "parts": [{"text": response["result"]}]})

    # Trim to keep only the most recent _MAX_HISTORY entries
    _sessions[sid] = history[-_MAX_HISTORY:]

    return {**response, "session_id": sid}


@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/assist")
def assist(req: CodeCheck):
    return check_code(req.code, req.language)

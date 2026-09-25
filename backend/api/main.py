# Connecting everything
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.assistant import check_code
from agents.main_agent import main_agent


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class BuildRequest(BaseModel):
    command: str
    code: str = ""


class CodeCheck(BaseModel):
    code: str
    language: str = "python"


@app.post("/build")
def build(req: BuildRequest):
    return main_agent(req.command, req.code)


@app.post("/assist")
def assist(req: CodeCheck):
    return check_code(req.code, req.language)

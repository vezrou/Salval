#Connecting everything
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from pydantic import BaseModel
from agents.main_agent import main_agent
from agents.assistant import check_code

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

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

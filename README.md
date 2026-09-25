# SALVAL

SALVAL is a React demo with a FastAPI chat endpoint and a small agent router.

## Project structure

- `frontend/` contains the React, Vite, styles, and static assets.
- `backend/api/main.py` is the FastAPI app used by the chat. It calls the
  agent router in `backend/agents/`.
- `backend/requirements.txt` lists the Python dependencies.

## Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

## Run the demo API

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn api.main:app --reload
```

The Vite development server proxies `/api` requests to `http://127.0.0.1:8000`.
The agent replies are placeholders for now; no model or database is connected.

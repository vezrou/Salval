# SALVAL API

Run from this directory with `python -m uvicorn main:app --reload` after installing `requirements.txt` and setting `OPENAI_API_KEY` in `.env`. Interactive API docs: http://127.0.0.1:8000/docs.

- `GET /ping`: health response `{"status":"ok"}`.
- `POST /analyze`: accepts `repo_url`, optional `token`, optional `session_id`. Returns `session_id`, `files_analyzed`, and a context snapshot with `stack`, `components`, `hooks`, `utilities`, `css_tokens`, `patterns`, `summary`, and sampled `files`. A successful scan resets history; failed analysis preserves existing context.
- `POST /build`: accepts `command`, optional `code`, optional `session_id`. Returns `routed_to`, `agent_name`, `result`, and `session_id`. Pass the analysis session ID to use its context. Routes: `debug`, `ui`, `code`, `architect`, `frontend`. Unknown session IDs return 409 so lost context is not silently ignored.
- `POST /assist`: accepts `code` and optional `language`; returns an `issues` array of `line`, `problem`, and `hint`.

Only repository root URLs are supported, using the default branch. Analysis samples at most 60 eligible files / 180 KB of source. Sessions are process-local, so run one persistent worker for the demo. See the root README for limitations and tests.

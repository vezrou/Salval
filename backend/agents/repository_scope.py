"""Best-effort file roles for frontend-first repository sampling."""

from pathlib import PurePosixPath

BACKEND_EXTENSIONS = {".py", ".go", ".rb", ".php", ".java", ".cs", ".rs"}


def file_scope(path: str) -> str:
    file = PurePosixPath(path.lower())
    parts = file.parts
    # API client helpers under frontend/src/api are still frontend code.
    server_path = any(part in {"backend", "server", "servers"} for part in parts[:-1])
    server_route = (
        "pages/api/" in file.as_posix()
        or ("app" in parts and file.name in {"route.ts", "route.js"})
        or file.name.startswith("+server.")
        or ".server." in file.name
        or (parts and parts[0] == "api")
    )
    if server_path or server_route or file.suffix in BACKEND_EXTENSIONS:
        return "backend"
    return "frontend"

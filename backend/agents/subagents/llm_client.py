"""
Thin wrapper around Google Gemini text generation.

Reads credentials from environment variables (or a .env file loaded
by load_dotenv() in main.py):

    GEMINI_API_KEY – Google AI Studio API key
                     Get one free at https://aistudio.google.com/apikey
"""

import os
import time
from google import genai
from google.genai import types
from google.genai.errors import ServerError

_MODELS = [
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite",   # fallback if primary is overloaded
]
_MAX_RETRIES = 3
_RETRY_DELAY = 2  # seconds between retries on 503


def generate(system_prompt: str, user_message: str, history: list[dict] | None = None) -> str:
    """
    Call Gemini with a system prompt, optional prior conversation history,
    and the latest user message. Returns the model's reply as plain text.

    Retries up to _MAX_RETRIES times on 503 (Gemini overload) before giving up.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY must be set before calling the subagents."
        )

    client = genai.Client(api_key=api_key)

    # Convert history to the SDK's Content objects
    gemini_history = [
        types.Content(
            role=entry["role"],
            parts=[types.Part(text=p["text"]) for p in entry["parts"]],
        )
        for entry in (history or [])
    ]

    # Build the full contents list: history + new user turn
    contents = gemini_history + [
        types.Content(role="user", parts=[types.Part(text=user_message)])
    ]

    last_error = None
    for model in _MODELS:
        for attempt in range(_MAX_RETRIES):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(system_instruction=system_prompt),
                )
                return response.text.strip()
            except ServerError as e:
                last_error = e
                is_503 = getattr(e, 'code', None) == 503 or '503' in str(e)
                if is_503 and attempt < _MAX_RETRIES - 1:
                    time.sleep(_RETRY_DELAY * (attempt + 1))
                    continue
                break  # try next model
            except Exception as e:
                last_error = e
                break

    raise RuntimeError(
        "Gemini is experiencing high demand right now. Please try again in a moment."
    ) from last_error

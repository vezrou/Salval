"""
Thin wrapper around Google Gemini text generation.

Reads credentials from environment variables (or a .env file loaded
by load_dotenv() in main.py):

    GEMINI_API_KEY – Google AI Studio API key
                     Get one free at https://aistudio.google.com/apikey
"""

import os
from google import genai
from google.genai import types

_MODEL_ID = "gemini-2.5-flash-preview-05-20"


def generate(system_prompt: str, user_message: str, history: list[dict] | None = None) -> str:
    """
    Call Gemini with a system prompt, optional prior conversation history,
    and the latest user message. Returns the model's reply as plain text.

    history entries must follow the shape:
        {"role": "user" | "model", "parts": [{"text": "..."}]}
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

    response = client.models.generate_content(
        model=_MODEL_ID,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=system_prompt),
    )

    return response.text.strip()

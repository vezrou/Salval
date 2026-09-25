"""
Thin wrapper around Google Gemini text generation.

Reads credentials from environment variables (or a .env file loaded
by load_dotenv() in main.py):

    GEMINI_API_KEY – Google AI Studio API key
                     Get one free at https://aistudio.google.com/apikey
"""

import os
import google.generativeai as genai

_MODEL_ID = "gemini-3.8-flash"


def generate(system_prompt: str, user_message: str) -> str:
    """
    Call Gemini with a system prompt + user message and return the reply.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY must be set before calling the subagents."
        )

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=_MODEL_ID,
        system_instruction=system_prompt,
    )

    response = model.generate_content(user_message)
    return response.text.strip()

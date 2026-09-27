"""
Thin wrapper around OpenAI text generation.

Reads credentials from environment variables (or a .env file loaded
by load_dotenv() in main.py):

    OPENAI_API_KEY – OpenAI API key
                     Get one at https://platform.openai.com/api-keys
"""

import os
import time
from openai import OpenAI, RateLimitError, APIStatusError

_MODELS = [
    "gpt-4o-mini",   # cheapest / highest quota
    "gpt-4o",        # fallback 1
    "gpt-3.5-turbo", # fallback 2 — oldest, almost never rate-limited
]
_MAX_RETRIES = 2
_RETRY_DELAY = 1  # seconds between retries on rate-limit / overload


def generate(system_prompt: str, user_message: str, history: list[dict] | None = None) -> str:
    """
    Call OpenAI with a system prompt, optional prior conversation history,
    and the latest user message. Returns the model's reply as plain text.

    History entries must follow the OpenAI format:
        {"role": "user" | "assistant", "content": "..."}

    Retries up to _MAX_RETRIES times on 429 / 503 before moving to the next
    model in the fallback chain.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY must be set before calling the subagents."
        )

    client = OpenAI(api_key=api_key, timeout=45, max_retries=0)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": user_message})

    last_error = None
    for model in _MODELS:
        for attempt in range(_MAX_RETRIES):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                )
                return response.choices[0].message.content.strip()
            except (RateLimitError, APIStatusError) as e:
                last_error = e
                status = getattr(e, "status_code", None)
                if status in (429, 503) and attempt < _MAX_RETRIES - 1:
                    time.sleep(_RETRY_DELAY * (attempt + 1))
                    continue
                break  # move to next model
            except Exception as e:
                last_error = e
                break  # move to next model

    raise RuntimeError(
        "OpenAI is experiencing high demand right now. Please try again in a moment."
    ) from last_error

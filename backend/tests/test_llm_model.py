import os

os.environ.setdefault("GROQ_API_KEY", "test-key-not-used")

from app.services import llm_service  # noqa: E402


def test_routes_through_a_supported_model():
    # llama-3.3-70b-versatile was retired by Groq for non-enterprise accounts.
    assert llm_service.MODEL == "openai/gpt-oss-20b"

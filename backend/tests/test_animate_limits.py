import os

os.environ.setdefault("GROQ_API_KEY", "test-key-not-used")  # the LLM call is stubbed below

from fastapi.testclient import TestClient  # noqa: E402

import app.main as main  # noqa: E402
from app.core.rate_limit import SlidingWindowLimiter  # noqa: E402


def _stub(command):
    return {"animation": "Wave", "explanation": "stubbed, no Groq call"}


def _client(monkeypatch, per_client=20, daily=900):
    monkeypatch.setattr(main, "determine_animation_state", _stub)
    monkeypatch.setattr(main, "PER_CLIENT", SlidingWindowLimiter(limit=per_client, window_s=60))
    monkeypatch.setattr(main, "GLOBAL_DAILY", SlidingWindowLimiter(limit=daily, window_s=86_400))
    return TestClient(main.app)


def _animate(client, ip):
    return client.post("/animate", json={"command": "wave"}, headers={"x-forwarded-for": ip})


def test_per_client_cap_returns_429_with_a_kind_message(monkeypatch):
    client = _client(monkeypatch, per_client=3)
    codes = [_animate(client, "203.0.113.1").status_code for _ in range(4)]
    assert codes == [200, 200, 200, 429]
    assert "busy" in _animate(client, "203.0.113.1").json()["detail"]


def test_another_client_is_not_blocked_by_the_first(monkeypatch):
    client = _client(monkeypatch, per_client=1)
    assert _animate(client, "203.0.113.1").status_code == 200
    assert _animate(client, "203.0.113.2").status_code == 200


def test_global_cap_holds_whatever_the_caller_claims(monkeypatch):
    client = _client(monkeypatch, per_client=100, daily=2)
    codes = [_animate(client, f"198.51.100.{i}").status_code for i in range(3)]
    assert codes == [200, 200, 429]


def test_cors_only_admits_the_live_ui(monkeypatch):
    client = _client(monkeypatch)
    preflight = {"Access-Control-Request-Method": "POST"}
    ok = client.options("/animate", headers={"Origin": "https://avatar-pipeline.vercel.app", **preflight})
    evil = client.options("/animate", headers={"Origin": "https://evil.example", **preflight})
    assert ok.headers.get("access-control-allow-origin") == "https://avatar-pipeline.vercel.app"
    assert "access-control-allow-origin" not in evil.headers

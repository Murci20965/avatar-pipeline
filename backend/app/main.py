from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.rate_limit import SlidingWindowLimiter, client_key
from app.models.schemas import AnimationRequest, AnimationResponse
from app.services.llm_service import determine_animation_state

app = FastAPI(title="Avatar-Pipeline Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://avatar-pipeline.vercel.app"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get_root():
    print("Root endpoint accessed.", flush=True)
    return {
        "service": "Avatar-Pipeline Engine",
        "status": "online",
        "version": "1.0.0",
        "description": "AI-Driven Interaction Engine - Backend API is active."
    }

@app.get("/health")
def health_check():
    print("Health check endpoint accessed.", flush=True)
    return {"status": "healthy", "service": "avatar-pipeline-backend"}

# Every /animate call spends Groq credits. The global cap stays under Groq's
# free tier (1,000 requests/day) whatever callers claim to be; the per-client
# cap is a best-effort brake (see app/core/rate_limit.py).
PER_CLIENT = SlidingWindowLimiter(limit=20, window_s=60)
GLOBAL_DAILY = SlidingWindowLimiter(limit=900, window_s=86_400)
BUSY = "The coach is busy right now. Try again in a minute."


@app.post("/animate", response_model=AnimationResponse)
def animate_avatar(request: AnimationRequest, http: Request):
    if not PER_CLIENT.allow(client_key(http)) or not GLOBAL_DAILY.allow("all"):
        raise HTTPException(status_code=429, detail=BUSY)
    print(f"Received animation request: {request.command}", flush=True)
    
    response_data = determine_animation_state(request.command)
    
    return response_data

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import AnimationRequest, AnimationResponse
from app.services.llm_service import determine_animation_state

app = FastAPI(title="Avatar-Pipeline Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/animate", response_model=AnimationResponse)
def animate_avatar(request: AnimationRequest):
    print(f"Received animation request: {request.command}", flush=True)
    
    response_data = determine_animation_state(request.command)
    
    return response_data
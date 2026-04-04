from pydantic import BaseModel, Field
from typing import Literal

class AnimationRequest(BaseModel):
    command: str = Field(..., description="The unstructured text command from the learner.")

class AnimationResponse(BaseModel):
    # The absolute master list of all 14 Robot animations
    animation: Literal[
        "Dance", "Death", "Idle", "Jump", "No", "Punch", 
        "Running", "Sitting", "Standing", "ThumbsUp", 
        "Walking", "WalkJump", "Wave", "Yes"
    ] = Field(
        ..., 
        description="The exact 3D bone animation state mapped from the user command."
    )
    explanation: str = Field(
        ..., 
        description="A short educational rationale explaining the chosen action."
    )
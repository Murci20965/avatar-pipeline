import json
from groq import Groq
from app.core.config import settings
from app.models.schemas import AnimationResponse

client = Groq(api_key=settings.GROQ_API_KEY)

def determine_animation_state(user_command: str) -> AnimationResponse:
    print(f"Processing command: '{user_command}'", flush=True)
    
    system_prompt = """
    You are an AI learning coach backend system. Your ONLY job is to map the user's input 
    to one of the exact 3D animation states supported by the WebGL engine.
    
    Supported States:
    "Dance", "Death", "Idle", "Jump", "No", "Punch", "Running", "Sitting", "Standing", "ThumbsUp", "Walking", "WalkJump", "Wave", "Yes"
    
    Rules for mapping:
    1. Greeting -> "Wave"
    2. Confirming safety or agreeing -> "ThumbsUp" or "Yes"
    3. Denying, rejecting, or unsafe actions -> "No"
    4. Moving slowly -> "Walking"
    5. Moving fast or emergency -> "Running"
    6. Asking to strike or break something -> "Punch"
    7. Asking to celebrate or success -> "Dance"
    8. Asking to rest or wait -> "Sitting"
    9. Getting up from a rest -> "Standing"
    10. Asking to jump or dodge -> "Jump" or "WalkJump"
    11. Shutting down, fatal error, or critical failure -> "Death"
    12. For anything else or if unsure -> "Idle"
    
    You must respond in pure JSON format matching this schema:
    {
        "animation": "Exact Animation Name",
        "explanation": "A strict, short 1-sentence educational explanation of why you chose this action."
    }
    """

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_command}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.0
        )
        
        raw_json = response.choices[0].message.content
        parsed_data = json.loads(raw_json)
        
        return AnimationResponse(**parsed_data)
        
    except Exception as e:
        print(f"LLM Routing Error: {str(e)}", flush=True)
        return AnimationResponse(
            animation="Idle",
            explanation="I encountered an error processing your request, so I am standing by."
        )
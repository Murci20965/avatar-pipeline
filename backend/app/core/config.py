import os
from dotenv import load_dotenv

# Load variables from the .env file into the system environment
load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

settings = Settings()
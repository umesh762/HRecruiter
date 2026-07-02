import os
from dotenv import load_dotenv

load_dotenv()

WXO_API_KEY = os.getenv("WXO_API_KEY")
WXO_INSTANCE_URL = os.getenv("WXO_INSTANCE_URL")
WXO_AGENT_ID = os.getenv("WXO_AGENT_ID")
WXO_ENVIRONMENT_ID = os.getenv("WXO_ENVIRONMENT_ID")

if not all([WXO_API_KEY, WXO_INSTANCE_URL, WXO_AGENT_ID, WXO_ENVIRONMENT_ID]):
    print("Warning: Missing some IBM watsonx Orchestrate environment variables. Check your .env file.")

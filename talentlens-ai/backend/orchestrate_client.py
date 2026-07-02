import httpx
import json
import re
import logging
from typing import List, Dict, Any
from config import WXO_API_KEY, WXO_INSTANCE_URL, WXO_AGENT_ID, WXO_ENVIRONMENT_ID

logger = logging.getLogger(__name__)

_cached_token = None

async def get_bearer_token() -> str:
    """
    Generate a fresh bearer token using the IBM Cloud IAM API Key.
    """
    global _cached_token
    
    url = "https://iam.cloud.ibm.com/identity/token"
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": WXO_API_KEY
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    
    logger.info("Fetching IAM bearer token...")
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, headers=headers, timeout=15.0)
        logger.info(f"IAM token response status: {response.status_code}")
        response.raise_for_status()
        token_data = response.json()
        _cached_token = token_data.get("access_token")
        if not _cached_token:
            raise Exception(f"IAM token response missing access_token. Keys: {list(token_data.keys())}")
        logger.info("IAM bearer token fetched successfully.")
        return _cached_token


def strip_markdown_fences(text: str) -> str:
    """
    Strip markdown code fences like ```json ... ``` or ``` ... ``` from agent output.
    """
    text = text.strip()
    # Remove ```json or ``` at the start
    if text.startswith("```"):
        # Remove the opening fence (first line)
        text = re.sub(r'^```[a-zA-Z]*\n?', '', text)
        # Remove the closing fence
        text = re.sub(r'\n?```$', '', text.rstrip())
    return text.strip()


def fallback_parser(text: str) -> List[Dict[str, Any]]:
    """
    Fallback parser using regex to extract candidate data if the agent 
    doesn't return clean JSON.
    """
    # Try to find a JSON array in the text
    json_match = re.search(r'\[.*\]', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass
            
    logger.warning("Could not parse JSON from agent response. Returning empty list.")
    return []


async def rank_candidates(job_description: str, candidates: List[str]) -> Dict[str, Any]:
    """
    Calls the watsonx Orchestrate agent to rank the candidates based on the job description.
    """
    token = await get_bearer_token()
    
    # Constructing prompt
    candidates_text = "\n\n".join([f"Candidate {i+1}:\n{c}" for i, c in enumerate(candidates)])
    prompt = (
        f"Job Description:\n{job_description}\n\n"
        f"Candidates:\n{candidates_text}\n\n"
        f"Please rank these candidates against the job description. "
        f"Return the response strictly as a JSON array of objects with keys: "
        f"rank, name, final_score, semantic_score, attribute_score, signal_score, rationale."
    )

    url = f"{WXO_INSTANCE_URL.rstrip('/')}/v1/orchestrate/{WXO_AGENT_ID}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "model": WXO_AGENT_ID,
        "environment_id": WXO_ENVIRONMENT_ID,
        "stream": False,  # Force non-streaming JSON response (default is SSE)
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    logger.info(f"Calling Watsonx Orchestrate API at {url}")
    
    # Retry logic (1 retry on failure)
    for attempt in range(2):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=120.0)
                logger.info(f"Watsonx response status: {response.status_code}")
                logger.info(f"Watsonx content-type: {response.headers.get('content-type', 'unknown')}")
                
                # Guard: if response is not JSON (e.g. still streaming), handle gracefully
                content_type = response.headers.get("content-type", "")
                if "event-stream" in content_type or "text/plain" in content_type:
                    raise Exception(
                        f"Watsonx returned streaming/unexpected response (content-type: {content_type}). "
                        "Expected application/json."
                    )
                
                response.raise_for_status()
                data = response.json()
                logger.info(f"Watsonx response JSON keys: {list(data.keys())}")
                
                # Extract the text content from the agent
                choices = data.get("choices", [])
                if not choices:
                    raise Exception(f"Watsonx response has no choices. Full response: {data}")
                
                content = choices[0].get("message", {}).get("content", "")
                logger.info(f"Agent content (first 200 chars): {content[:200]}")
                
                # Parse JSON from agent content
                try:
                    # Strip markdown code fences before parsing
                    clean_content = strip_markdown_fences(content)
                    parsed_candidates = json.loads(clean_content)
                    if isinstance(parsed_candidates, dict) and "ranked_candidates" in parsed_candidates:
                        parsed_candidates = parsed_candidates["ranked_candidates"]
                except json.JSONDecodeError:
                    logger.warning("Agent content is not valid JSON, using fallback parser.")
                    parsed_candidates = fallback_parser(content)
                    
                return {"ranked_candidates": parsed_candidates}
                
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {type(e).__name__}: {e}")
            if attempt == 1:
                raise Exception(f"Failed to communicate with Watsonx Orchestrate API: {str(e)}")
            logger.info("Retrying after first failure...")
            
    return {"ranked_candidates": []}

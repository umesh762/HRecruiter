from pydantic import BaseModel
from typing import List

class RankRequest(BaseModel):
    job_description: str
    candidates: List[str]

class RankedCandidate(BaseModel):
    rank: int
    name: str
    final_score: float
    semantic_score: float
    attribute_score: float
    signal_score: float
    rationale: str

class RankResponse(BaseModel):
    ranked_candidates: List[RankedCandidate]

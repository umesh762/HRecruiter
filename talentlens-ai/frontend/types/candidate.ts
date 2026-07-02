export interface RankedCandidate {
  rank: number;
  name: string;
  final_score: number;
  semantic_score: number;
  attribute_score: number;
  signal_score: number;
  rationale: string;
}

export interface RankResponse {
  ranked_candidates: RankedCandidate[];
}

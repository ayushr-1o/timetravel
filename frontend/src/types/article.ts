export type Claim = {
  claim_text: string
  sensitivity: 'low' | 'medium' | 'high'
  freshness_score: number
  analysis_notes: string
  sources: {
    title: string
    url: string
    relevance_note: string
  }[]
}

export type Article = {
  id: string
  created_at: string
  raw_text: string
  source: string | null
  published_at: string | null
  status: 'pending' | 'done' | 'error'
  extracted_claims: Claim[]
  processed_at: string | null
}
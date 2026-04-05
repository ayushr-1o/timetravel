import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Article, Claim } from '../types/article'

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'article' | 'claims'>('article')

  useEffect(() => {
    if (!id) {
      navigate('/')
      return
    }

    async function fetchArticle() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Fetch error:', error)
        return
      }
      setArticle(data)
      setLoading(false)
    }

    fetchArticle()
  }, [id, navigate])

  const extractClaims = async () => {
    if (!article || article.status !== 'pending') return

    setProcessing(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/extract-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: id })
      })

      if (!response.ok) throw new Error('Backend failed')

      // Refresh
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()
      
      setArticle(data)
    } catch (error) {
      console.error('Extract error:', error)
      alert('Claim extraction failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#999' }}>
        Loading article...
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#999' }}>
        Article not found
      </div>
    )
  }

  const claims = article.extracted_claims || []

  return (
    <div style={{ padding: '2.5rem max(2rem, 5vw) 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2.5rem' 
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            color: '#666',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontWeight: 500
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{
          padding: '0.4rem 1rem',
          background: article.status === 'done' ? '#d1fae5' : '#fef3c7',
          color: article.status === 'done' ? '#059669' : '#d97706',
          borderRadius: '20px',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          {article.status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left: Article Content */}
        <div style={{ flex: 1, maxWidth: '700px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              fontSize: '1rem', 
              color: '#666', 
              marginBottom: '0.75rem',
              fontWeight: 500 
            }}>
              {article.source?.replace('https://www.', '') || 'No source'}
            </div>
            <div style={{
              lineHeight: 1.7,
              color: '#333',
              fontSize: '1rem',
              maxHeight: '500px',
              overflow: 'auto'
            }}>
              {article.raw_text || 'Article text will appear after extraction...'}
            </div>
          </div>

          {article.status === 'pending' && (
            <button
              onClick={extractClaims}
              disabled={processing}
              style={{
                width: '100%',
                padding: '1.25rem 2rem',
                background: processing ? '#9ca3af' : '#e03e3e',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? 'Extracting Claims...' : '🚀 Extract Claims with AI'}
            </button>
          )}
        </div>

        {/* Right: Claims Sidebar */}
        <div style={{ width: '380px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.75rem',
              borderBottom: '1px solid #eee',
              paddingBottom: '1rem'
            }}>
              <button
                onClick={() => setSelectedTab('article')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: selectedTab === 'article' ? '#e03e3e' : '#f3f4f6',
                  color: selectedTab === 'article' ? '#fff' : '#666',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Article
              </button>
              <button
                onClick={() => setSelectedTab('claims')}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: selectedTab === 'claims' ? '#e03e3e' : '#f3f4f6',
                  color: selectedTab === 'claims' ? '#fff' : '#666',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Claims ({claims.length})
              </button>
            </div>

            {selectedTab === 'claims' && claims.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {claims.map((claim: Claim, index: number) => (
                  <div key={index} style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${
                      claim.sensitivity === 'high' ? '#ef4444' :
                      claim.sensitivity === 'medium' ? '#f59e0b' : '#10b981'
                    }`
                  }}>
                    <div style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      marginBottom: '0.75rem',
                      color: '#111',
                      fontWeight: 500
                    }}>
                      "{claim.claim_text}"
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: '#fef3c7',
                        color: '#d97706',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {claim.sensitivity}
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f0fdf4',
                        color: '#059669',
                        borderRadius: '20px',
                        fontSize: '0.75rem'
                      }}>
                        {Math.round(claim.freshness_score * 100)}% fresh
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#666',
                      lineHeight: 1.4 
                    }}>
                      {claim.analysis_notes}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedTab === 'claims' ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
                <p>No claims extracted yet</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Click "Extract Claims" to analyze this article
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
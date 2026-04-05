import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { API_URL } from '../config';

export default function SubmitArticle() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          raw_text: `URL: ${url}`,
          source: url,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      navigate(`/articles/${data.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit article')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2.5rem max(2rem, 5vw) 2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            color: '#666',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid #eee'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#111',
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          Submit Article
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem'
        }}>
          Paste any news article URL. We'll extract claims automatically.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: '#333'
            }}>
              Article URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.bbc.com/news/..."
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                background: '#fafafa',
                color: '#111',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e03e3e'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            style={{
              width: '100%',
              padding: '1.25rem 2rem',
              background: loading || !url.trim() ? '#9ca3af' : '#e03e3e',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Submitting...' : '🚀 Extract Claims with AI'}
          </button>
        </form>

        <div style={{
          marginTop: '3rem',
          padding: '1.75rem',
          background: '#f8fafc',
          borderRadius: '12px',
          borderLeft: '4px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '2rem' }}>⚡</div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>
              How it works
            </h3>
            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
              1. Paste URL → 2. AI scrapes text → 3. GPT extracts claims → 4. Review & verify
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
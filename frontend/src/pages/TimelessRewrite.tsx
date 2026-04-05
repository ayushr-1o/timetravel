import { useState } from 'react'
import { API_URL } from '../lib/api'

export default function TimelessRewrite() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRewrite = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/timeless-rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      })
      const data = await res.json()
      setOutput(data.rewritten)
    } catch (e) {
      setOutput('Error: rewrite failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Timeless Rewrite</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Paste an excerpt and AI will rewrite it to remove time-sensitive language.
      </p>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your excerpt here..."
        rows={8}
        style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.95rem', marginBottom: '1rem' }}
      />

      <button
        onClick={handleRewrite}
        disabled={loading || !input.trim()}
        style={{ background: '#e03e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.4rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !input.trim() ? 0.6 : 1 }}
      >
        {loading ? 'Rewriting...' : 'Rewrite'}
      </button>

      {output && (
        <div style={{ marginTop: '2rem', background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Timeless Version</div>
          <p style={{ color: '#333', lineHeight: 1.7 }}>{output}</p>
          <button
            onClick={() => navigator.clipboard.writeText(output)}
            style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', color: '#666' }}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  )
}
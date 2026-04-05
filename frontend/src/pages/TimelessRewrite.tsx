import { useState } from 'react'
import { API_URL } from '../lib/api'

type DiffLine = {
  type: 'removed' | 'added'
  text: string
}

export default function TimelessRewrite() {
  const [input, setInput] = useState('')
  const [original, setOriginal] = useState('')
  const [output, setOutput] = useState('')
  const [changed, setChanged] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [diffLines, setDiffLines] = useState<DiffLine[]>([])
  const [loading, setLoading] = useState(false)

  const handleRewrite = async () => {
    setLoading(true)
    setMessage('')
    setDiffLines([])
    setChanged(null)

    try {
      const res = await fetch(`${API_URL}/timeless-rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      })

      const data = await res.json()
      setOriginal(data.original)
      setOutput(data.rewritten)
      setChanged(data.changed)
      setMessage(data.message)
      setDiffLines(data.diff_lines || [])
    } catch (e) {
      setMessage('Rewrite failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Timeless Rewrite
      </h1>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Paste an excerpt and it will be rewritten to feel less tied to a specific moment in time.
      </p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your excerpt here..."
        rows={8}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: 8,
          border: '1px solid #ddd',
          fontSize: '0.95rem',
          marginBottom: '1rem'
        }}
      />

      <button
        onClick={handleRewrite}
        disabled={loading || !input.trim()}
        style={{
          background: '#e03e3e',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '0.6rem 1.4rem',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: loading || !input.trim() ? 0.6 : 1
        }}
      >
        {loading ? 'Rewriting...' : 'Rewrite'}
      </button>

      {message && (
        <div style={{
          marginTop: '1.5rem',
          padding: '0.9rem 1rem',
          borderRadius: 8,
          background: changed ? '#eefaf4' : '#f5f5f5',
          color: changed ? '#13795b' : '#555',
          border: changed ? '1px solid #b7ebd0' : '1px solid #ddd'
        }}>
          {message}
        </div>
      )}

      {original && (
        <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Original</div>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{original}</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Timeless Version</div>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{output}</p>
          </div>

          {changed && diffLines.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>What changed</div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {diffLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.8rem',
                      borderRadius: 6,
                      background: line.type === 'removed' ? '#fff1f0' : '#f6ffed',
                      border: line.type === 'removed' ? '1px solid #ffccc7' : '1px solid #b7eb8f',
                      color: '#333',
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    <strong>{line.type === 'removed' ? 'Before:' : 'After:'}</strong> {line.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/health')
      .then(r => r.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false))
  }, [])

  const navLink = (label: string, path: string) => {
    const active = location.pathname === path
    return (
      <button
        onClick={() => navigate(path)}
        style={{
          background: active ? '#111' : 'none',
          color: active ? '#fff' : '#666',
          border: 'none',
          borderRadius: '6px',
          padding: '0.4rem 0.9rem',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      {/* Navbar */}
      <nav style={{
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '52px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontWeight: 700, 
            fontSize: '1.1rem', 
            color: '#fff' 
          }}>
            <span style={{ fontSize: '1.1rem' }}>⊙</span>
            <span>Time</span>
            <span style={{ color: '#e03e3e' }}>travel</span>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {navLink('Dashboard', '/')}
            {navLink('Claim Review', '/review')}
            {navLink('Time Sensitive', '/time-sensitive')}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontSize: '0.8rem', 
            color: apiOnline ? '#6daa45' : '#e03e3e' 
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: apiOnline ? '#6daa45' : '#e03e3e'
            }} />
            {apiOnline ? 'API online' : 'API offline'}
          </div>
          <button
            onClick={() => navigate('/submit')}
            style={{
              background: '#e03e3e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 1rem',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            + Submit Article
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ padding: '0 max(2rem, 5vw)' }}>
        {children}
      </main>
    </div>
  )
}
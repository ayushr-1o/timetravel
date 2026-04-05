import { Outlet, NavLink } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#e5e5e5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '60px',
        borderBottom: '1px solid #262626', background: '#141414'
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          ⏱ TimeTravel
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <NavLink to="/" end style={({ isActive }) => ({
            color: isActive ? '#4f98a3' : '#888', textDecoration: 'none', fontSize: '0.9rem'
          })}>
            Dashboard
          </NavLink>
          <NavLink to="/submit" style={({ isActive }) => ({
            color: isActive ? '#4f98a3' : '#888', textDecoration: 'none', fontSize: '0.9rem'
          })}>
            Submit Article
          </NavLink>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <Outlet />
      </main>

    </div>
  )
}
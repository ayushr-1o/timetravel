import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Article } from '../types/article'

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setArticles(data)
      setLoading(false)
    }
    fetchArticles()
  }, [])

  const totalClaims = articles.reduce((sum, a) => sum + (a.extracted_claims?.length ?? 0), 0)
  const pending = articles.filter(a => a.status === 'pending').length
  const done = articles.filter(a => a.status === 'done').length
  const timeSensitive = articles.flatMap(a => a.extracted_claims ?? [])
    .filter(c => c.sensitivity === 'high').length

  return (
    <div style={{ padding: '2.5rem max(2rem, 5vw) 2rem' }}>
      {/* LIVE Sub-header + Inline stats */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontWeight: 600
      }}>
        <div style={{
          background: '#e03e3e',
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          LIVE
        </div>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          {articles.length} articles • {totalClaims} claims extracted • 
          {pending} pending review • {timeSensitive} time-sensitive
        </span>
      </div>

      {/* 5 Perfect Stats Cards */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {[
          { label: 'Articles', value: articles.length.toString(), subtitle: 'Total submitted', color: '#e03e3e' },
          { label: 'Claims Extracted', value: totalClaims.toString(), subtitle: 'AI processed', color: '#10b981' },
          { label: 'Pending Review', value: pending.toString(), subtitle: 'Needs verification', color: '#f59e0b' },
          { label: 'Approved', value: done.toString(), subtitle: 'Verified claims', color: '#059669' },
          { label: 'Time Sensitive', value: timeSensitive.toString(), subtitle: 'High priority', color: '#ef4444' }
        ].map(({ label, value, subtitle, color }, i) => (
          <div key={i} style={{
            background: '#fff',
            borderLeft: `4px solid ${color}`,
            borderRadius: '12px',
            padding: '1.75rem 1.5rem',
            minWidth: '180px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            flex: '1',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: 500 }}>
              {label}
            </div>
            <div style={{ 
              fontSize: '2.25rem', 
              fontWeight: 800, 
              color: '#111',
              lineHeight: 1 
            }}>
              {value}
            </div>
            <div style={{ color: '#999', fontSize: '0.75rem' }}>
              {subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Articles list */}
      <h2 style={{ 
        fontSize: '1.125rem', 
        fontWeight: 700, 
        marginBottom: '1.5rem', 
        color: '#111',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Recent Articles
      </h2>

      {loading && (
        <div style={{ 
          padding: '4rem 0', 
          textAlign: 'center', 
          color: '#999' 
        }}>
          Loading...
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          color: '#999',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #eee'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📰</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#666' }}>
            No articles yet
          </h3>
          <p style={{ fontSize: '1rem', color: '#999' }}>
            Submit your first article to get started.
          </p>
        </div>
      )}

      {!loading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 380px', 
          gap: '2rem',
          minHeight: '400px'
        }}>
          {/* Left: Recent Articles List */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              maxHeight: '600px',
              overflow: 'auto'
            }}>
              {articles.slice(0, 8).map(article => (
                <div 
                  key={article.id}
                  onClick={() => navigate(`/articles/${article.id}`)}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div>
                    <div style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      marginBottom: '0.4rem',
                      color: '#111'
                    }}>
                      {article.source?.replace('https://www.', '') || 'No source'}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#666' 
                    }}>
                      {new Date(article.created_at).toLocaleDateString()} •{' '}
                      {article.extracted_claims?.length ?? 0} claims
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    background: article.status === 'done' ? '#d1fae5' : '#fef3c7',
                    color: article.status === 'done' ? '#059669' : '#d97706'
                  }}>
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Status Overview */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111' }}>
              Status Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ color: '#666' }}>Processing</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{pending} pending</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                <span style={{ color: '#047857' }}>Completed</span>
                <span style={{ fontWeight: 600, color: '#047857' }}>{done} done</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                <span style={{ color: '#92400e' }}>High Priority</span>
                <span style={{ fontWeight: 600, color: '#92400e' }}>{timeSensitive} claims</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
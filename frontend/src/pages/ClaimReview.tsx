import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Claim {
  article_id: string;
  article_title: string | null;
  claim_index: number;
  claim: {
    claim_text: string;
    sensitivity: 'low' | 'medium' | 'high';
    freshness_score: number;
    analysis_notes: string;
    status: string;
    sources: Array<{ title: string; url: string }>;
  };
}

const SENSITIVITY_COLORS = {
  high: { bg: '#fff1f1', text: '#c0392b', border: '#e74c3c' },
  medium: { bg: '#fff8f0', text: '#e67e22', border: '#f39c12' },
  low: { bg: '#f0fff4', text: '#27ae60', border: '#2ecc71' },
};

export default function ClaimReview() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const loadClaims = () => {
    setLoading(true);
    fetch(`${API_URL}/claims/review`)
      .then(res => res.json())
      .then(data => setClaims(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClaims(); }, []);

  const updateStatus = async (articleId: string, claimIndex: number, status: 'approved' | 'rejected') => {
    const key = `${articleId}-${claimIndex}`;
    setUpdating(key);
    try {
      await fetch(`${API_URL}/claims/${articleId}/${claimIndex}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadClaims();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const toggleCollapse = (articleId: string) => {
    setCollapsed(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  // Group claims by article
  const grouped = claims.reduce((acc, item) => {
    const key = item.article_id;
    if (!acc[key]) acc[key] = { title: item.article_title, claims: [] };
    acc[key].claims.push(item);
    return acc;
  }, {} as Record<string, { title: string | null; claims: Claim[] }>);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e03e3e', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#666', fontSize: 16 }}>Loading claims...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: 0 }}>Claim Review</h1>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>LIVE</span>
          </div>
          <p style={{ color: '#666', margin: 0, fontSize: 15 }}>
            {claims.length} pending claim{claims.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} article{Object.keys(grouped).length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadClaims}
          style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#555', fontWeight: 500 }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Empty state */}
      {claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#555', marginBottom: 8 }}>No pending claims</p>
          <p style={{ fontSize: 14 }}>Submit and extract an article to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {Object.entries(grouped).map(([articleId, group]) => (
            <div key={articleId} style={{
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>

              {/* Article header */}
              <div
                onClick={() => toggleCollapse(articleId)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  background: '#fafafa',
                  borderBottom: collapsed[articleId] ? 'none' : '1px solid #f0f0f0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📰</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>
                      {group.title || 'Untitled Article'}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {group.claims.length} pending claim{group.claims.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 18, color: '#aaa', transform: collapsed[articleId] ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  ▾
                </span>
              </div>

              {/* Claims for this article */}
              {!collapsed[articleId] && (
                <div style={{ padding: '1rem 1.5rem', display: 'grid', gap: '1rem' }}>
                  {group.claims.map((item) => {
                    const key = `${item.article_id}-${item.claim_index}`;
                    const colors = SENSITIVITY_COLORS[item.claim.sensitivity] || SENSITIVITY_COLORS.low;
                    const isUpdating = updating === key;
                    return (
                      <div key={key} style={{
                        border: `1px solid ${colors.border}`,
                        borderLeft: `4px solid ${colors.border}`,
                        borderRadius: 10,
                        padding: '1.25rem',
                        opacity: isUpdating ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                        background: '#fff'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <span style={{ background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                            {item.claim.sensitivity.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            Freshness: {(item.claim.freshness_score * 100).toFixed(0)}%
                          </span>
                        </div>

                        <p style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.5, margin: '0 0 8px' }}>
                          {item.claim.claim_text}
                        </p>

                        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: '0 0 14px' }}>
                          {item.claim.analysis_notes}
                        </p>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => updateStatus(item.article_id, item.claim_index, 'approved')}
                            disabled={isUpdating}
                            style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => updateStatus(item.article_id, item.claim_index, 'rejected')}
                            disabled={isUpdating}
                            style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
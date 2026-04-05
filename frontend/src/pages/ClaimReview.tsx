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

  const loadClaims = () => {
    setLoading(true);
    fetch(`${API_URL}/claims/review`)
      .then(res => res.json())
      .then(data => { console.log('Claims:', data); setClaims(data); })
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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e03e3e', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#666', fontSize: 16 }}>Loading claims...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: 0 }}>Claim Review</h1>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>LIVE</span>
          </div>
          <p style={{ color: '#666', margin: 0, fontSize: 15 }}>{claims.length} Pending Claims</p>
        </div>
        <button onClick={loadClaims} style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#555', fontWeight: 500 }}>
          ↻ Refresh
        </button>
      </div>

      {/* Grid */}
      {claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p style={{ fontSize: 20, fontWeight: 600, color: '#555', marginBottom: 8 }}>No pending claims</p>
          <p style={{ fontSize: 14 }}>Submit and extract an article to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {claims.map((item) => {
            const key = `${item.article_id}-${item.claim_index}`;
            const colors = SENSITIVITY_COLORS[item.claim.sensitivity] || SENSITIVITY_COLORS.low;
            const isUpdating = updating === key;
            return (
              <div key={key} style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${colors.border}`,
                padding: '1.5rem',
                transition: 'box-shadow 0.2s, transform 0.2s',
                opacity: isUpdating ? 0.6 : 1,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                {/* Sensitivity badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                    {item.claim.sensitivity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    Freshness: {(item.claim.freshness_score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Claim text */}
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111', lineHeight: 1.5, marginBottom: 10, marginTop: 0 }}>
                  {item.claim.claim_text}
                </p>

                {/* Notes */}
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 16, marginTop: 0 }}>
                  {item.claim.analysis_notes}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => updateStatus(item.article_id, item.claim_index, 'approved')}
                    disabled={isUpdating}
                    style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => updateStatus(item.article_id, item.claim_index, 'rejected')}
                    disabled={isUpdating}
                    style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
                  >
                    ✗ Reject
                  </button>
                </div>

                {/* Article label */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#aaa' }}>
                  📰 {item.article_title || 'Untitled Article'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
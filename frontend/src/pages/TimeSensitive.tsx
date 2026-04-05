import { useState, useEffect } from 'react';

interface ClaimObject {
  claim_text: string;
  sensitivity: string;
  freshness_score: number;
  analysis_notes: string;
  status: string;
  sources: Array<{ title: string; url: string }>;
}

interface SensitiveClaim {
  article_id: string;
  article_title: string | null;
  claim_index: number;
  suggestion: string;
  claim: ClaimObject;
}

export default function TimeSensitive() {
  const [claims, setClaims] = useState<SensitiveClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/claims/time-sensitive')
      .then(res => res.json())
      .then((data: SensitiveClaim[]) => {
        console.log('✅ Claims loaded:', data);
        setClaims(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('❌ Error:', err);
        setClaims([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: 50, height: 50, border: '5px solid #f3f4f6', borderTop: '5px solid #e03e3e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <div>Loading time-sensitive claims...</div>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⏰</div>
        <h2 style={{ fontSize: 32, marginBottom: 12 }}>No time-sensitive claims</h2>
        <p>High-risk claims will appear here automatically</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#111827', margin: 0, marginBottom: 8 }}>
          Time Sensitive Claims
        </h1>
        <div style={{ fontSize: 20, color: '#6b7280' }}>
          {claims.length} claims need your attention
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {claims.map((item: SensitiveClaim, index: number) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: 20,
            padding: 40,
            boxShadow: '0 20px 60px rgba(224, 62, 62, 0.15)',
            border: '1px solid #fee2e2',
            borderLeft: '8px solid #e03e3e'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
                Priority #{index + 1}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#e03e3e' }}>
                  {Math.round((1 - item.claim.freshness_score) * 100)}%
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Stale Risk</div>
              </div>
            </div>

            {/* Original */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ color: '#64748b', fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
                📄 Original Claim
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.6, color: '#111827' }}>
                {item.claim.claim_text}
              </div>
            </div>

            {/* Staleness bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#888' }}>Staleness Risk</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e03e3e' }}>
                  {Math.round((1 - item.claim.freshness_score) * 100)}%
                </span>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: 99, height: 8 }}>
                <div style={{ width: `${Math.round((1 - item.claim.freshness_score) * 100)}%`, background: '#e03e3e', height: '100%', borderRadius: 99 }} />
              </div>
            </div>

            {/* Timeless Suggestion */}
            <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '2px solid #10b981', borderRadius: 20, padding: '28px 32px', marginBottom: 24, boxShadow: '0 12px 32px rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, background: '#10b981', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 22 }}>✨</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#065f46' }}>Timeless Rewrite</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#047857', lineHeight: 1.6, padding: '20px 24px', background: 'rgba(255,255,255,0.8)', borderRadius: 16, borderLeft: '5px solid #059669' }}>
                {item.suggestion || 'No suggestion available'}
              </div>
            </div>

            {/* Why */}
            <div style={{ padding: '20px 24px', background: '#eff6ff', borderRadius: 16, borderLeft: '5px solid #3b82f6' }}>
              <div style={{ fontSize: 14, color: '#1e40af', marginBottom: 12, fontWeight: 600 }}>📋 Why Update?</div>
              <div style={{ fontSize: 15, color: '#1e3a8a', lineHeight: 1.6 }}>{item.claim.analysis_notes}</div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6', fontSize: 14, color: '#9ca3af' }}>
              📰 {item.article_title || 'News Article'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
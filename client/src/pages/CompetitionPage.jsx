import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Swords, TrendingUp, TrendingDown, Shield, Edit2, Save, X, ExternalLink } from 'lucide-react';

export default function CompetitionPage() {
  const { workspace, config, updateConfig } = useWorkspace();
  const [editIdx, setEditIdx] = useState(null);
  const [editCard, setEditCard] = useState({});
  const [hnFeeds, setHnFeeds] = useState({});

  const competitors = config?.competitors || [];

  useEffect(() => {
    competitors.forEach(async (c) => {
      try {
        const res = await fetch(`/api/intelligence/sector?q=${encodeURIComponent(c.name)}`);
        const data = await res.json();
        setHnFeeds(prev => ({ ...prev, [c.name]: data.slice(0, 3) }));
      } catch {}
    });
  }, [config]);

  const saveEdit = async () => {
    if (editIdx === null) return;
    const updated = [...competitors];
    updated[editIdx] = { ...updated[editIdx], ...editCard };
    await updateConfig({ ...config, competitors: updated });
    setEditIdx(null);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Competition</h2>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          {competitors.length} competitors tracked
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {competitors.map((comp, i) => (
          <div key={i} className="card" style={{ padding: '20px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{comp.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {comp.status === 'winning' ? (
                  <span className="badge" style={{
                    background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
                    border: '0.5px solid rgba(34, 197, 94, 0.2)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <TrendingUp size={10} /> {comp.status_label}
                  </span>
                ) : (
                  <span className="badge" style={{
                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                    border: '0.5px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <TrendingDown size={10} /> {comp.status_label}
                  </span>
                )}
                <button onClick={() => { setEditIdx(i); setEditCard(comp); }} style={{
                  padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
                  color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                  opacity: 0, transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                ><Edit2 size={12} /></button>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <div className="section-title" style={{ marginBottom: 4 }}>Valuation</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{comp.valuation || 'N/A'}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <div className="section-title" style={{ marginBottom: 4 }}>ARR</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{comp.arr || 'N/A'}</div>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div>
                <div className="section-title" style={{ marginBottom: 4 }}>Differentiator</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{comp.differentiator}</p>
              </div>
              <div>
                <div className="section-title" style={{ marginBottom: 4 }}>Our Advantage</div>
                <p style={{ fontSize: 12, color: 'var(--success)', lineHeight: 1.5, margin: 0 }}>{comp.our_advantage}</p>
              </div>
            </div>

            {/* Battlecard */}
            {comp.battlecard && (
              <div style={{
                background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
                borderRadius: 8, padding: 14, marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Shield size={12} style={{ color: 'var(--warning)' }} />
                  <span className="section-title" style={{ color: 'var(--warning)' }}>Battle Card</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 500, flexShrink: 0 }}>Strength:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{comp.battlecard.their_strength}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--success)', fontWeight: 500, flexShrink: 0 }}>Weakness:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{comp.battlecard.their_weakness}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>Response:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{comp.battlecard.one_line_response}</span>
                  </div>
                </div>
              </div>
            )}

            {/* News */}
            {hnFeeds[comp.name] && hnFeeds[comp.name].length > 0 && (
              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
                <div className="section-title" style={{ marginBottom: 8 }}>Recent News</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {hnFeeds[comp.name].map((s, j) => (
                    <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <ExternalLink size={10} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editIdx !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }} onClick={() => setEditIdx(null)}>
          <div className="card" style={{ padding: 24, width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Edit: {editCard.name}</h3>
              <button onClick={() => setEditIdx(null)} style={{
                padding: 6, borderRadius: 6, border: 'none', background: 'transparent',
                color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
              }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Differentiator</label>
                <textarea value={editCard.differentiator || ''} onChange={e => setEditCard(p => ({ ...p, differentiator: e.target.value }))} className="input" style={{ width: '100%', padding: 10, fontSize: 12, height: 64, resize: 'none' }} />
              </div>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Our Advantage</label>
                <textarea value={editCard.our_advantage || ''} onChange={e => setEditCard(p => ({ ...p, our_advantage: e.target.value }))} className="input" style={{ width: '100%', padding: 10, fontSize: 12, height: 64, resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button onClick={saveEdit} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}><Save size={12} /> Save</button>
                <button onClick={() => setEditIdx(null)} className="btn-ghost" style={{ padding: '8px 16px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

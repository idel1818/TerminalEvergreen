import { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Briefcase, Target, Calculator, Shield, Mail, Edit2, Save, X } from 'lucide-react';

export default function SalesKitPage() {
  const { config, updateConfig } = useWorkspace();
  const [tab, setTab] = useState('selling_points');
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState({});
  const [roiInputs, setRoiInputs] = useState({
    headcount: config?.roi_model?.default_headcount || 50,
    salary: config?.roi_model?.default_salary || 150000,
    maintenance_pct: config?.roi_model?.default_maintenance_pct || 30,
  });

  const tabs = [
    { id: 'selling_points', label: 'Selling Points', icon: Target },
    { id: 'roi', label: 'ROI Calculator', icon: Calculator },
    { id: 'objections', label: 'Objections', icon: Shield },
    { id: 'email_templates', label: 'Templates', icon: Mail },
  ];

  const saveEdit = async (section) => {
    if (editIdx === null) return;
    const updated = [...(config[section] || [])];
    updated[editIdx] = { ...updated[editIdx], ...editData };
    await updateConfig({ ...config, [section]: updated });
    setEditIdx(null);
  };

  const lanes = config?.roi_model?.lanes || [];
  const totalMaintenance = roiInputs.headcount * roiInputs.salary * (roiInputs.maintenance_pct / 100);
  const totalSavings = lanes.reduce((sum, lane) => {
    const laneCost = totalMaintenance * (lane.default_share / 100);
    const savings = laneCost * (1 - 1 / lane.speedup);
    return sum + savings;
  }, 0);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Sales Kit</h2>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          Selling points, ROI, objections & templates
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                border: active ? '0.5px solid var(--border-bright)' : '0.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'selling_points' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
          {(config?.selling_points || []).map((sp, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge" style={{
                  background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)',
                  border: '0.5px solid rgba(59, 130, 246, 0.2)',
                }}>{sp.persona}</span>
                <button onClick={() => { setEditIdx(i); setEditData(sp); }} style={{
                  padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
                  color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                ><Edit2 size={12} /></button>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{sp.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{sp.one_liner}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>Proof:</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{sp.proof}</span>
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Next step:</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{sp.next_step}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'roi' && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 20 }}>ROI Calculator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div>
              <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Engineering Headcount</label>
              <input type="number" value={roiInputs.headcount} onChange={e => setRoiInputs(p => ({ ...p, headcount: Number(e.target.value) }))} className="input" style={{ width: '100%', padding: '10px 14px' }} />
            </div>
            <div>
              <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Avg. Salary ($)</label>
              <input type="number" value={roiInputs.salary} onChange={e => setRoiInputs(p => ({ ...p, salary: Number(e.target.value) }))} className="input" style={{ width: '100%', padding: '10px 14px' }} />
            </div>
            <div>
              <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Maintenance Cost (%)</label>
              <input type="number" value={roiInputs.maintenance_pct} onChange={e => setRoiInputs(p => ({ ...p, maintenance_pct: Number(e.target.value) }))} className="input" style={{ width: '100%', padding: '10px 14px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {lanes.map((lane, i) => {
              const laneCost = totalMaintenance * (lane.default_share / 100);
              const savings = laneCost * (1 - 1 / lane.speedup);
              return (
                <div key={i} style={{
                  background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
                  borderRadius: 8, padding: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{lane.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{lane.benchmark}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--success)' }}>${(savings / 1000).toFixed(0)}k saved</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{lane.speedup}x speedup</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: 20, borderRadius: 12, textAlign: 'center',
            background: 'rgba(34, 197, 94, 0.06)', border: '0.5px solid rgba(34, 197, 94, 0.2)',
          }}>
            <div className="section-title" style={{ color: 'var(--success)', marginBottom: 4 }}>Total Annual Savings</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)', fontFamily: "'JetBrains Mono', monospace" }}>${(totalSavings / 1000).toFixed(0)}k</div>
          </div>
        </div>
      )}

      {tab === 'objections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(config?.objections || []).map((obj, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={13} style={{ color: 'var(--danger)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--danger)' }}>"{obj.objection}"</span>
                </div>
                <button onClick={() => { setEditIdx(i); setEditData(obj); }} style={{
                  padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
                  color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                ><Edit2 size={12} /></button>
              </div>
              <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12 }}><span style={{ color: 'var(--success)', fontWeight: 500 }}>Response:</span> <span style={{ color: 'var(--text-secondary)' }}>{obj.response}</span></div>
                <div style={{ fontSize: 12 }}><span style={{ color: 'var(--accent)', fontWeight: 500 }}>Proof:</span> <span style={{ color: 'var(--text-secondary)' }}>{obj.proof}</span></div>
                <div style={{ fontSize: 12 }}><span style={{ color: 'var(--purple)', fontWeight: 500 }}>Ask next:</span> <span style={{ color: 'var(--text-secondary)' }}>{obj.ask_next}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'email_templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
          {(config?.email_templates || []).map((t, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge" style={{
                  background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6',
                  border: '0.5px solid rgba(139, 92, 246, 0.2)',
                }}>{t.vertical}</span>
                <button onClick={() => { setEditIdx(i); setEditData(t); }} style={{
                  padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
                  color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                ><Edit2 size={12} /></button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{t.subject}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{t.body}</div>
            </div>
          ))}
        </div>
      )}

      {editIdx !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }} onClick={() => setEditIdx(null)}>
          <div className="card animate-fade-in-up" style={{ padding: 24, width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Edit</h3>
              <button onClick={() => setEditIdx(null)} style={{
                padding: 6, borderRadius: 6, border: 'none', background: 'transparent',
                color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
              }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(editData).map(([key, val]) => (
                typeof val === 'string' && (
                  <div key={key}>
                    <label className="section-title" style={{ display: 'block', marginBottom: 6, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</label>
                    <textarea value={val} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} className="input" style={{ width: '100%', padding: 10, fontSize: 12, resize: 'none' }} rows={key === 'body' ? 4 : 2} />
                  </div>
                )
              ))}
              <button onClick={() => saveEdit(tab)} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={12} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

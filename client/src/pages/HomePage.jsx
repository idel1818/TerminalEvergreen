import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight, Zap, Database, Brain, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import LoadingSequence from '../components/LoadingSequence';

export default function HomePage() {
  const { workspace, loading, configureCompany, fetchWorkspaces, workspaces, switchWorkspace } = useWorkspace();
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  if (loading) return <LoadingSequence />;

  if (workspace) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError('');
    try {
      await configureCompany(companyName.trim());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickSwitch = async (id) => {
    await switchWorkspace(id);
  };

  return (
    <div className="min-h-screen bg-dot-pattern" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 400, background: 'rgba(59, 130, 246, 0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', maxWidth: 540, width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <div className="animate-float" style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'var(--accent-dim)', border: '0.5px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Terminal size={24} style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          <span className="glow-text" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent)' }}>&gt;_</span> GTM Terminal
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 40px' }}>
          The sales intelligence terminal that configures itself.<br />
          Type any company name to get started.
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            {/* Animated gradient border */}
            <div className="animate-pulse-glow" style={{
              position: 'absolute', inset: -1, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.3))',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 16, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 16 }}>&gt;</span>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Type a company name..."
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 12,
                  paddingLeft: 36, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                  fontSize: 16, color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                }}
                autoFocus
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!companyName.trim()}
            className="btn-primary"
            style={{
              marginTop: 20,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 10,
            }}
          >
            Configure Terminal <ArrowRight size={18} />
          </button>
          {error && (
            <div style={{
              marginTop: 16, padding: '10px 16px', borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)', border: '0.5px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)', fontSize: 13,
            }}>
              {error}
            </div>
          )}
        </form>

        {workspaces.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Recently configured</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {workspaces.slice(0, 5).map(w => (
                <button
                  key={w.id}
                  onClick={() => handleQuickSwitch(w.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 8,
                    background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500,
                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-bright)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  {w.logo_url ? (
                    <img src={w.logo_url} alt="" style={{ width: 16, height: 16, borderRadius: 4 }} />
                  ) : (
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)', fontSize: 9, fontWeight: 700,
                    }}>
                      {w.company_name[0]?.toUpperCase()}
                    </div>
                  )}
                  {w.company_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: Terminal, step: '01', text: 'Type company name' },
            { icon: Database, step: '02', text: 'Enrich from 5 sources' },
            { icon: Brain, step: '03', text: 'AI generates config' },
            { icon: Clock, step: '04', text: 'Terminal ready' },
          ].map(({ icon: Icon, step, text }) => (
            <div key={step} style={{
              padding: '16px 12px',
              borderRadius: 12,
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border)',
              textAlign: 'center',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Icon size={18} style={{ color: 'var(--accent)', opacity: 0.7, margin: '0 auto 8px' }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent)', opacity: 0.5, marginBottom: 4 }}>{step}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{
        position: 'absolute', bottom: 24,
        fontSize: 10, color: 'var(--text-tertiary)',
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        Powered by GTM Terminal
      </footer>
    </div>
  );
}

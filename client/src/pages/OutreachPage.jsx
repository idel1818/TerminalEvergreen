import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Send, Sparkles, Mail, MessageSquare, Loader2 } from 'lucide-react';

const statusStyles = {
  'Replied': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  'Bounced': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  'Sent': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
};

export default function OutreachPage() {
  const { workspace, config } = useWorkspace();
  const [outreach, setOutreach] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [composing, setComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({ account_name: '', persona: 'VP Engineering', channel: 'email' });
  const [composeResult, setComposeResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workspace) return;
    fetch(`/api/workspaces/${workspace.id}/outreach`).then(r => r.json()).then(setOutreach);
    fetch(`/api/workspaces/${workspace.id}/accounts`).then(r => r.json()).then(setAccounts);
  }, [workspace]);

  const handleCompose = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/compose`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeForm)
      });
      const data = await res.json();
      setComposeResult(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const sendOutreach = async () => {
    if (!composeResult) return;
    const account = accounts.find(a => a.name.toLowerCase().includes(composeForm.account_name.toLowerCase()));
    const res = await fetch(`/api/workspaces/${workspace.id}/outreach`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: account?.id,
        channel: composeForm.channel,
        subject: composeResult.subject,
        message: composeResult.body,
      })
    });
    const item = await res.json();
    setOutreach(prev => [item, ...prev]);
    setComposeResult(null);
    setComposing(false);
  };

  const templates = config?.email_templates || [];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Outreach</h2>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
            {outreach.length} messages sent
          </p>
        </div>
        <button onClick={() => setComposing(!composing)} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} /> AI Compose
        </button>
      </div>

      {composing && (
        <div className="card animate-fade-in-up" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={12} style={{ color: 'var(--accent)' }} /> AI Outreach Composer
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <input value={composeForm.account_name} onChange={e => setComposeForm(p => ({ ...p, account_name: e.target.value }))} placeholder="Target account name" className="input" style={{ padding: '10px 14px' }} />
            <select value={composeForm.persona} onChange={e => setComposeForm(p => ({ ...p, persona: e.target.value }))} className="input" style={{ padding: '10px 14px' }}>
              <option>VP Engineering</option>
              <option>CTO</option>
              <option>VP Sales</option>
              <option>Head of Product</option>
              <option>CEO</option>
            </select>
            <select value={composeForm.channel} onChange={e => setComposeForm(p => ({ ...p, channel: e.target.value }))} className="input" style={{ padding: '10px 14px' }}>
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="cold_call">Cold Call Script</option>
            </select>
          </div>
          <button onClick={handleCompose} disabled={loading || !composeForm.account_name} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {loading ? 'Generating...' : 'Generate Message'}
          </button>

          {composeResult && (
            <div style={{
              marginTop: 16, background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
              borderRadius: 8, padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Subject: {composeResult.subject}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 16, lineHeight: 1.6 }}>{composeResult.body}</div>
              <button onClick={sendOutreach} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(34, 197, 94, 0.1)', border: '0.5px solid rgba(34, 197, 94, 0.2)',
                color: '#22c55e', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                <Send size={12} /> Send & Log
              </button>
            </div>
          )}
        </div>
      )}

      {templates.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={12} style={{ color: 'var(--purple)' }} /> Email Templates
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
            {templates.map((t, i) => (
              <div key={i} className="card" style={{ padding: '16px 20px' }}>
                <span className="badge" style={{
                  background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6',
                  border: '0.5px solid rgba(139, 92, 246, 0.2)',
                  marginBottom: 8, display: 'inline-block',
                }}>{t.vertical}</span>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{t.subject}</div>
                <div style={{
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{t.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outreach History */}
      <div style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)' }}>
          <div className="section-title">Outreach History</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Channel</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {outreach.map(o => {
                const ss = statusStyles[o.status] || statusStyles['Sent'];
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{o.channel}</td>
                    <td>{o.subject}</td>
                    <td>
                      <span className="badge" style={{ background: ss.bg, color: ss.text, border: `0.5px solid ${ss.border}` }}>{o.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {outreach.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)', fontSize: 12 }}>
            No outreach yet. Use AI Compose to get started.
          </div>
        )}
      </div>
    </div>
  );
}

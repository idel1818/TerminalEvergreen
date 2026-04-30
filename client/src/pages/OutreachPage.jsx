import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Send, Sparkles, Mail, MessageSquare, Loader2 } from 'lucide-react';

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
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Send size={14} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Outreach</h2>
            <p className="text-[11px] text-slate-600">{outreach.length} messages sent</p>
          </div>
        </div>
        <button onClick={() => setComposing(!composing)} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs">
          <Sparkles size={13} /> AI Compose
        </button>
      </div>

      {composing && (
        <div className="card p-5 animate-fade-in-up border-blue-500/20">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Sparkles size={13} className="text-blue-400" /> AI Outreach Composer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input value={composeForm.account_name} onChange={e => setComposeForm(p => ({ ...p, account_name: e.target.value }))} placeholder="Target account name" className="input px-3 py-2.5 text-sm" />
            <select value={composeForm.persona} onChange={e => setComposeForm(p => ({ ...p, persona: e.target.value }))} className="input px-3 py-2.5 text-sm">
              <option>VP Engineering</option>
              <option>CTO</option>
              <option>VP Sales</option>
              <option>Head of Product</option>
              <option>CEO</option>
            </select>
            <select value={composeForm.channel} onChange={e => setComposeForm(p => ({ ...p, channel: e.target.value }))} className="input px-3 py-2.5 text-sm">
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="cold_call">Cold Call Script</option>
            </select>
          </div>
          <button onClick={handleCompose} disabled={loading || !composeForm.account_name} className="btn-primary flex items-center gap-2 px-4 py-2 text-xs">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {loading ? 'Generating...' : 'Generate Message'}
          </button>

          {composeResult && (
            <div className="mt-4 card-inner p-4">
              <div className="text-xs font-semibold text-white mb-2">Subject: {composeResult.subject}</div>
              <div className="text-xs text-slate-400 whitespace-pre-wrap mb-4 leading-relaxed">{composeResult.body}</div>
              <button onClick={sendOutreach} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium cursor-pointer hover:bg-emerald-500/20 transition-colors">
                <Send size={12} /> Send & Log
              </button>
            </div>
          )}
        </div>
      )}

      {templates.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Mail size={13} className="text-purple-400" /> Email Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((t, i) => (
              <div key={i} className="card-inner p-4">
                <div className="mb-2">
                  <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">{t.vertical}</span>
                </div>
                <div className="text-xs font-medium text-white mb-1">{t.subject}</div>
                <div className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">{t.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#162032]">
          <h3 className="section-title">Outreach History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#162032]">
                <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Channel</th>
                <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Subject</th>
                <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {outreach.map(o => (
                <tr key={o.id} className="table-row border-b border-[#162032]/50">
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs capitalize">{o.channel}</td>
                  <td className="px-5 py-3 text-white text-xs">{o.subject}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${o.status === 'Replied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : o.status === 'Bounced' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {outreach.length === 0 && <div className="text-center py-10 text-xs text-slate-600">No outreach yet. Use AI Compose to get started.</div>}
      </div>
    </div>
  );
}

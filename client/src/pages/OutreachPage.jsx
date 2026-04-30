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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Outreach</h2>
        <button onClick={() => setComposing(!composing)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium border-none cursor-pointer">
          <Sparkles size={14} /> AI Compose
        </button>
      </div>

      {composing && (
        <div className="bg-[#131a2e] border border-blue-500/30 rounded-xl p-5 animate-fade-in-up">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" /> AI Outreach Composer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input value={composeForm.account_name} onChange={e => setComposeForm(p => ({ ...p, account_name: e.target.value }))} placeholder="Target account name" className="bg-[#0a0e1a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white outline-none" />
            <select value={composeForm.persona} onChange={e => setComposeForm(p => ({ ...p, persona: e.target.value }))} className="bg-[#0a0e1a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white outline-none">
              <option>VP Engineering</option>
              <option>CTO</option>
              <option>VP Sales</option>
              <option>Head of Product</option>
              <option>CEO</option>
            </select>
            <select value={composeForm.channel} onChange={e => setComposeForm(p => ({ ...p, channel: e.target.value }))} className="bg-[#0a0e1a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white outline-none">
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="cold_call">Cold Call Script</option>
            </select>
          </div>
          <button onClick={handleCompose} disabled={loading || !composeForm.account_name} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm border-none cursor-pointer disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Generating...' : 'Generate Message'}
          </button>

          {composeResult && (
            <div className="mt-4 p-4 bg-[#0a0e1a] rounded-lg border border-[#1e293b]">
              <div className="text-sm font-medium text-white mb-2">Subject: {composeResult.subject}</div>
              <div className="text-sm text-slate-300 whitespace-pre-wrap mb-4">{composeResult.body}</div>
              <button onClick={sendOutreach} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm border-none cursor-pointer">
                <Send size={14} /> Send & Log
              </button>
            </div>
          )}
        </div>
      )}

      {templates.length > 0 && (
        <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Mail size={16} className="text-purple-400" /> Email Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t, i) => (
              <div key={i} className="p-4 bg-[#0a0e1a] rounded-lg border border-[#1e293b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">{t.vertical}</span>
                </div>
                <div className="text-sm font-medium text-white mb-1">{t.subject}</div>
                <div className="text-xs text-slate-400 line-clamp-3">{t.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e293b]">
          <h3 className="text-sm font-semibold text-white">Outreach History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Channel</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Subject</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {outreach.map(o => (
                <tr key={o.id} className="border-b border-[#1e293b]/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{o.channel}</td>
                  <td className="px-4 py-3 text-white">{o.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'Replied' ? 'bg-emerald-500/20 text-emerald-400' : o.status === 'Bounced' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {outreach.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No outreach yet. Use AI Compose to get started.</div>}
      </div>
    </div>
  );
}

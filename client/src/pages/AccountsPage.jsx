import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Plus, Download, Search, ChevronDown, Trash2, Edit2, X, Save } from 'lucide-react';

const STAGES = ['Uncontacted', 'Contacted', 'Meeting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageColors = {
  'Uncontacted': 'bg-slate-500/20 text-slate-400',
  'Contacted': 'bg-blue-500/20 text-blue-400',
  'Meeting': 'bg-purple-500/20 text-purple-400',
  'Proposal': 'bg-amber-500/20 text-amber-400',
  'Negotiation': 'bg-orange-500/20 text-orange-400',
  'Closed Won': 'bg-emerald-500/20 text-emerald-400',
  'Closed Lost': 'bg-red-500/20 text-red-400',
};

export default function AccountsPage() {
  const { workspace } = useWorkspace();
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', industry: '', territory: '', stage: 'Uncontacted', deal_value: 0 });

  useEffect(() => {
    if (!workspace) return;
    fetch(`/api/workspaces/${workspace.id}/accounts`).then(r => r.json()).then(setAccounts);
  }, [workspace]);

  const filtered = accounts.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) || a.industry?.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'All' || a.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const exportCSV = () => {
    const headers = ['Name', 'Industry', 'Territory', 'ICP Score', 'Stage', 'Deal Value', 'Pain Point'];
    const rows = filtered.map(a => [a.name, a.industry, a.territory, a.icp_score, a.stage, a.deal_value, a.pain_point]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workspace?.company_name || 'accounts'}-export.csv`;
    link.click();
  };

  const addAccount = async () => {
    const res = await fetch(`/api/workspaces/${workspace.id}/accounts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount)
    });
    const acc = await res.json();
    setAccounts(prev => [...prev, acc]);
    setNewAccount({ name: '', industry: '', territory: '', stage: 'Uncontacted', deal_value: 0 });
    setShowAdd(false);
  };

  const updateAccount = async (id) => {
    await fetch(`/api/workspaces/${workspace.id}/accounts/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...editData } : a));
    setEditId(null);
  };

  const deleteAccount = async (id) => {
    await fetch(`/api/workspaces/${workspace.id}/accounts/${id}`, { method: 'DELETE' });
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Accounts</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm border-none cursor-pointer">
            <Plus size={14} /> Add
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131a2e] border border-[#1e293b] text-slate-400 text-sm hover:text-white cursor-pointer">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..." className="w-full bg-[#131a2e] border border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50" />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="bg-[#131a2e] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white outline-none">
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {showAdd && (
        <div className="bg-[#131a2e] border border-blue-500/30 rounded-xl p-4 animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))} placeholder="Company name" className="bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
            <input value={newAccount.industry} onChange={e => setNewAccount(p => ({ ...p, industry: e.target.value }))} placeholder="Industry" className="bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
            <input value={newAccount.territory} onChange={e => setNewAccount(p => ({ ...p, territory: e.target.value }))} placeholder="Territory" className="bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
            <input type="number" value={newAccount.deal_value} onChange={e => setNewAccount(p => ({ ...p, deal_value: Number(e.target.value) }))} placeholder="Deal value" className="bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
            <div className="flex gap-2">
              <button onClick={addAccount} className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm border-none cursor-pointer">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded bg-transparent border border-[#1e293b] text-slate-400 text-sm cursor-pointer"><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Account</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Industry</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Territory</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">ICP</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Stage</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase">Deal Value</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-[#1e293b]/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-slate-400">{a.industry}</td>
                  <td className="px-4 py-3 text-slate-400">{a.territory}</td>
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono">{a.icp_score || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {editId === a.id ? (
                      <select value={editData.stage || a.stage} onChange={e => setEditData(p => ({ ...p, stage: e.target.value }))} className="bg-[#0a0e1a] border border-[#1e293b] rounded px-2 py-1 text-xs text-white outline-none">
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded ${stageColors[a.stage] || stageColors['Uncontacted']}`}>{a.stage}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{a.deal_value ? `$${(a.deal_value / 1000).toFixed(0)}k` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editId === a.id ? (
                        <>
                          <button onClick={() => updateAccount(a.id)} className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400 bg-transparent border-none cursor-pointer"><Save size={14} /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(a.id); setEditData({ stage: a.stage, deal_value: a.deal_value }); }} className="p-1.5 rounded hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"><Edit2 size={14} /></button>
                          <button onClick={() => deleteAccount(a.id)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 bg-transparent border-none cursor-pointer"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No accounts found</div>}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Plus, Download, Search, Trash2, Edit2, X, Save, Users } from 'lucide-react';

const STAGES = ['Uncontacted', 'Contacted', 'Meeting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const stageColors = {
  'Uncontacted': 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  'Contacted': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'Meeting': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'Proposal': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Negotiation': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  'Closed Won': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Closed Lost': 'bg-red-500/10 text-red-400 border border-red-500/20',
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
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users size={14} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Accounts</h2>
            <p className="text-[11px] text-slate-600">{filtered.length} of {accounts.length} accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs">
            <Plus size={13} /> Add Account
          </button>
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 text-xs">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search accounts..."
            className="input w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="input px-3 py-2.5 text-sm"
        >
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card p-4 animate-fade-in-up border-blue-500/20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))} placeholder="Company name" className="input px-3 py-2.5 text-sm" />
            <input value={newAccount.industry} onChange={e => setNewAccount(p => ({ ...p, industry: e.target.value }))} placeholder="Industry" className="input px-3 py-2.5 text-sm" />
            <input value={newAccount.territory} onChange={e => setNewAccount(p => ({ ...p, territory: e.target.value }))} placeholder="Territory" className="input px-3 py-2.5 text-sm" />
            <input type="number" value={newAccount.deal_value} onChange={e => setNewAccount(p => ({ ...p, deal_value: Number(e.target.value) }))} placeholder="Deal value" className="input px-3 py-2.5 text-sm" />
            <div className="flex gap-2">
              <button onClick={addAccount} className="btn-primary flex-1 px-3 py-2.5 text-xs">Add</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost px-3 py-2.5 text-xs"><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#162032]">
                <th className="text-left px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Account</th>
                <th className="text-left px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Industry</th>
                <th className="text-left px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Territory</th>
                <th className="text-left px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">ICP</th>
                <th className="text-left px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Stage</th>
                <th className="text-left px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Deal Value</th>
                <th className="text-right px-5 py-3.5 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="table-row border-b border-[#162032]/50">
                  <td className="px-5 py-3.5 text-white font-medium text-xs">{a.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{a.industry}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{a.territory}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-blue-400">{a.icp_score || '-'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {editId === a.id ? (
                      <select value={editData.stage || a.stage} onChange={e => setEditData(p => ({ ...p, stage: e.target.value }))} className="input px-2 py-1 text-xs">
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`badge ${stageColors[a.stage] || stageColors['Uncontacted']}`}>{a.stage}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{a.deal_value ? `$${(a.deal_value / 1000).toFixed(0)}k` : '-'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editId === a.id ? (
                        <>
                          <button onClick={() => updateAccount(a.id)} className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-400 bg-transparent border-none cursor-pointer transition-colors"><Save size={13} /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 bg-transparent border-none cursor-pointer transition-colors"><X size={13} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(a.id); setEditData({ stage: a.stage, deal_value: a.deal_value }); }} className="p-1.5 rounded-md hover:bg-white/5 text-slate-600 hover:text-slate-300 bg-transparent border-none cursor-pointer transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => deleteAccount(a.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-600 hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors"><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-xs text-slate-600">No accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

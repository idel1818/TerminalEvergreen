import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { Plus, Download, Search, Trash2, Edit2, X, Save, Eye } from 'lucide-react';

const STAGES = ['Uncontacted', 'Contacted', 'Meeting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const stageStyles = {
  'Uncontacted': { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', dot: '#94a3b8' },
  'Contacted': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', dot: '#3b82f6' },
  'Meeting': { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', dot: '#8b5cf6' },
  'Proposal': { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', dot: '#f59e0b' },
  'Negotiation': { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', dot: '#f97316' },
  'Closed Won': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', dot: '#22c55e' },
  'Closed Lost': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', dot: '#ef4444' },
};

function getIcpColor(score) {
  if (!score) return { bg: 'rgba(71, 85, 105, 0.15)', text: '#475569' };
  if (score >= 80) return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' };
  if (score >= 60) return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
  if (score >= 40) return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
  return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
}

export default function AccountsPage() {
  const { workspace } = useWorkspace();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'All');
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
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Accounts</h2>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
            {filtered.length} of {accounts.length} accounts
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={13} /> Add Account
          </button>
          <button onClick={exportCSV} className="btn-ghost" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search accounts..."
            className="input"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10 }}
          />
        </div>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="input"
          style={{ padding: '10px 16px' }}
        >
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card animate-fade-in-up" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <input value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))} placeholder="Company name" className="input" style={{ padding: '10px 14px' }} />
            <input value={newAccount.industry} onChange={e => setNewAccount(p => ({ ...p, industry: e.target.value }))} placeholder="Industry" className="input" style={{ padding: '10px 14px' }} />
            <input value={newAccount.territory} onChange={e => setNewAccount(p => ({ ...p, territory: e.target.value }))} placeholder="Territory" className="input" style={{ padding: '10px 14px' }} />
            <input type="number" value={newAccount.deal_value} onChange={e => setNewAccount(p => ({ ...p, deal_value: Number(e.target.value) }))} placeholder="Deal value" className="input" style={{ padding: '10px 14px' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addAccount} className="btn-primary" style={{ flex: 1, padding: '10px 14px' }}>Add</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost" style={{ padding: '10px 14px' }}><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Industry</th>
                <th>Territory</th>
                <th>ICP</th>
                <th>Stage</th>
                <th>Deal Value</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const stageStyle = stageStyles[a.stage] || stageStyles['Uncontacted'];
                const icpColor = getIcpColor(a.icp_score);
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.industry}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.territory}</td>
                    <td>
                      <span className="icp-pill" style={{ background: icpColor.bg, color: icpColor.text }}>
                        {a.icp_score || '—'}
                      </span>
                    </td>
                    <td>
                      {editId === a.id ? (
                        <select value={editData.stage || a.stage} onChange={e => setEditData(p => ({ ...p, stage: e.target.value }))} className="input" style={{ padding: '4px 8px', fontSize: 12 }}>
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className="stage-pill" style={{ background: stageStyle.bg, color: stageStyle.text }}>
                          <span className="dot" style={{ background: stageStyle.dot }} />
                          {a.stage}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>
                      {a.deal_value ? `$${(a.deal_value / 1000).toFixed(0)}k` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        {editId === a.id ? (
                          <>
                            <button onClick={() => updateAccount(a.id)} title="Save" style={{
                              padding: 6, borderRadius: 6, border: 'none', background: 'transparent',
                              color: 'var(--success)', cursor: 'pointer', display: 'flex',
                            }}><Save size={14} /></button>
                            <button onClick={() => setEditId(null)} title="Cancel" style={{
                              padding: 6, borderRadius: 6, border: 'none', background: 'transparent',
                              color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                            }}><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(a.id); setEditData({ stage: a.stage, deal_value: a.deal_value }); }} title="Edit" style={{
                              padding: 6, borderRadius: 6, border: 'none', background: 'transparent',
                              color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                            ><Edit2 size={14} /></button>
                            <button onClick={() => deleteAccount(a.id)} title="Delete" style={{
                              padding: 6, borderRadius: 6, border: 'none', background: 'transparent',
                              color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                            ><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)', fontSize: 12 }}>
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

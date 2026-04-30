import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function SwitchModal({ onClose }) {
  const { workspaces, switchWorkspace, fetchWorkspaces, configureCompany } = useWorkspace();
  const [search, setSearch] = useState('');
  const [configuring, setConfiguring] = useState(false);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const filtered = workspaces.filter(w =>
    w.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSwitch = async (id) => {
    await switchWorkspace(id);
    onClose();
  };

  const handleConfigure = async () => {
    if (!search.trim()) return;
    setConfiguring(true);
    try {
      await configureCompany(search.trim());
      onClose();
    } catch (e) {
      alert(e.message);
    }
    setConfiguring(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Switch Company</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 bg-transparent border-none cursor-pointer transition-colors"><X size={16} /></button>
        </div>
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search or type a new company name..."
            className="input w-full pl-9 pr-4 py-2.5 text-sm"
            autoFocus
          />
        </div>
        <div className="space-y-1.5 max-h-56 overflow-y-auto mb-4">
          {filtered.length === 0 && !search && <p className="text-xs text-slate-600 text-center py-6">No workspaces configured yet</p>}
          {filtered.map(w => (
            <button
              key={w.id}
              onClick={() => handleSwitch(w.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-transparent border border-[#162032] hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer text-left"
            >
              {w.logo_url ? (
                <img src={w.logo_url} alt="" className="w-7 h-7 rounded" />
              ) : (
                <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold">{w.company_name[0]?.toUpperCase()}</div>
              )}
              <div>
                <div className="text-xs text-white font-medium">{w.company_name}</div>
                <div className="text-[10px] text-slate-600">{w.domain} · {new Date(w.updated_at).toLocaleDateString()}</div>
              </div>
            </button>
          ))}
        </div>
        {search && (
          <button
            onClick={handleConfigure}
            disabled={configuring}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-xs"
          >
            <Plus size={14} />
            {configuring ? 'Configuring...' : `Configure "${search}" as new company`}
          </button>
        )}
      </div>
    </div>
  );
}

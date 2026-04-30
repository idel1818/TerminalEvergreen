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
      <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Switch Company</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"><X size={20} /></button>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search or type a new company name..."
            className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
            autoFocus
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {filtered.length === 0 && !search && <p className="text-sm text-slate-500 text-center py-4">No workspaces configured yet</p>}
          {filtered.map(w => (
            <button
              key={w.id}
              onClick={() => handleSwitch(w.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0a0e1a] border border-[#1e293b] hover:border-blue-500/50 transition-colors cursor-pointer text-left"
            >
              {w.logo_url ? <img src={w.logo_url} alt="" className="w-8 h-8 rounded" /> : <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">{w.company_name[0]}</div>}
              <div>
                <div className="text-sm text-white font-medium">{w.company_name}</div>
                <div className="text-xs text-slate-500">{w.domain} · Last updated {new Date(w.updated_at).toLocaleDateString()}</div>
              </div>
            </button>
          ))}
        </div>
        {search && (
          <button
            onClick={handleConfigure}
            disabled={configuring}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium border-none cursor-pointer disabled:opacity-50"
          >
            <Plus size={16} />
            {configuring ? 'Configuring...' : `Configure "${search}" as new company`}
          </button>
        )}
      </div>
    </div>
  );
}

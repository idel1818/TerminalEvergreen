import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Swords, TrendingUp, TrendingDown, Shield, Edit2, Save, X, ExternalLink } from 'lucide-react';

export default function CompetitionPage() {
  const { workspace, config, updateConfig } = useWorkspace();
  const [editIdx, setEditIdx] = useState(null);
  const [editCard, setEditCard] = useState({});
  const [hnFeeds, setHnFeeds] = useState({});

  const competitors = config?.competitors || [];

  useEffect(() => {
    competitors.forEach(async (c) => {
      try {
        const res = await fetch(`/api/intelligence/sector?q=${encodeURIComponent(c.name)}`);
        const data = await res.json();
        setHnFeeds(prev => ({ ...prev, [c.name]: data.slice(0, 3) }));
      } catch {}
    });
  }, [config]);

  const saveEdit = async () => {
    if (editIdx === null) return;
    const updated = [...competitors];
    updated[editIdx] = { ...updated[editIdx], ...editCard };
    await updateConfig({ ...config, competitors: updated });
    setEditIdx(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Swords size={22} className="text-blue-400" /> Competition
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitors.map((comp, i) => (
          <div key={i} className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5 hover:border-blue-500/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{comp.name}</h3>
              <div className="flex items-center gap-2">
                {comp.status === 'winning' ? (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400"><TrendingUp size={12} /> {comp.status_label}</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400"><TrendingDown size={12} /> {comp.status_label}</span>
                )}
                <button onClick={() => { setEditIdx(i); setEditCard(comp); }} className="p-1 rounded hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"><Edit2 size={12} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="p-2 rounded bg-[#0a0e1a]">
                <span className="text-slate-500">Valuation</span>
                <div className="text-white font-medium">{comp.valuation || 'N/A'}</div>
              </div>
              <div className="p-2 rounded bg-[#0a0e1a]">
                <span className="text-slate-500">ARR</span>
                <div className="text-white font-medium">{comp.arr || 'N/A'}</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Differentiator</div>
              <p className="text-xs text-slate-300">{comp.differentiator}</p>
            </div>
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Our Advantage</div>
              <p className="text-xs text-emerald-400">{comp.our_advantage}</p>
            </div>

            {comp.battlecard && (
              <div className="p-3 rounded-lg bg-[#0a0e1a] border border-[#1e293b] mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield size={12} className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Battle Card</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="text-red-400">Strength:</span> <span className="text-slate-300">{comp.battlecard.their_strength}</span></div>
                  <div><span className="text-emerald-400">Weakness:</span> <span className="text-slate-300">{comp.battlecard.their_weakness}</span></div>
                  <div><span className="text-blue-400">Response:</span> <span className="text-slate-300">{comp.battlecard.one_line_response}</span></div>
                </div>
              </div>
            )}

            {hnFeeds[comp.name] && hnFeeds[comp.name].length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500">Recent News</div>
                {hnFeeds[comp.name].map((s, j) => (
                  <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white no-underline">
                    <ExternalLink size={10} className="shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditIdx(null)}>
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit {editCard.name}</h3>
              <button onClick={() => setEditIdx(null)} className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Differentiator</label>
                <textarea value={editCard.differentiator || ''} onChange={e => setEditCard(p => ({ ...p, differentiator: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none mt-1" rows={2} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Our Advantage</label>
                <textarea value={editCard.our_advantage || ''} onChange={e => setEditCard(p => ({ ...p, our_advantage: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none mt-1" rows={2} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Their Strength</label>
                <input value={editCard.battlecard?.their_strength || ''} onChange={e => setEditCard(p => ({ ...p, battlecard: { ...p.battlecard, their_strength: e.target.value } }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Their Weakness</label>
                <input value={editCard.battlecard?.their_weakness || ''} onChange={e => setEditCard(p => ({ ...p, battlecard: { ...p.battlecard, their_weakness: e.target.value } }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400">One-line Response</label>
                <input value={editCard.battlecard?.one_line_response || ''} onChange={e => setEditCard(p => ({ ...p, battlecard: { ...p.battlecard, one_line_response: e.target.value } }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none mt-1" />
              </div>
              <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm border-none cursor-pointer">
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

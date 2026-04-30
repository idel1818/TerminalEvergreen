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
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Swords size={14} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Competition</h2>
          <p className="text-[11px] text-slate-600">{competitors.length} competitors tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {competitors.map((comp, i) => (
          <div key={i} className="card p-5 group">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{comp.name}</h3>
              <div className="flex items-center gap-2">
                {comp.status === 'winning' ? (
                  <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <TrendingUp size={10} /> {comp.status_label}
                  </span>
                ) : (
                  <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                    <TrendingDown size={10} /> {comp.status_label}
                  </span>
                )}
                <button onClick={() => { setEditIdx(i); setEditCard(comp); }} className="p-1 rounded-md hover:bg-white/5 text-slate-600 hover:text-slate-300 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                  <Edit2 size={11} />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="card-inner p-2.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wider">Valuation</span>
                <div className="text-xs text-white font-semibold mt-0.5">{comp.valuation || 'N/A'}</div>
              </div>
              <div className="card-inner p-2.5">
                <span className="text-[10px] text-slate-600 uppercase tracking-wider">ARR</span>
                <div className="text-xs text-white font-semibold mt-0.5">{comp.arr || 'N/A'}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Differentiator</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{comp.differentiator}</p>
              </div>
              <div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Our Advantage</div>
                <p className="text-[11px] text-emerald-400/80 leading-relaxed">{comp.our_advantage}</p>
              </div>
            </div>

            {/* Battlecard */}
            {comp.battlecard && (
              <div className="card-inner p-3.5 mb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Shield size={11} className="text-amber-400" />
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Battle Card</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex gap-2">
                    <span className="text-red-400/80 shrink-0 font-medium">Strength:</span>
                    <span className="text-slate-400">{comp.battlecard.their_strength}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400/80 shrink-0 font-medium">Weakness:</span>
                    <span className="text-slate-400">{comp.battlecard.their_weakness}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-400/80 shrink-0 font-medium">Response:</span>
                    <span className="text-slate-400">{comp.battlecard.one_line_response}</span>
                  </div>
                </div>
              </div>
            )}

            {/* News */}
            {hnFeeds[comp.name] && hnFeeds[comp.name].length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-[#162032]">
                <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Recent News</div>
                {hnFeeds[comp.name].map((s, j) => (
                  <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-400 no-underline transition-colors">
                    <ExternalLink size={9} className="shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditIdx(null)}>
          <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Edit: {editCard.name}</h3>
              <button onClick={() => setEditIdx(null)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 bg-transparent border-none cursor-pointer"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider">Differentiator</label>
                <textarea value={editCard.differentiator || ''} onChange={e => setEditCard(p => ({ ...p, differentiator: e.target.value }))} className="input w-full mt-1 px-3 py-2 text-xs h-16 resize-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider">Our Advantage</label>
                <textarea value={editCard.our_advantage || ''} onChange={e => setEditCard(p => ({ ...p, our_advantage: e.target.value }))} className="input w-full mt-1 px-3 py-2 text-xs h-16 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveEdit} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs"><Save size={12} /> Save</button>
                <button onClick={() => setEditIdx(null)} className="btn-ghost px-4 py-2 text-xs">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Briefcase, Target, Calculator, Shield, Mail, Edit2, Save, X } from 'lucide-react';

export default function SalesKitPage() {
  const { config, updateConfig } = useWorkspace();
  const [tab, setTab] = useState('selling_points');
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState({});
  const [roiInputs, setRoiInputs] = useState({
    headcount: config?.roi_model?.default_headcount || 50,
    salary: config?.roi_model?.default_salary || 150000,
    maintenance_pct: config?.roi_model?.default_maintenance_pct || 30,
  });

  const tabs = [
    { id: 'selling_points', label: 'Selling Points', icon: Target },
    { id: 'roi', label: 'ROI Calculator', icon: Calculator },
    { id: 'objections', label: 'Objections', icon: Shield },
    { id: 'email_templates', label: 'Templates', icon: Mail },
  ];

  const saveEdit = async (section) => {
    if (editIdx === null) return;
    const updated = [...(config[section] || [])];
    updated[editIdx] = { ...updated[editIdx], ...editData };
    await updateConfig({ ...config, [section]: updated });
    setEditIdx(null);
  };

  const lanes = config?.roi_model?.lanes || [];
  const totalMaintenance = roiInputs.headcount * roiInputs.salary * (roiInputs.maintenance_pct / 100);
  const totalSavings = lanes.reduce((sum, lane) => {
    const laneCost = totalMaintenance * (lane.default_share / 100);
    const savings = laneCost * (1 - 1 / lane.speedup);
    return sum + savings;
  }, 0);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Briefcase size={14} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Sales Kit</h2>
          <p className="text-[11px] text-slate-600">Selling points, ROI, objections & templates</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-[#0c1220] rounded-lg px-1 py-1 border border-[#162032] w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium border-none cursor-pointer transition-all ${tab === t.id ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] bg-transparent'}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'selling_points' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config?.selling_points || []).map((sp, i) => (
            <div key={i} className="card p-5 group">
              <div className="flex items-center justify-between mb-3">
                <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">{sp.persona}</span>
                <button onClick={() => { setEditIdx(i); setEditData(sp); }} className="p-1 rounded-md hover:bg-white/5 text-slate-600 hover:text-slate-300 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={11} /></button>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{sp.title}</h3>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{sp.one_liner}</p>
              <div className="space-y-1.5">
                <div className="text-[11px]"><span className="text-emerald-400/80 font-medium">Proof:</span> <span className="text-slate-500">{sp.proof}</span></div>
                <div className="text-[11px]"><span className="text-blue-400/80 font-medium">Next step:</span> <span className="text-slate-500">{sp.next_step}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'roi' && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-white mb-5">ROI Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Engineering Headcount</label>
              <input type="number" value={roiInputs.headcount} onChange={e => setRoiInputs(p => ({ ...p, headcount: Number(e.target.value) }))} className="input w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Avg. Salary ($)</label>
              <input type="number" value={roiInputs.salary} onChange={e => setRoiInputs(p => ({ ...p, salary: Number(e.target.value) }))} className="input w-full px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Maintenance Cost (%)</label>
              <input type="number" value={roiInputs.maintenance_pct} onChange={e => setRoiInputs(p => ({ ...p, maintenance_pct: Number(e.target.value) }))} className="input w-full px-3 py-2.5 text-sm" />
            </div>
          </div>

          <div className="space-y-2.5 mb-6">
            {lanes.map((lane, i) => {
              const laneCost = totalMaintenance * (lane.default_share / 100);
              const savings = laneCost * (1 - 1 / lane.speedup);
              return (
                <div key={i} className="card-inner flex items-center justify-between p-3.5">
                  <div>
                    <div className="text-xs text-white font-medium">{lane.name}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{lane.benchmark}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-400 font-mono font-semibold">${(savings / 1000).toFixed(0)}k saved</div>
                    <div className="text-[10px] text-slate-600">{lane.speedup}x speedup</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-5 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl text-center">
            <div className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold mb-1">Total Annual Savings</div>
            <div className="text-3xl font-bold text-emerald-400 font-mono glow-text-green">${(totalSavings / 1000).toFixed(0)}k</div>
          </div>
        </div>
      )}

      {tab === 'objections' && (
        <div className="space-y-3">
          {(config?.objections || []).map((obj, i) => (
            <div key={i} className="card p-5 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400/90">"{obj.objection}"</span>
                </div>
                <button onClick={() => { setEditIdx(i); setEditData(obj); }} className="p-1 rounded-md hover:bg-white/5 text-slate-600 hover:text-slate-300 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={11} /></button>
              </div>
              <div className="pl-5 space-y-2">
                <div className="text-[11px]"><span className="text-emerald-400/80 font-medium">Response:</span> <span className="text-slate-400">{obj.response}</span></div>
                <div className="text-[11px]"><span className="text-blue-400/80 font-medium">Proof:</span> <span className="text-slate-400">{obj.proof}</span></div>
                <div className="text-[11px]"><span className="text-purple-400/80 font-medium">Ask next:</span> <span className="text-slate-400">{obj.ask_next}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'email_templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config?.email_templates || []).map((t, i) => (
            <div key={i} className="card p-5 group">
              <div className="flex items-center justify-between mb-3">
                <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">{t.vertical}</span>
                <button onClick={() => { setEditIdx(i); setEditData(t); }} className="p-1 rounded-md hover:bg-white/5 text-slate-600 hover:text-slate-300 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={11} /></button>
              </div>
              <div className="text-xs font-medium text-white mb-2">{t.subject}</div>
              <div className="text-[11px] text-slate-500 whitespace-pre-wrap leading-relaxed">{t.body}</div>
            </div>
          ))}
        </div>
      )}

      {editIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditIdx(null)}>
          <div className="card w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Edit</h3>
              <button onClick={() => setEditIdx(null)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 bg-transparent border-none cursor-pointer"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              {Object.entries(editData).map(([key, val]) => (
                typeof val === 'string' && (
                  <div key={key}>
                    <label className="text-[10px] text-slate-600 uppercase tracking-wider capitalize">{key.replace(/_/g, ' ')}</label>
                    <textarea value={val} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} className="input w-full px-3 py-2 text-xs mt-1 resize-none" rows={key === 'body' ? 4 : 2} />
                  </div>
                )
              ))}
              <button onClick={() => saveEdit(tab)} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs">
                <Save size={12} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

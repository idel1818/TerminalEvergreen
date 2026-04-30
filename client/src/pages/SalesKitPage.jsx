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
    { id: 'objections', label: 'Objection Handler', icon: Shield },
    { id: 'templates', label: 'Email Templates', icon: Mail },
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
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Briefcase size={22} className="text-blue-400" /> Sales Kit
      </h2>

      <div className="flex items-center gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border-none cursor-pointer transition-colors ${tab === t.id ? 'bg-blue-500/20 text-blue-400' : 'bg-[#131a2e] text-slate-400 hover:text-white'}`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'selling_points' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config?.selling_points || []).map((sp, i) => (
            <div key={i} className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{sp.persona}</span>
                <button onClick={() => { setEditIdx(i); setEditData(sp); }} className="p-1 rounded hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"><Edit2 size={12} /></button>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{sp.title}</h3>
              <p className="text-xs text-slate-300 mb-2">{sp.one_liner}</p>
              <div className="text-xs text-emerald-400 mb-1">Proof: {sp.proof}</div>
              <div className="text-xs text-blue-400">Next step: {sp.next_step}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'roi' && (
        <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ROI Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Engineering Headcount</label>
              <input type="number" value={roiInputs.headcount} onChange={e => setRoiInputs(p => ({ ...p, headcount: Number(e.target.value) }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Avg. Salary ($)</label>
              <input type="number" value={roiInputs.salary} onChange={e => setRoiInputs(p => ({ ...p, salary: Number(e.target.value) }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-white outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Maintenance Cost (%)</label>
              <input type="number" value={roiInputs.maintenance_pct} onChange={e => setRoiInputs(p => ({ ...p, maintenance_pct: Number(e.target.value) }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-white outline-none" />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {lanes.map((lane, i) => {
              const laneCost = totalMaintenance * (lane.default_share / 100);
              const savings = laneCost * (1 - 1 / lane.speedup);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0a0e1a] rounded-lg">
                  <div>
                    <div className="text-sm text-white">{lane.name}</div>
                    <div className="text-xs text-slate-500">{lane.benchmark}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-emerald-400 font-mono">${(savings / 1000).toFixed(0)}k saved</div>
                    <div className="text-xs text-slate-500">{lane.speedup}x speedup</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <div className="text-sm text-emerald-400 mb-1">Total Annual Savings</div>
            <div className="text-3xl font-bold text-emerald-400 font-mono">${(totalSavings / 1000).toFixed(0)}k</div>
          </div>
        </div>
      )}

      {tab === 'objections' && (
        <div className="space-y-4">
          {(config?.objections || []).map((obj, i) => (
            <div key={i} className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-red-400" />
                  <span className="text-sm font-medium text-red-400">"{obj.objection}"</span>
                </div>
                <button onClick={() => { setEditIdx(i); setEditData(obj); }} className="p-1 rounded hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"><Edit2 size={12} /></button>
              </div>
              <div className="pl-6 space-y-2">
                <div><span className="text-xs text-emerald-400 font-medium">Response:</span> <span className="text-xs text-slate-300">{obj.response}</span></div>
                <div><span className="text-xs text-blue-400 font-medium">Proof:</span> <span className="text-xs text-slate-300">{obj.proof}</span></div>
                <div><span className="text-xs text-purple-400 font-medium">Ask next:</span> <span className="text-xs text-slate-300">{obj.ask_next}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config?.email_templates || []).map((t, i) => (
            <div key={i} className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">{t.vertical}</span>
                <button onClick={() => { setEditIdx(i); setEditData(t); }} className="p-1 rounded hover:bg-white/10 text-slate-400 bg-transparent border-none cursor-pointer"><Edit2 size={12} /></button>
              </div>
              <div className="text-sm font-medium text-white mb-2">{t.subject}</div>
              <div className="text-xs text-slate-400 whitespace-pre-wrap">{t.body}</div>
            </div>
          ))}
        </div>
      )}

      {editIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditIdx(null)}>
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl w-full max-w-lg p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit</h3>
              <button onClick={() => setEditIdx(null)} className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {Object.entries(editData).map(([key, val]) => (
                typeof val === 'string' && (
                  <div key={key}>
                    <label className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</label>
                    <textarea value={val} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none mt-1" rows={key === 'body' ? 4 : 2} />
                  </div>
                )
              ))}
              <button onClick={() => saveEdit(tab)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm border-none cursor-pointer">
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

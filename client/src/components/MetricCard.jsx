export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const styles = {
    blue: { bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20', icon: 'text-blue-400 bg-blue-500/10', text: 'text-blue-400' },
    green: { bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20', icon: 'text-emerald-400 bg-emerald-500/10', text: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/20', icon: 'text-amber-400 bg-amber-500/10', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/[0.06]', border: 'border-purple-500/20', icon: 'text-purple-400 bg-purple-500/10', text: 'text-purple-400' },
    red: { bg: 'bg-red-500/[0.06]', border: 'border-red-500/20', icon: 'text-red-400 bg-red-500/10', text: 'text-red-400' },
  };

  const s = styles[color];

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 backdrop-blur-sm transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{title}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg ${s.icon} flex items-center justify-center`}>
            <Icon size={13} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {subtitle && <div className="text-[11px] text-slate-500 mt-1.5">{subtitle}</div>}
    </div>
  );
}

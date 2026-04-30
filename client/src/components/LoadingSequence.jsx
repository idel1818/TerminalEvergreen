import { CheckCircle, Loader2, Terminal } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function LoadingSequence() {
  const { loadingSteps } = useWorkspace();

  return (
    <div className="min-h-screen bg-[#060a13] bg-dot-pattern flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/[0.03] rounded-full blur-[80px] pointer-events-none" />

      <div className="card p-8 w-full max-w-sm relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Terminal size={14} className="text-blue-400" />
          </div>
          <span className="font-mono text-blue-400 text-sm font-semibold glow-text">Configuring Terminal...</span>
        </div>
        <div className="space-y-3">
          {loadingSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 animate-slide-in" style={{ animationDelay: `${i * 0.08}s` }}>
              {step.done ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Loader2 size={13} className="text-blue-400 animate-spin" />
                </div>
              )}
              <span className={`font-mono text-xs ${step.done ? 'text-emerald-400/80' : 'text-slate-400'}`}>{step.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 h-1 rounded-full bg-[#162032] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${loadingSteps.length > 0 ? (loadingSteps.filter(s => s.done).length / Math.max(loadingSteps.length, 5)) * 100 : 5}%` }}
          />
        </div>
      </div>
    </div>
  );
}

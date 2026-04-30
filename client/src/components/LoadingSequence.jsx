import { CheckCircle, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function LoadingSequence() {
  const { loadingSteps } = useWorkspace();

  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-dot-pattern flex items-center justify-center">
      <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-8 w-full max-w-md">
        <div className="font-mono text-blue-400 text-lg mb-6 glow-text">Configuring Terminal...</div>
        <div className="space-y-3">
          {loadingSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
              {step.done ? (
                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
              ) : (
                <Loader2 size={18} className="text-blue-400 animate-spin shrink-0" />
              )}
              <span className={`font-mono text-sm ${step.done ? 'text-emerald-400' : 'text-slate-300'}`}>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

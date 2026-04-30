import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight, Zap, Database, Brain, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import LoadingSequence from '../components/LoadingSequence';

export default function HomePage() {
  const { workspace, loading, configureCompany, fetchWorkspaces, workspaces, switchWorkspace } = useWorkspace();
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  if (loading) return <LoadingSequence />;

  if (workspace) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError('');
    try {
      await configureCompany(companyName.trim());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickSwitch = async (id) => {
    await switchWorkspace(id);
  };

  return (
    <div className="min-h-screen bg-[#060a13] bg-dot-pattern flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-float">
            <Terminal size={24} className="text-blue-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          <span className="font-mono text-blue-400 glow-text">&gt;_</span> GTM Terminal
        </h1>

        <p className="text-sm text-slate-400 mb-10 leading-relaxed max-w-md mx-auto">
          The sales intelligence terminal that configures itself.<br />
          Type any company name to get started.
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center">
              <span className="absolute left-4 text-blue-400 font-mono text-base">&gt;</span>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Type a company name..."
                className="w-full bg-[#0c1220] border border-[#1e293b] rounded-xl pl-9 pr-4 py-3.5 text-base text-white placeholder-slate-600 font-mono outline-none focus:border-blue-500/40 transition-colors relative"
                autoFocus
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!companyName.trim()}
            className="btn-primary mt-5 inline-flex items-center gap-2 px-8 py-3 text-sm"
          >
            Configure Terminal <ArrowRight size={16} />
          </button>
          {error && (
            <div className="mt-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>

        {workspaces.length > 0 && (
          <div className="mb-10">
            <h3 className="section-title mb-3">Recently configured</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {workspaces.slice(0, 5).map(w => (
                <button
                  key={w.id}
                  onClick={() => handleQuickSwitch(w.id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0c1220] border border-[#162032] hover:border-blue-500/30 text-sm text-slate-300 hover:text-white cursor-pointer transition-all hover:bg-[#0f1629]"
                >
                  {w.logo_url ? (
                    <img src={w.logo_url} alt="" className="w-4 h-4 rounded" />
                  ) : (
                    <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-[9px] font-bold">{w.company_name[0]?.toUpperCase()}</div>
                  )}
                  <span className="text-xs font-medium">{w.company_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Terminal, step: '01', text: 'Type company name' },
            { icon: Database, step: '02', text: 'Enrich from 5 sources' },
            { icon: Brain, step: '03', text: 'AI generates config' },
            { icon: Clock, step: '04', text: 'Terminal ready' },
          ].map(({ icon: Icon, step, text }) => (
            <div key={step} className="p-3 rounded-xl bg-[#0c1220]/80 border border-[#162032] group hover:border-blue-500/20 transition-colors">
              <Icon size={18} className="text-blue-400/70 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
              <div className="font-mono text-[10px] text-blue-400/50 mb-0.5">{step}</div>
              <div className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">{text}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-6 text-[10px] text-slate-700 font-mono tracking-wider uppercase">
        Powered by GTM Terminal
      </footer>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#0a0e1a] bg-dot-pattern flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Terminal size={40} className="text-blue-400" />
          <h1 className="text-4xl font-bold text-white font-mono">
            <span className="text-blue-400">&gt;_</span> GTM Terminal
          </h1>
        </div>

        <p className="text-lg text-slate-400 mb-8">
          The sales intelligence terminal that configures itself.<br />
          Type any company name to get started.
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-mono text-lg">&gt;</span>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Type a company name..."
              className="w-full bg-[#131a2e] border-2 border-[#1e293b] rounded-xl pl-10 pr-4 py-4 text-lg text-white placeholder-slate-600 font-mono outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
            <span className="absolute right-16 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-400 animate-cursor" />
          </div>
          <button
            type="submit"
            disabled={!companyName.trim()}
            className="mt-4 inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Configure Terminal <ArrowRight size={18} />
          </button>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </form>

        {workspaces.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm text-slate-500 mb-3 uppercase tracking-wider">Recently configured</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {workspaces.slice(0, 5).map(w => (
                <button
                  key={w.id}
                  onClick={() => handleQuickSwitch(w.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#131a2e] border border-[#1e293b] hover:border-blue-500/50 text-sm text-white cursor-pointer transition-colors"
                >
                  {w.logo_url ? <img src={w.logo_url} alt="" className="w-5 h-5 rounded" /> : <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold">{w.company_name[0]}</div>}
                  {w.company_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Terminal, step: '01', text: 'Type your company name' },
            { icon: Database, step: '02', text: 'We enrich with 5 data sources' },
            { icon: Brain, step: '03', text: 'AI generates your full GTM config' },
            { icon: Clock, step: '04', text: 'Terminal ready in ~10 seconds' },
          ].map(({ icon: Icon, step, text }) => (
            <div key={step} className="p-4 rounded-lg bg-[#131a2e] border border-[#1e293b]">
              <Icon size={24} className="text-blue-400 mx-auto mb-2" />
              <div className="font-mono text-blue-400 text-xs mb-1">{step}</div>
              <div className="text-xs text-slate-400">{text}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-4 text-xs text-slate-600 font-mono">
        POWERED BY GTM TERMINAL
      </footer>
    </div>
  );
}

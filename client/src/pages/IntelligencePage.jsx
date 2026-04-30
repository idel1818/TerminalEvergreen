import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Search, Rss, Users, Briefcase, ExternalLink, Brain, Loader2 } from 'lucide-react';

export default function IntelligencePage() {
  const { workspace, config } = useWorkspace();
  const [tab, setTab] = useState('sector');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!config?.company?.name) return;
    const defaultQuery = tab === 'sector' ? config.company.industry || config.company.name
      : tab === 'accounts' ? config.company.name
      : config.company.name + ' hiring';
    setQuery(defaultQuery);
    fetchResults(defaultQuery, tab);
  }, [tab, config]);

  const fetchResults = async (q, t) => {
    setLoading(true);
    const endpoint = t === 'sector' ? '/api/intelligence/sector'
      : t === 'accounts' ? '/api/intelligence/accounts'
      : '/api/intelligence/hiring';
    const res = await fetch(`${endpoint}?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults(query, tab);
  };

  const tabs = [
    { id: 'sector', label: 'Sector Feed', icon: Rss },
    { id: 'accounts', label: 'Account Signals', icon: Users },
    { id: 'hiring', label: 'Hiring Signals', icon: Briefcase },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Brain size={14} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Intelligence</h2>
          <p className="text-[11px] text-slate-600">Real-time signals from public sources</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-[#0c1220] rounded-lg px-1 py-1 border border-[#162032] w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium border-none cursor-pointer transition-all ${
                tab === t.id
                  ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] bg-transparent'
              }`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="input w-full pl-9 pr-4 py-2.5 text-sm" placeholder="Search..." />
        </div>
        <button type="submit" className="btn-primary px-5 py-2.5 text-xs">Search</button>
      </form>

      <div className="space-y-2.5">
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-xs">
            <Loader2 size={14} className="animate-spin" /> Loading intelligence...
          </div>
        )}
        {!loading && results.length === 0 && <div className="text-center py-12 text-slate-600 text-xs">No results found</div>}
        {!loading && results.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block card p-4 hover:border-blue-500/20 transition-all no-underline group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors mb-1">{item.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-600">
                  {item.source && <span className="font-medium">{item.source}</span>}
                  <span className="font-mono">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
              <ExternalLink size={12} className="text-slate-700 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

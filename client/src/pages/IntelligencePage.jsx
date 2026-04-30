import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Search, Rss, Users, Briefcase, ExternalLink } from 'lucide-react';

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
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white">Intelligence</h2>

      <div className="flex items-center gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border-none cursor-pointer transition-colors ${
                tab === t.id ? 'bg-blue-500/20 text-blue-400' : 'bg-[#131a2e] text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-[#131a2e] border border-[#1e293b] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50" placeholder="Search..." />
        </div>
        <button type="submit" className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm border-none cursor-pointer">Search</button>
      </form>

      <div className="space-y-3">
        {loading && <div className="text-center py-8 text-slate-500">Loading intelligence...</div>}
        {!loading && results.length === 0 && <div className="text-center py-8 text-slate-500">No results found</div>}
        {results.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-[#131a2e] border border-[#1e293b] rounded-xl hover:border-blue-500/30 transition-colors no-underline"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {item.source && <span>{item.source}</span>}
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-500 shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

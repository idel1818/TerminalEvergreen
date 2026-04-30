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
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Intelligence</h2>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          Real-time signals from public sources
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                border: active ? '0.5px solid var(--border-bright)' : '0.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} className="input" style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10 }} placeholder="Search..." />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8, color: 'var(--text-tertiary)', fontSize: 12 }}>
            <Loader2 size={14} className="animate-spin" /> Loading intelligence...
          </div>
        )}
        {!loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>No results found</div>
        )}
        {!loading && results.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{
              padding: '16px 20px', textDecoration: 'none', display: 'block',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {item.source && <span style={{ fontWeight: 500 }}>{item.source}</span>}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{new Date(item.date).toLocaleDateString()}</span>
                  {item.points && <span>{item.points} pts</span>}
                  {item.comments && <span>{item.comments} comments</span>}
                </div>
              </div>
              <ExternalLink size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, BarChart3, Users, Send, Brain, Swords, Globe, Briefcase, Settings, ArrowLeftRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import SwitchModal from './SwitchModal';

const navItems = [
  { path: '/', label: 'Command', icon: BarChart3 },
  { path: '/accounts', label: 'Accounts', icon: Users },
  { path: '/outreach', label: 'Outreach', icon: Send },
  { path: '/intelligence', label: 'Intelligence', icon: Brain },
  { path: '/competition', label: 'Competition', icon: Swords },
  { path: '/battle-map', label: 'Battle Map', icon: Globe },
  { path: '/sales-kit', label: 'Sales Kit', icon: Briefcase },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { workspace, config } = useWorkspace();
  const location = useLocation();
  const [showSwitch, setShowSwitch] = useState(false);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav style={{
        height: 52,
        background: 'rgba(7, 11, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 20px' }}>
          {/* Left: Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
              <span style={{ color: 'var(--accent)' }}>&gt;_</span>{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>GTM Terminal</span>
            </span>
          </Link>

          {/* Centre: Nav links */}
          {workspace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {navItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 13,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                      transition: 'color 0.15s, border-color 0.15s',
                      marginBottom: -1,
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <Icon size={14} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right: Company + Switch + Clock + LIVE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {workspace && config?.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {config.company.logo_url ? (
                  <img src={config.company.logo_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', fontSize: 10, fontWeight: 700,
                  }}>
                    {config.company.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{config.company.name}</span>
              </div>
            )}
            {workspace && (
              <button
                onClick={() => setShowSwitch(true)}
                className="btn-ghost"
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ArrowLeftRight size={11} /> Switch
                </span>
              </button>
            )}
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'var(--text-tertiary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {utcTime}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="animate-live-pulse" style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--success)',
              }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
            </div>
          </div>
        </div>
      </nav>
      {showSwitch && <SwitchModal onClose={() => setShowSwitch(false)} />}
    </>
  );
}

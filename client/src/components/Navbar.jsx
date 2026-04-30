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
      <nav className="border-b border-[#1e293b] bg-[#0a0e1a]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-blue-400 font-semibold no-underline">
              <Terminal size={20} />
              <span className="font-mono text-sm">GTM Terminal</span>
            </Link>
            {workspace && (
              <div className="flex items-center gap-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs no-underline transition-colors ${
                        active ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {workspace && config?.company && (
              <div className="flex items-center gap-2">
                {config.company.logo_url && (
                  <img src={config.company.logo_url} alt="" className="w-6 h-6 rounded" />
                )}
                <span className="text-sm text-white font-medium">{config.company.name}</span>
              </div>
            )}
            {workspace && (
              <button
                onClick={() => setShowSwitch(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1e293b] text-xs text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors bg-transparent cursor-pointer"
              >
                <ArrowLeftRight size={12} />
                Switch
              </button>
            )}
            <span className="font-mono text-xs text-slate-500">{utcTime}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">LIVE</span>
            </div>
          </div>
        </div>
      </nav>
      {showSwitch && <SwitchModal onClose={() => setShowSwitch(false)} />}
    </>
  );
}

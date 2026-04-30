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
      <nav className="border-b border-[#162032] bg-[#060a13]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 h-12">
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2 text-blue-400 font-semibold no-underline group">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Terminal size={14} className="text-blue-400" />
              </div>
              <span className="font-mono text-sm font-semibold tracking-tight">GTM Terminal</span>
            </Link>
            {workspace && (
              <div className="flex items-center gap-0.5 bg-[#0c1220] rounded-lg px-1 py-0.5 border border-[#162032]">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium no-underline transition-all ${
                        active
                          ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon size={13} />
                      <span className="hidden xl:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {workspace && config?.company && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0c1220] border border-[#162032]">
                {config.company.logo_url && (
                  <img src={config.company.logo_url} alt="" className="w-5 h-5 rounded" />
                )}
                <span className="text-xs text-white font-semibold">{config.company.name}</span>
              </div>
            )}
            {workspace && (
              <button
                onClick={() => setShowSwitch(true)}
                className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                <ArrowLeftRight size={11} />
                Switch
              </button>
            )}
            <span className="font-mono text-[10px] text-slate-600 tabular-nums">{utcTime}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </nav>
      {showSwitch && <SwitchModal onClose={() => setShowSwitch(false)} />}
    </>
  );
}

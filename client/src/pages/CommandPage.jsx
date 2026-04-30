import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Users, DollarSign, Send, MessageSquare, Calendar, MapPin, Activity, AlertTriangle, ExternalLink } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CommandPage() {
  const { workspace, config } = useWorkspace();
  const [accounts, setAccounts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [outreach, setOutreach] = useState([]);
  const [hnStories, setHnStories] = useState([]);

  useEffect(() => {
    if (!workspace) return;
    fetch(`/api/workspaces/${workspace.id}/accounts`).then(r => r.json()).then(setAccounts);
    fetch(`/api/workspaces/${workspace.id}/activities`).then(r => r.json()).then(setActivities);
    fetch(`/api/workspaces/${workspace.id}/outreach`).then(r => r.json()).then(setOutreach);
    fetch(`/api/intelligence/sector?q=${encodeURIComponent(config?.company?.name || '')}`).then(r => r.json()).then(setHnStories);
  }, [workspace, config]);

  const stages = ['Uncontacted', 'Contacted', 'Meeting', 'Proposal', 'Negotiation', 'Closed Won'];
  const funnelData = stages.map(stage => ({
    stage,
    count: accounts.filter(a => a.stage === stage).length
  }));

  const pipelineValue = accounts.reduce((sum, a) => sum + (a.deal_value || 0), 0);
  const thisWeekOutreach = outreach.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d > weekAgo;
  }).length;
  const responseRate = outreach.length > 0
    ? Math.round(outreach.filter(o => o.status === 'Replied').length / outreach.length * 100)
    : 0;
  const territories = [...new Set(accounts.map(a => a.territory).filter(Boolean))].length;

  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#10b981'];

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Ticker */}
      {config?.ticker_messages && (
        <div className="card px-4 py-2.5 overflow-hidden">
          <div className="ticker-scroll whitespace-nowrap font-mono text-[11px] text-blue-400/80">
            {[...config.ticker_messages, ...config.ticker_messages].map((m, i) => (
              <span key={i} className="mx-8">
                <span className="text-blue-500/40 mr-2">///</span>{m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard title="Total Accounts" value={accounts.length} icon={Users} color="blue" />
        <MetricCard title="Pipeline Value" value={`$${(pipelineValue / 1000).toFixed(0)}k`} icon={DollarSign} color="green" />
        <MetricCard title="Outreach This Week" value={thisWeekOutreach} icon={Send} color="purple" />
        <MetricCard title="Response Rate" value={`${responseRate}%`} icon={MessageSquare} color="amber" />
        <MetricCard title="Meetings" value={accounts.filter(a => a.stage === 'Meeting').length} icon={Calendar} color="blue" />
        <MetricCard title="Territories" value={territories} icon={MapPin} color="green" />
      </div>

      {/* Pipeline + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-5">
          <h3 className="section-title mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 12 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} width={95} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1629', border: '1px solid #162032', borderRadius: 10, color: '#f1f5f9', fontSize: 12 }}
                cursor={{ fill: 'rgba(59,130,246,0.03)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                {funnelData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Activity size={13} className="text-blue-400" /> Live Activity
          </h3>
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {activities.length === 0 && <p className="text-xs text-slate-600">No activity yet</p>}
            {activities.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-start gap-2.5 text-xs group">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-1.5 shrink-0 group-hover:bg-blue-400 transition-colors" />
                <div>
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{a.description}</span>
                  <div className="text-slate-700 text-[10px] mt-0.5 font-mono">{new Date(a.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trigger Events + HN Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {config?.trigger_events && (
          <div className="card p-5">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <AlertTriangle size={13} className="text-amber-400" /> Trigger Events
            </h3>
            <div className="space-y-2.5">
              {config.trigger_events.map((evt, i) => (
                <div key={i} className="card-inner p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white">{evt.title}</span>
                    <span className={`badge ${evt.urgency >= 4 ? 'bg-red-500/15 text-red-400' : evt.urgency >= 3 ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {evt.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{evt.description}</p>
                  <p className="text-[11px] text-blue-400/80 mt-1">{evt.action_prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <ExternalLink size={13} className="text-orange-400" /> Hacker News Feed
          </h3>
          <div className="space-y-2.5">
            {hnStories.length === 0 && <p className="text-xs text-slate-600">Loading...</p>}
            {hnStories.slice(0, 5).map((story, i) => (
              <a
                key={i}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block card-inner p-3 hover:border-orange-500/20 transition-colors no-underline group"
              >
                <div className="text-xs text-slate-300 group-hover:text-white transition-colors">{story.title}</div>
                <div className="text-[10px] text-slate-600 mt-1 font-mono">{new Date(story.date).toLocaleDateString()}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

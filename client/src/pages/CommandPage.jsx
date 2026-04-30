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
    <div className="p-6 space-y-6">
      {config?.ticker_messages && (
        <div className="bg-[#131a2e] border border-[#1e293b] rounded-lg px-4 py-2 overflow-hidden">
          <div className="ticker-scroll whitespace-nowrap font-mono text-xs text-blue-400">
            {[...config.ticker_messages, ...config.ticker_messages].map((m, i) => (
              <span key={i} className="mx-8">{m}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Accounts" value={accounts.length} icon={Users} color="blue" />
        <MetricCard title="Pipeline Value" value={`$${(pipelineValue / 1000).toFixed(0)}k`} icon={DollarSign} color="green" />
        <MetricCard title="Outreach This Week" value={thisWeekOutreach} icon={Send} color="purple" />
        <MetricCard title="Response Rate" value={`${responseRate}%`} icon={MessageSquare} color="amber" />
        <MetricCard title="Meetings" value={accounts.filter(a => a.stage === 'Meeting').length} icon={Calendar} color="blue" />
        <MetricCard title="Territories" value={territories} icon={MapPin} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid #1e293b', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnelData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-blue-400" /> Live Activity
          </h3>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {activities.length === 0 && <p className="text-xs text-slate-500">No activity yet</p>}
            {activities.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <span className="text-slate-300">{a.description}</span>
                  <div className="text-slate-600 mt-0.5">{new Date(a.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {config?.trigger_events && (
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" /> Trigger Events
            </h3>
            <div className="space-y-3">
              {config.trigger_events.map((evt, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#0a0e1a] border border-[#1e293b]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{evt.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${evt.urgency >= 4 ? 'bg-red-500/20 text-red-400' : evt.urgency >= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {evt.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{evt.description}</p>
                  <p className="text-xs text-blue-400 mt-1">{evt.action_prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ExternalLink size={16} className="text-orange-400" /> Hacker News Feed
          </h3>
          <div className="space-y-3">
            {hnStories.length === 0 && <p className="text-xs text-slate-500">Loading...</p>}
            {hnStories.slice(0, 5).map((story, i) => (
              <a
                key={i}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-[#0a0e1a] border border-[#1e293b] hover:border-orange-500/30 transition-colors no-underline"
              >
                <div className="text-sm text-white">{story.title}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(story.date).toLocaleDateString()}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

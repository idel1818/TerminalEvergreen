import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { Users, DollarSign, Send, MessageSquare, Calendar, MapPin, Activity, AlertTriangle, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import MetricCard from '../components/MetricCard';

const TRIGGER_BADGE_COLORS = {
  'Expansion Signal': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  'Funding Signal': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
  'Competitive Displacement': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  'Product Launch': { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
  'Executive Change': { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CommandPage() {
  const { workspace, config } = useWorkspace();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [outreach, setOutreach] = useState([]);
  const [hnStories, setHnStories] = useState([]);

  useEffect(() => {
    if (!workspace) return;
    fetch(`/api/workspaces/${workspace.id}/accounts`).then(r => r.json()).then(setAccounts);
    fetch(`/api/workspaces/${workspace.id}/activities`).then(r => r.json()).then(setActivities);
    fetch(`/api/workspaces/${workspace.id}/outreach`).then(r => r.json()).then(setOutreach);
  }, [workspace]);

  useEffect(() => {
    if (!config?.company?.name) return;
    fetch(`/api/intelligence/sector?q=${encodeURIComponent(config.company.name)}`).then(r => r.json()).then(setHnStories);
  }, [config?.company?.name]);

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

  const triggerEvents = config?.trigger_events || [];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Ticker */}
      {config?.ticker_messages && (
        <div style={{
          height: 32,
          background: '#0a0f1e',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <div className="ticker-scroll" style={{
            whiteSpace: 'nowrap',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: 'var(--accent)',
            opacity: 0.8,
            padding: '0 16px',
          }}>
            {[...config.ticker_messages, ...config.ticker_messages].map((m, i) => (
              <span key={i} style={{ marginRight: 48 }}>
                <span style={{ color: 'var(--accent)', opacity: 0.3, marginRight: 8 }}>///</span>{m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 32 }}>
        <MetricCard title="Total Accounts" value={accounts.length} subtitle="Active pipeline" icon={Users} />
        <MetricCard title="Pipeline Value" value={`$${(pipelineValue / 1000).toFixed(0)}k`} subtitle="Total deal value" icon={DollarSign} />
        <MetricCard title="Outreach / Week" value={thisWeekOutreach} subtitle="Messages sent" icon={Send} />
        <MetricCard title="Response Rate" value={`${responseRate}%`} subtitle="Reply ratio" icon={MessageSquare} />
        <MetricCard title="Meetings" value={accounts.filter(a => a.stage === 'Meeting').length} subtitle="Scheduled" icon={Calendar} />
        <MetricCard title="Territories" value={territories} subtitle="Active regions" icon={MapPin} />
      </div>

      {/* Pipeline Funnel — Stage Cards */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Pipeline Funnel</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {funnelData.map((stage, i) => {
            const isFirst = i === 0 && stage.count > 0;
            return (
              <div
                key={stage.stage}
                onClick={() => navigate(`/accounts?stage=${encodeURIComponent(stage.stage)}`)}
                style={{
                  background: isFirst ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: isFirst ? '0.5px solid var(--border-bright)' : '0.5px solid var(--border)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-bright)';
                  e.currentTarget.style.background = isFirst ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isFirst ? 'var(--border-bright)' : 'var(--border)';
                  e.currentTarget.style.background = isFirst ? 'var(--accent-dim)' : 'var(--bg-card)';
                }}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  alignSelf: 'flex-end',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: isFirst ? 'var(--accent)' : 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {stage.count}
                </span>
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                }}>
                  {stage.stage === 'Closed Won' ? 'Closed' : stage.stage.length > 11 ? stage.stage.substring(0, 10) + '.' : stage.stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column layout: Trigger Events (60%) | Activity + HN (40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
        {/* Left: Trigger Events */}
        <div>
          <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={12} style={{ color: 'var(--warning)' }} /> Trigger Events
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {triggerEvents.slice(0, 4).map((evt, i) => {
              const badgeColor = TRIGGER_BADGE_COLORS[evt.type] || TRIGGER_BADGE_COLORS['Funding Signal'];
              const urgencyColor = evt.urgency >= 4 ? '#ef4444' : evt.urgency >= 3 ? '#f59e0b' : '#3b82f6';
              return (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-bright)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: badgeColor.bg,
                      color: badgeColor.text,
                      border: `0.5px solid ${badgeColor.border}`,
                    }}>
                      {evt.type}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: urgencyColor,
                      fontWeight: 600,
                    }}>
                      {evt.urgency >= 4 ? 'HIGH' : evt.urgency >= 3 ? 'MED' : 'LOW'}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {evt.title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}>
                    {evt.description}
                  </div>
                  <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic' }}>
                      → {evt.action_prompt}
                    </span>
                  </div>
                </div>
              );
            })}
            {triggerEvents.length > 4 && (
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>
                  View all {triggerEvents.length} events →
                </span>
              </div>
            )}
            {triggerEvents.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '20px 0' }}>
                No trigger events configured
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Activity + HN Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Live Activity */}
          <div>
            <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={12} style={{ color: 'var(--accent)' }} /> Live Activity
            </div>
            <div style={{
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
              maxHeight: 220,
              overflowY: 'auto',
            }}>
              {activities.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 0' }}>No activity yet</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activities.slice(0, 10).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: a.action_type === 'outreach' ? 'var(--purple)' : a.action_type === 'account_update' ? 'var(--success)' : 'var(--accent)',
                      marginTop: 5, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {a.description}
                    </div>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hacker News Feed */}
          <div>
            <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={12} style={{ color: '#f97316' }} /> Hacker News Feed
            </div>
            <div style={{
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
            }}>
              {hnStories.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 0' }}>
                  No recent HN activity — monitoring for signals
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hnStories.slice(0, 8).map((story, i) => (
                  <a
                    key={i}
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-tertiary)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {timeAgo(story.date)}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {story.title}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--text-tertiary)',
                      marginTop: 2,
                      paddingLeft: 50,
                    }}>
                      {story.source ? `${story.source} · ` : ''}
                      {story.points ? `${story.points} points · ` : ''}
                      {story.comments ? `${story.comments} comments` : ''}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

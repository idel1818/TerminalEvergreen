import { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Settings, RefreshCw, Trash2, Link2, Upload, DollarSign, Palette, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SettingsPage() {
  const { workspace, config, updateConfig, configureCompany, setWorkspace, setConfig } = useWorkspace();
  const [tab, setTab] = useState('workspace');
  const [usage, setUsage] = useState(null);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [hubspotKey, setHubspotKey] = useState('');
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reconfiguring, setReconfiguring] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [terminalName, setTerminalName] = useState('GTM Terminal');
  const [budget, setBudget] = useState(100);
  const [wsName, setWsName] = useState(workspace?.company_name || '');
  const [wsDomain, setWsDomain] = useState(workspace?.domain || '');

  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).then(setUsage);
  }, []);

  useEffect(() => {
    if (workspace) {
      setWsName(workspace.company_name);
      setWsDomain(workspace.domain || '');
    }
  }, [workspace]);

  const handleReconfigure = async () => {
    setReconfiguring(true);
    try {
      await configureCompany(workspace.company_name, true);
    } catch (err) {
      alert(err.message);
    }
    setReconfiguring(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this workspace? This cannot be undone.')) return;
    await fetch(`/api/workspaces/${workspace.id}`, { method: 'DELETE' });
    setWorkspace(null);
    setConfig(null);
  };

  const handleSheetsImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/settings/import/sheets`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetsUrl })
      });
      const data = await res.json();
      setImportResult(data);
    } catch (err) {
      setImportResult({ error: err.message });
    }
    setImporting(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/settings/upload/document`, {
        method: 'POST', body: formData
      });
      const data = await res.json();
      setUploadResult(data);
    } catch (err) {
      setUploadResult({ error: err.message });
    }
    setUploading(false);
  };

  const handleHubspot = async () => {
    await fetch(`/api/workspaces/${workspace.id}/settings/integrations/hubspot`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: hubspotKey })
    });
    alert('HubSpot key saved');
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workspace?.company_name || 'config'}-gtm-config.json`;
    link.click();
  };

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'usage', label: 'API Usage', icon: DollarSign },
    { id: 'whitelabel', label: 'White Label', icon: Palette },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          Workspace, integrations & configuration
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
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

      {tab === 'workspace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Workspace Settings</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Company Name</label>
                <input value={wsName} onChange={e => setWsName(e.target.value)} className="input" style={{ width: '100%', padding: '10px 14px' }} />
              </div>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Domain</label>
                <input value={wsDomain} onChange={e => setWsDomain(e.target.value)} className="input" style={{ width: '100%', padding: '10px 14px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleReconfigure} disabled={reconfiguring} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {reconfiguring ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {reconfiguring ? 'Reconfiguring...' : 'Reconfigure with AI'}
              </button>
              <button onClick={handleDelete} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.06)', border: '0.5px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                <Trash2 size={12} /> Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="section-title" style={{ marginBottom: 8 }}>HubSpot Integration</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Coming soon — enter your HubSpot API key to enable bidirectional sync.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={hubspotKey} onChange={e => setHubspotKey(e.target.value)} placeholder="HubSpot API key" className="input" style={{ flex: 1, padding: '10px 14px' }} />
              <button onClick={handleHubspot} className="btn-primary" style={{ padding: '10px 16px' }}>Save</button>
            </div>
          </div>

          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Google Sheets Import</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Paste a published Google Sheets URL (the /pub?output=csv version) to import accounts.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" className="input" style={{ flex: 1, padding: '10px 14px' }} />
              <button onClick={handleSheetsImport} disabled={importing || !sheetsUrl} className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {importing ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                Import
              </button>
            </div>
            {importResult && (
              <div style={{
                fontSize: 12, padding: 10, borderRadius: 8,
                background: importResult.error ? 'rgba(239, 68, 68, 0.06)' : 'rgba(34, 197, 94, 0.06)',
                border: `0.5px solid ${importResult.error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                color: importResult.error ? 'var(--danger)' : 'var(--success)',
              }}>
                {importResult.error || `Imported ${importResult.imported} accounts`}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Document Upload</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Upload a pitch deck, competitor analysis, or product brief. AI will extract relevant content.</p>
            <label className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer' }}>
              <Upload size={12} />
              {uploading ? 'Processing...' : 'Choose file (PDF or TXT)'}
              <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            {uploadResult && (
              <div style={{
                fontSize: 12, padding: 10, borderRadius: 8, marginTop: 8,
                background: uploadResult.error ? 'rgba(239, 68, 68, 0.06)' : 'rgba(34, 197, 94, 0.06)',
                border: `0.5px solid ${uploadResult.error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                color: uploadResult.error ? 'var(--danger)' : 'var(--success)',
              }}>
                {uploadResult.error || 'Document processed and configuration updated'}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'usage' && usage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Total Cost This Month</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>${usage.total_cost_this_month?.toFixed(4)}</div>
              {budget && usage.total_cost_this_month > budget * 0.8 && (
                <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 6 }}>Approaching budget limit (${budget})</div>
              )}
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div className="section-title" style={{ marginBottom: 8 }}>API Calls</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{usage.recent_calls?.length || 0}</div>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div className="section-title" style={{ marginBottom: 8 }}>Monthly Budget</div>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="input" style={{ width: '100%', padding: '10px 14px', fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>

          {usage.by_feature?.length > 0 && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <div className="section-title" style={{ marginBottom: 16 }}>Cost by Feature</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={usage.by_feature}>
                  <XAxis dataKey="feature" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `$${v.toFixed(3)}`} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 11 }} />
                  <Bar dataKey="cost" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--border)' }}>
              <div className="section-title">Recent API Calls</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Cost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(usage.recent_calls || []).map(c => (
                  <tr key={c.id}>
                    <td>{c.feature}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>{c.input_tokens}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>{c.output_tokens}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--success)' }}>${c.estimated_cost_usd?.toFixed(4)}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-tertiary)' }}>{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'whitelabel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div className="section-title" style={{ marginBottom: 16 }}>White Label Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Terminal Name</label>
                <input value={terminalName} onChange={e => setTerminalName(e.target.value)} className="input" style={{ width: '100%', padding: '10px 14px' }} />
              </div>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Brand Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{
                    width: 40, height: 40, borderRadius: 8, cursor: 'pointer',
                    border: '0.5px solid var(--border)',
                  }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>{brandColor}</span>
                </div>
              </div>
              <div>
                <label className="section-title" style={{ display: 'block', marginBottom: 6 }}>Custom Domain</label>
                <input placeholder="sales.yourcompany.com" className="input" style={{ width: '100%', padding: '10px 14px' }} />
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Point a CNAME to your Fly.dev app URL to use a custom domain.</p>
              </div>
              <button onClick={exportConfig} className="btn-ghost" style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                <Download size={12} /> Export Configuration JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

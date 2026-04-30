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
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Settings size={14} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="text-[11px] text-slate-600">Workspace, integrations & configuration</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-[#0c1220] rounded-lg px-1 py-1 border border-[#162032] w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium border-none cursor-pointer transition-all ${tab === t.id ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] bg-transparent'}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'workspace' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-4">Workspace Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Company Name</label>
                <input value={wsName} onChange={e => setWsName(e.target.value)} className="input w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Domain</label>
                <input value={wsDomain} onChange={e => setWsDomain(e.target.value)} className="input w-full px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleReconfigure} disabled={reconfiguring} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs">
                {reconfiguring ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {reconfiguring ? 'Reconfiguring...' : 'Reconfigure with AI'}
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/[0.06] border border-red-500/20 text-red-400 text-xs font-medium cursor-pointer hover:bg-red-500/10 transition-colors">
                <Trash2 size={12} /> Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-2">HubSpot Integration</h3>
            <p className="text-[11px] text-slate-500 mb-3">Coming soon — enter your HubSpot API key to enable bidirectional sync.</p>
            <div className="flex gap-2">
              <input value={hubspotKey} onChange={e => setHubspotKey(e.target.value)} placeholder="HubSpot API key" className="input flex-1 px-3 py-2.5 text-sm" />
              <button onClick={handleHubspot} className="btn-primary px-4 py-2.5 text-xs">Save</button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-2">Google Sheets Import</h3>
            <p className="text-[11px] text-slate-500 mb-3">Paste a published Google Sheets URL (the /pub?output=csv version) to import accounts.</p>
            <div className="flex gap-2 mb-2">
              <input value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" className="input flex-1 px-3 py-2.5 text-sm" />
              <button onClick={handleSheetsImport} disabled={importing || !sheetsUrl} className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-xs">
                {importing ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                Import
              </button>
            </div>
            {importResult && (
              <div className={`text-[11px] p-2.5 rounded-lg ${importResult.error ? 'bg-red-500/[0.06] border border-red-500/20 text-red-400' : 'bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400'}`}>
                {importResult.error || `Imported ${importResult.imported} accounts`}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-2">Document Upload</h3>
            <p className="text-[11px] text-slate-500 mb-3">Upload a pitch deck, competitor analysis, or product brief. AI will extract relevant content.</p>
            <label className="btn-ghost inline-flex items-center gap-2 px-4 py-2.5 text-xs cursor-pointer">
              <Upload size={12} />
              {uploading ? 'Processing...' : 'Choose file (PDF or TXT)'}
              <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploadResult && (
              <div className={`text-[11px] p-2.5 rounded-lg mt-2 ${uploadResult.error ? 'bg-red-500/[0.06] border border-red-500/20 text-red-400' : 'bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400'}`}>
                {uploadResult.error || 'Document processed and configuration updated'}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'usage' && usage && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Total Cost This Month</div>
              <div className="text-2xl font-bold text-white font-mono">${usage.total_cost_this_month?.toFixed(4)}</div>
              {budget && usage.total_cost_this_month > budget * 0.8 && (
                <div className="text-[11px] text-amber-400 mt-1.5">Approaching budget limit (${budget})</div>
              )}
            </div>
            <div className="card p-5">
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">API Calls</div>
              <div className="text-2xl font-bold text-white font-mono">{usage.recent_calls?.length || 0}</div>
            </div>
            <div className="card p-5">
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Monthly Budget</div>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="input w-full px-3 py-2.5 text-lg font-mono" />
            </div>
          </div>

          {usage.by_feature?.length > 0 && (
            <div className="card p-5">
              <h3 className="section-title mb-4">Cost by Feature</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={usage.by_feature}>
                  <XAxis dataKey="feature" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v.toFixed(3)}`} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #162032', borderRadius: 10, color: '#f1f5f9', fontSize: 11 }} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#162032]">
              <h3 className="section-title">Recent API Calls</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#162032]">
                  <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Feature</th>
                  <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Input</th>
                  <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Output</th>
                  <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Cost</th>
                  <th className="text-left px-5 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {(usage.recent_calls || []).map(c => (
                  <tr key={c.id} className="table-row border-b border-[#162032]/50">
                    <td className="px-5 py-3 text-white text-xs">{c.feature}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{c.input_tokens}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{c.output_tokens}</td>
                    <td className="px-5 py-3 text-emerald-400 font-mono text-xs">${c.estimated_cost_usd?.toFixed(4)}</td>
                    <td className="px-5 py-3 text-slate-600 text-[10px] font-mono">{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'whitelabel' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-4">White Label Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Terminal Name</label>
                <input value={terminalName} onChange={e => setTerminalName(e.target.value)} className="input w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-[#162032]" />
                  <span className="font-mono text-xs text-slate-500">{brandColor}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Custom Domain</label>
                <input placeholder="sales.yourcompany.com" className="input w-full px-3 py-2.5 text-sm" />
                <p className="text-[10px] text-slate-600 mt-1.5">Point a CNAME to your Fly.dev app URL to use a custom domain.</p>
              </div>
              <button onClick={exportConfig} className="btn-ghost flex items-center gap-1.5 px-4 py-2.5 text-xs">
                <Download size={12} /> Export Configuration JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

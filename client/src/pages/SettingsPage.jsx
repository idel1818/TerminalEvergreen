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
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Settings size={22} className="text-blue-400" /> Settings
      </h2>

      <div className="flex items-center gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border-none cursor-pointer transition-colors ${tab === t.id ? 'bg-blue-500/20 text-blue-400' : 'bg-[#131a2e] text-slate-400 hover:text-white'}`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'workspace' && (
        <div className="space-y-4">
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Workspace Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Company Name</label>
                <input value={wsName} onChange={e => setWsName(e.target.value)} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Domain</label>
                <input value={wsDomain} onChange={e => setWsDomain(e.target.value)} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleReconfigure} disabled={reconfiguring} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm border-none cursor-pointer disabled:opacity-50">
                {reconfiguring ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {reconfiguring ? 'Reconfiguring...' : 'Reconfigure with AI'}
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm border border-red-500/30 cursor-pointer hover:bg-red-600/30">
                <Trash2 size={14} /> Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">HubSpot Integration</h3>
            <p className="text-xs text-slate-400 mb-3">Coming soon — enter your HubSpot API key to enable bidirectional sync.</p>
            <div className="flex gap-2">
              <input value={hubspotKey} onChange={e => setHubspotKey(e.target.value)} placeholder="HubSpot API key" className="flex-1 bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
              <button onClick={handleHubspot} className="px-4 py-2 rounded bg-blue-600 text-white text-sm border-none cursor-pointer">Save</button>
            </div>
          </div>

          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Google Sheets Import</h3>
            <p className="text-xs text-slate-400 mb-3">Paste a published Google Sheets URL (the /pub?output=csv version) to import accounts.</p>
            <div className="flex gap-2 mb-2">
              <input value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" className="flex-1 bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
              <button onClick={handleSheetsImport} disabled={importing || !sheetsUrl} className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 text-white text-sm border-none cursor-pointer disabled:opacity-50">
                {importing ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                Import
              </button>
            </div>
            {importResult && (
              <div className={`text-xs p-2 rounded ${importResult.error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {importResult.error || `Imported ${importResult.imported} accounts`}
              </div>
            )}
          </div>

          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Document Upload</h3>
            <p className="text-xs text-slate-400 mb-3">Upload a pitch deck, competitor analysis, or product brief. AI will extract relevant content and update your configuration.</p>
            <label className="flex items-center gap-2 px-4 py-2 rounded bg-[#0a0e1a] border border-[#1e293b] hover:border-blue-500/50 text-sm text-slate-400 cursor-pointer w-fit transition-colors">
              <Upload size={14} />
              {uploading ? 'Processing...' : 'Choose file (PDF or TXT)'}
              <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>
            {uploadResult && (
              <div className={`text-xs p-2 rounded mt-2 ${uploadResult.error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {uploadResult.error || 'Document processed and configuration updated'}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'usage' && usage && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <div className="text-xs text-slate-400 mb-1">Total Cost This Month</div>
              <div className="text-2xl font-bold text-white font-mono">${usage.total_cost_this_month?.toFixed(4)}</div>
              {budget && usage.total_cost_this_month > budget * 0.8 && (
                <div className="text-xs text-amber-400 mt-1">Warning: Approaching budget limit (${budget})</div>
              )}
            </div>
            <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <div className="text-xs text-slate-400 mb-1">API Calls</div>
              <div className="text-2xl font-bold text-white font-mono">{usage.recent_calls?.length || 0}</div>
            </div>
            <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <div className="text-xs text-slate-400 mb-1">Monthly Budget</div>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-white outline-none text-lg font-mono" />
            </div>
          </div>

          {usage.by_feature?.length > 0 && (
            <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Cost by Feature</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={usage.by_feature}>
                  <XAxis dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v.toFixed(3)}`} />
                  <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid #1e293b', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1e293b]">
              <h3 className="text-sm font-semibold text-white">Recent API Calls</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Feature</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Input Tokens</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Output Tokens</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Cost</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {(usage.recent_calls || []).map(c => (
                  <tr key={c.id} className="border-b border-[#1e293b]/50">
                    <td className="px-4 py-2 text-white">{c.feature}</td>
                    <td className="px-4 py-2 text-slate-400 font-mono">{c.input_tokens}</td>
                    <td className="px-4 py-2 text-slate-400 font-mono">{c.output_tokens}</td>
                    <td className="px-4 py-2 text-emerald-400 font-mono">${c.estimated_cost_usd?.toFixed(4)}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'whitelabel' && (
        <div className="space-y-4">
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">White Label Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Terminal Name</label>
                <input value={terminalName} onChange={e => setTerminalName(e.target.value)} className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none" />
                  <span className="font-mono text-sm text-slate-400">{brandColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Custom Domain</label>
                <input placeholder="sales.yourcompany.com" className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded px-3 py-2 text-sm text-white outline-none" />
                <p className="text-xs text-slate-500 mt-1">Point a CNAME to your Fly.dev app URL to use a custom domain.</p>
              </div>
              <button onClick={exportConfig} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0a0e1a] border border-[#1e293b] text-slate-400 text-sm hover:text-white cursor-pointer">
                <Download size={14} /> Export Configuration JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

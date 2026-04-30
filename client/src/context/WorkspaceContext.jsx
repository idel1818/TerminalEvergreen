import { createContext, useContext, useState, useCallback } from 'react';

const WorkspaceContext = createContext(null);

const API = '';

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [config, setConfig] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);

  const fetchWorkspaces = useCallback(async () => {
    const res = await fetch(`${API}/api/workspaces`);
    const data = await res.json();
    setWorkspaces(data);
    return data;
  }, []);

  const configureCompany = useCallback(async (companyName, forceRefresh = false) => {
    setLoading(true);
    setLoadingSteps([]);

    const steps = [
      'Searching company data...',
      'Enriching with Clearbit...',
      'Pulling recent news...',
      'Generating competitors...',
      'Building target accounts...',
      'Configuring sales kit...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setLoadingSteps(prev => [...prev, { text: steps[stepIdx], done: false }]);
        if (stepIdx > 0) {
          setLoadingSteps(prev => prev.map((s, i) => i === stepIdx - 1 ? { ...s, done: true } : s));
        }
        stepIdx++;
      }
    }, 1500);

    try {
      const res = await fetch(`${API}/api/workspaces/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, force_refresh: forceRefresh })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Configuration failed');
      }
      const data = await res.json();
      clearInterval(interval);
      setLoadingSteps(steps.map(t => ({ text: t, done: true })));
      setLoadingSteps(prev => [...prev, { text: 'Terminal ready.', done: true }]);

      await new Promise(r => setTimeout(r, 500));
      setWorkspace(data.workspace);
      setConfig(data.config);
      setLoading(false);
      setLoadingSteps([]);
      await fetchWorkspaces();
      return data;
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setLoadingSteps([]);
      throw err;
    }
  }, [fetchWorkspaces]);

  const switchWorkspace = useCallback(async (id) => {
    const res = await fetch(`${API}/api/workspaces/${id}`);
    const data = await res.json();
    setWorkspace(data.workspace);
    setConfig(data.config);
    return data;
  }, []);

  const updateConfig = useCallback(async (newConfig) => {
    if (!workspace) return;
    const res = await fetch(`${API}/api/workspaces/${workspace.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config_json: newConfig })
    });
    const data = await res.json();
    setConfig(data.config);
    return data;
  }, [workspace]);

  return (
    <WorkspaceContext.Provider value={{
      workspace, config, workspaces, loading, loadingSteps,
      configureCompany, switchWorkspace, fetchWorkspaces, updateConfig, setWorkspace, setConfig
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be inside WorkspaceProvider');
  return ctx;
}

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
    setLoadingSteps([{ text: 'Searching company data...', done: false }]);

    try {
      const res = await fetch(`${API}/api/workspaces/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, force_refresh: forceRefresh })
      });

      const contentType = res.headers.get('content-type') || '';

      // Cached result comes back as regular JSON
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Configuration failed');
        const steps = [
          'Searching company data...',
          'Enriching with Clearbit...',
          'Pulling recent news...',
          'Generating competitors...',
          'Building target accounts...',
          'Configuring sales kit...',
          'Terminal ready.'
        ];
        setLoadingSteps(steps.map(t => ({ text: t, done: true })));
        await new Promise(r => setTimeout(r, 400));
        setWorkspace(data.workspace);
        setConfig(data.config);
        setLoading(false);
        setLoadingSteps([]);
        await fetchWorkspaces();
        return data;
      }

      // SSE stream for long-running config
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalData = null;

      const stepMap = {
        enriching: 'Enriching with Clearbit...',
        enriched: 'Pulling recent news...',
        generating: 'Generating AI configuration...',
        saving: 'Saving configuration...',
      };

      const completedSteps = new Set();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.step === 'error') {
            throw new Error(event.message || 'Configuration failed');
          }

          if (event.step === 'done') {
            finalData = event;
            continue;
          }

          // Update loading steps based on real server events
          if (event.step && stepMap[event.step] && !completedSteps.has(event.step)) {
            completedSteps.add(event.step);

            setLoadingSteps(prev => {
              const updated = prev.map(s => ({ ...s, done: true }));
              return [...updated, { text: stepMap[event.step], done: false }];
            });
          }
        }
      }

      if (!finalData) {
        throw new Error('Connection closed before configuration completed');
      }

      setLoadingSteps(prev => {
        const updated = prev.map(s => ({ ...s, done: true }));
        return [...updated, { text: 'Terminal ready.', done: true }];
      });

      await new Promise(r => setTimeout(r, 500));
      setWorkspace(finalData.workspace);
      setConfig(finalData.config);
      setLoading(false);
      setLoadingSteps([]);
      await fetchWorkspaces();
      return finalData;
    } catch (err) {
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

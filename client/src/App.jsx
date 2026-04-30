import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CommandPage from './pages/CommandPage';
import AccountsPage from './pages/AccountsPage';
import OutreachPage from './pages/OutreachPage';
import IntelligencePage from './pages/IntelligencePage';
import CompetitionPage from './pages/CompetitionPage';
import BattleMapPage from './pages/BattleMapPage';
import SalesKitPage from './pages/SalesKitPage';
import SettingsPage from './pages/SettingsPage';

function AppRoutes() {
  const { workspace } = useWorkspace();

  if (!workspace) {
    return <HomePage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-dot-pattern">
      <Navbar />
      <Routes>
        <Route path="/" element={<CommandPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/outreach" element={<OutreachPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/competition" element={<CompetitionPage />} />
        <Route path="/battle-map" element={<BattleMapPage />} />
        <Route path="/sales-kit" element={<SalesKitPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <footer className="text-center py-4 text-xs text-slate-600 font-mono border-t border-[#1e293b]">
        POWERED BY GTM TERMINAL
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <AppRoutes />
      </WorkspaceProvider>
    </BrowserRouter>
  );
}

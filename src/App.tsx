// src/App.tsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { BotIdProvider } from "./BotIdContext";

// --- Import Your Page Components ---
import AuthPages from "./login";
import SpikedAIrecall from "./components/SpikedAI_recall";
import DocumentsPage from "./pages/documents";
import SpikedAISettings from "./pages/settings";
import MeetingPrep from "./pages/meeting-prep";
import DashboardPage from "./pages/notetaker";
import AdminPage from "./pages/admin";
import SpikedAIvexa from "./pages/SpikedAI_vexa";
import ProtectedRoute from "./ProtectedRoute";
import Integrations from './pages/Integrations';
import TutorialsHub from "./pages/TutorialsHub";
import KnowledgeBase from "./pages/knowledge_base";
import JiraDashboard from './pages/JiraDashboard';
import HubSpotDashboard from './pages/hubspotdashboard'; 

const MainLayout = () => {  
  return (
    <div className="app-layout">
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

function App() {
  return (
    <BotIdProvider> {/* Wrap the entire app with the BotProvider */}
      <Routes>
        <Route path="/login" element={<AuthPages />} />
        
        {/* All protected routes, including the main app */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<SpikedAIrecall />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SpikedAISettings />} />
            <Route path="/meeting-prep" element={<MeetingPrep />} />
            <Route path="/note-taker" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/vexa" element={<SpikedAIvexa />} />
            
            {/* Integrations Routes */}
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/integrations/jira" element={<JiraDashboard />} />
            <Route path="/integrations/hubspot" element={<HubSpotDashboard />} />
            
            <Route path="/tutorial" element={<TutorialsHub />} />
            <Route path="/knowledge_base" element={<KnowledgeBase/>}/>

          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BotIdProvider>
  );
}

export default App;
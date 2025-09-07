import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

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

/**
 * A component to protect routes that require authentication.
 * It checks for an active session and redirects to /login if one doesn't exist.
 */

/**
 * A component for the shared UI layout (e.g., with a sidebar or navbar).
 * Protected pages will be rendered inside this layout.
 */
const MainLayout = () => {
  return (
    <div className="app-layout">
      {/* You can add shared components like a Sidebar or Navbar here */}
      {/* e.g., <Sidebar /> */}
      <main className="content">
        {/* The Outlet component renders the specific page component for the current route */}
        <Outlet />
      </main>
    </div>
  );
};

/**
 * A simple 404 Not Found component to handle invalid URLs.
 */
const NotFoundPage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

/**
 * The main App component that defines all application routes.
 */
function App() {
  return (
    <Routes>
      {/* === Public Routes === */}
      {/* These routes are accessible to everyone, logged in or not. */}
      <Route path="/login" element={<AuthPages />} />
      <Route path="/" element={<SpikedAIrecall />} />

      {/* === Protected Routes === */}
      {/* These routes are only accessible to authenticated users. */}
      {/* The parent route uses the ProtectedRoute component as a gatekeeper. */}
      <Route element={<ProtectedRoute />}>
        {/* Nested routes share a common UI via the MainLayout component. */}
        <Route element={<MainLayout />}>
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/settings" element={<SpikedAISettings />} />
          <Route path="/meeting-prep" element={<MeetingPrep />} />
          <Route path="/note-taker" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/vexa" element={<SpikedAIvexa />} />
        </Route>
      </Route>

      {/* === Catch-all Route === */}
      {/* This route matches any URL that hasn't been matched above, showing a 404 page. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

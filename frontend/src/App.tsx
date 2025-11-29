// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { ProposalDetailPage } from "./pages/ProposalDetailPage";
import ZkGoogleCallbackPage from "./pages/ZkGoogleCallbackPage";

export default function App() {
  return (
    <Routes>
      {/* Auth / giriş */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/zk-google-callback" element={<ZkGoogleCallbackPage />} />

      {/* Dashboard & proposal detay */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/proposals/:proposalId" element={<ProposalDetailPage />} />

      {/* Default: /login'e yönlendir */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

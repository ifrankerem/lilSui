// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RequestsPage from "./pages/RequestsPage";
import BudgetLogPage from "./pages/BudgetLogPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import { ProposalDetailPage } from "./pages/ProposalDetailPage";
import ZkGoogleCallbackPage from "./pages/ZkGoogleCallbackPage";

export default function App() {
  return (
    <Routes>
      {/* Auth / giriş */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/zk-google-callback" element={<ZkGoogleCallbackPage />} />

      {/* Main pages with sidebar */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/requests" element={<RequestsPage />} />
      <Route path="/budget-log" element={<BudgetLogPage />} />
      <Route path="/create-request" element={<CreateRequestPage />} />
      <Route path="/proposals/:proposalId" element={<ProposalDetailPage />} />

      {/* Default: /login'e yönlendir */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

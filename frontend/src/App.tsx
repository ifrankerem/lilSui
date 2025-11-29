// src/App.tsx
import { Routes, Route, Link, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import ZkGoogleCallbackPage from "./pages/ZkGoogleCallbackPage";
import { WalletBar } from "./components/WalletBar";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Üst bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <nav className="flex gap-4 text-sm">
          <Link to="/login" className="hover:text-emerald-400">
            Login
          </Link>
          <Link to="/dashboard" className="hover:text-emerald-400">
            Dashboard
          </Link>
          <Link to="/chat" className="hover:text-emerald-400">
            Chat
          </Link>
        </nav>

        {/* Sağ üstte cüzdan durumu */}
        <WalletBar />
      </header>

      {/* Sayfa içeriği */}
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
		  <Route path="/zklogin-google-callback" element={<ZkGoogleCallbackPage />} />
          {/* Varsayılan: /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

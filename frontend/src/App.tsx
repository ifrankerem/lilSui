// src/App.tsx
import { NavLink, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { ChatPage } from "./pages/ChatPage";
import { WalletBar } from "./components/WalletBar";

export function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top bar */}
      <header className="border-b border-slate-700">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Community Budget dApp</div>

          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
              end
            >
              Login
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
            >
              Chat
            </NavLink>
          </nav>

          {/* Sağ üstte mini wallet bar (isteğe bağlı) */}
          <div className="hidden md:block">
            <WalletBar />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

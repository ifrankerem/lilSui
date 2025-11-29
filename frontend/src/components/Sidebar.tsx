// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { getZkUser, setZkUser } from "../lib/zkAuth";

export function Sidebar() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  // Get user info from zkLogin if available
  const zkUser = getZkUser();
  const displayName = zkUser?.displayName || "Kullanıcı";
  const avatarUrl = zkUser?.avatarUrl;

  const handleLogout = () => {
    // Clear zkLogin user data
    setZkUser(null);
    // Disconnect wallet
    disconnect();
    // Navigate to login
    navigate("/login");
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? "bg-emerald-500/20 text-emerald-400"
        : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
    }`;

  return (
    <aside className="w-64 bg-slate-800 min-h-screen flex flex-col border-r border-slate-700">
      {/* User Profile Section */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">
              {displayName}
            </p>
            {account && (
              <p className="text-xs text-slate-400 font-mono truncate">
                {account.address.slice(0, 8)}…{account.address.slice(-4)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/dashboard" className={linkClasses}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Ana Sayfa
        </NavLink>

        <NavLink to="/create-request" className={linkClasses}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          İstek Oluştur
        </NavLink>

        <NavLink to="/requests" className={linkClasses}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          İstekleri Gör
        </NavLink>

        <NavLink to="/budget-log" className={linkClasses}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Bütçe Geçmişi
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

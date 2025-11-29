// src/pages/DashboardPage.tsx
import { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import {
  apiGetBudget,
  apiGetLogs,
  type BudgetDto,
  type LogEntry,
} from "../api";

export default function DashboardPage() {
  const [budgetId, setBudgetId] = useState("");
  const [budgetInfo, setBudgetInfo] = useState<BudgetDto | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would be fetched from the API
  // For now, we don't show pending count if no data is available
  const pendingCount = 0;

  useEffect(() => {
    // Load logs on mount
    handleLoadLogs();
  }, []);

  const handleLoadBudgetInfo = async () => {
    if (!budgetId) {
      setError("Lütfen bir Budget ID girin.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const info = await apiGetBudget(budgetId);
      setBudgetInfo(info);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLogs = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiGetLogs();
      setLogs(data);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const remaining = budgetInfo
    ? budgetInfo.total - budgetInfo.spent
    : undefined;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-lg">
              <span className="text-amber-400 text-lg">⚠</span>
              <span className="text-sm text-amber-400">
                {pendingCount} bekleyen istek
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Budget Overview Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Bütçe Özeti
          </h2>

          {/* Budget ID Input */}
          <div className="flex gap-3 mb-6">
            <input
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              value={budgetId}
              onChange={(e) => setBudgetId(e.target.value)}
              placeholder="Budget ID girin..."
            />
            <button
              onClick={handleLoadBudgetInfo}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Yükle"}
            </button>
          </div>

          {/* Budget Info Display */}
          {budgetInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs uppercase text-slate-400 mb-1">
                  Toplam Bütçe
                </p>
                <p className="text-2xl font-bold text-slate-100">
                  {budgetInfo.total} TL
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs uppercase text-slate-400 mb-1">
                  Harcanan
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {budgetInfo.spent} TL
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-xs uppercase text-slate-400 mb-1">Kalan</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {remaining} TL
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Bütçe bilgilerini görmek için Budget ID girin.</p>
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Son Harcamalar
            </h2>
            <button
              onClick={handleLoadLogs}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Yenile
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Henüz harcama kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.txDigest}
                  className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 text-sm">↗</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-100 font-mono">
                        {log.receiver.slice(0, 8)}…{log.receiver.slice(-4)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.timestampMs).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-red-400">
                    -{log.amount} TL
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

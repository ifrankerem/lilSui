// src/pages/BudgetLogPage.tsx
import { useState, useEffect } from "react";
import { MainLayout } from "../components/MainLayout";
import { apiGetLogs, apiGetBudget, type LogEntry, type BudgetDto } from "../api";

export default function BudgetLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [budgetId, setBudgetId] = useState("");
  const [budgetInfo, setBudgetInfo] = useState<BudgetDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
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

  const loadBudgetInfo = async () => {
    if (!budgetId) {
      setError("Please enter a Budget ID.");
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

  const totalSpent = logs.reduce((sum, log) => sum + log.amount, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Budget History</h1>
          <p className="text-slate-400 text-sm mt-1">
            View all spending records.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Budget Info Section */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Budget Information
          </h2>
          <div className="flex gap-3 mb-4">
            <input
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              value={budgetId}
              onChange={(e) => setBudgetId(e.target.value)}
              placeholder="Enter Budget ID..."
            />
            <button
              onClick={loadBudgetInfo}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              Load
            </button>
          </div>

          {budgetInfo && (
            <div className="flex items-center gap-8 py-4 px-6 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">
                  Budget Name
                </p>
                <p className="text-lg font-semibold text-slate-100">
                  {budgetInfo.name}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">
                  Total Budget
                </p>
                <p className="text-lg font-semibold text-emerald-400">
                  {budgetInfo.total} SUI
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">Remaining</p>
                <p className="text-lg font-semibold text-amber-400">
                  {budgetInfo.total - budgetInfo.spent} SUI
                </p>
              </div>
            </div>
          )}

          {!budgetInfo && (
            <div className="py-4 px-6 bg-slate-700/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-slate-100">
                Total Spent: {totalSpent} SUI
              </p>
            </div>
          )}
        </div>

        {/* Spending Log Table */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100">
              Spending History
            </h2>
            <button
              onClick={loadLogs}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-400">Loading...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No spending records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-slate-400">
                      Amount Spent
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-slate-400">
                      Receiver
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-slate-400">
                      Proposal
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-slate-400">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase text-slate-400">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {logs.map((log) => (
                    <tr
                      key={log.txDigest}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-red-400 font-semibold">
                          -{log.amount} SUI
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300 font-mono">
                          {log.receiver.slice(0, 8)}…{log.receiver.slice(-4)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400 font-mono">
                          {log.proposalId.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {new Date(log.timestampMs).toLocaleDateString(
                            "en-US",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://suiscan.xyz/testnet/tx/${log.txDigest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-400 hover:text-emerald-300 font-mono"
                        >
                          {log.txDigest.slice(0, 8)}…
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

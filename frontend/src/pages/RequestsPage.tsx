// src/pages/RequestsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "../components/MainLayout";
import { RequestsTable } from "../components/RequestsTable";
import { apiGetProposal, type ProposalDto } from "../api";

export default function RequestsPage() {
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalIds, setProposalIds] = useState<string>("");

  const loadProposals = useCallback(async () => {
    const ids = proposalIds
      .split("\n")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      setProposals([]);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            return await apiGetProposal(id);
          } catch {
            return null;
          }
        })
      );

      setProposals(results.filter((p): p is ProposalDto => p !== null));
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [proposalIds]);

  useEffect(() => {
    if (proposalIds) {
      loadProposals();
    }
  }, [proposalIds, loadProposals]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">View Requests</h1>
          <p className="text-slate-400 text-sm mt-1">
            View all budget requests and their approval status.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Proposal IDs Input */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Proposal IDs
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Enter the Proposal IDs you want to view, one per line.
          </p>
          <textarea
            className="w-full min-h-[100px] px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            value={proposalIds}
            onChange={(e) => setProposalIds(e.target.value)}
            placeholder="Proposal IDs (one per line)..."
          />
          <button
            onClick={loadProposals}
            disabled={loading}
            className="mt-4 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Requests"}
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          <RequestsTable proposals={proposals} isLoading={loading} />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500/40"></span>
            <span>✓ Approved (Executed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/40"></span>
            <span>✗ Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500/40"></span>
            <span>? Pending (Voting)</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

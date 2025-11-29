// src/pages/RequestsPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { MainLayout } from "../components/MainLayout";
import { RequestsTable } from "../components/RequestsTable";
import { apiGetProposal, apiGetUserProposals, type ProposalDto } from "../api";
import { isAdmin } from "../lib/adminCheck";

export default function RequestsPage() {
  const account = useCurrentAccount();
  const userIsAdmin = isAdmin(account?.address);
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalIds, setProposalIds] = useState<string>("");
  const [autoLoaded, setAutoLoaded] = useState(false);

  // Auto-load user's proposals when they have an account
  useEffect(() => {
    if (!account?.address || autoLoaded) return;

    async function loadUserProposals() {
      const userAddress = account?.address;
      if (!userAddress) return;
      
      try {
        setError(null);
        setLoading(true);
        const userProposals = await apiGetUserProposals(userAddress);
        setProposals(userProposals);
        setAutoLoaded(true);
      } catch (e: unknown) {
        // If auto-load fails, it's okay - user can still search manually
        console.error("Auto-load proposals failed:", e);
        setAutoLoaded(true);
      } finally {
        setLoading(false);
      }
    }

    loadUserProposals();
  }, [account?.address, autoLoaded]);

  const loadProposals = useCallback(async () => {
    const ids = proposalIds
      .split("\n")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      // If no IDs provided, reload auto-loaded proposals
      if (account?.address) {
        try {
          setError(null);
          setLoading(true);
          const userProposals = await apiGetUserProposals(account.address);
          setProposals(userProposals);
        } catch (e: unknown) {
          const err = e as Error;
          setError(err.message ?? String(e));
        } finally {
          setLoading(false);
        }
      } else {
        setProposals([]);
      }
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
  }, [proposalIds, account?.address]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">View Requests</h1>
          <p className="text-slate-400 text-sm mt-1">
            {userIsAdmin 
              ? "View all budget requests and their approval status."
              : "Showing proposals where you are a participant."}
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
            Search by Proposal ID
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Enter Proposal IDs (one per line) to search for specific proposals, 
            or leave empty to show your proposals.
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

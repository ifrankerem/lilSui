// src/pages/DashboardPage.tsx
import { useState } from "react";
import {
  apiCreateBudget,
  apiCreateProposal,
  apiVoteOnProposal,
  apiGetLogs,
  apiGetBudget,
  apiGetProposal,
  type LogEntry,
  type BudgetDto,
  type ProposalDto,
} from "../api";

function prettyStatus(statusRaw: any): string {
  if (!statusRaw) return "-";
  const asString = JSON.stringify(statusRaw);
  if (asString.includes("Voting")) return "Voting";
  if (asString.includes("Executed")) return "Executed";
  if (asString.includes("Rejected")) return "Rejected";
  return asString;
}

export default function DashboardPage() {
  // 1. Create Budget form state
  const [budgetName, setBudgetName] = useState("Beta Budget");
  const [budgetTotal, setBudgetTotal] = useState(1000);
  const [budgetId, setBudgetId] = useState("");

  const [budgetInfo, setBudgetInfo] = useState<BudgetDto | null>(null);

  // 2. Create Proposal form state
  const [proposalTitle, setProposalTitle] = useState("New Chairs");
  const [proposalDesc, setProposalDesc] = useState("Buy comfy chairs");
  const [proposalAmount, setProposalAmount] = useState(300);
  const [receiver, setReceiver] = useState("");
  const [participantsText, setParticipantsText] = useState("");
  const [proposalId, setProposalId] = useState("");

  const [proposalInfo, setProposalInfo] = useState<ProposalDto | null>(null);

  // 3. Logs + loading
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---

  const handleCreateBudget = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiCreateBudget(budgetName, budgetTotal);

      setBudgetId(res.budgetId);
      setBudgetInfo(null);
      console.log("Created budget:", res);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBudgetInfo = async () => {
    try {
      if (!budgetId) {
        setError("Önce bir budgetId seç / oluştur.");
        return;
      }
      setError(null);
      setLoading(true);
      const info = await apiGetBudget(budgetId);
      setBudgetInfo(info);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    try {
      if (!budgetId) {
        setError("Önce bir budgetId seç / oluştur.");
        return;
      }
      setError(null);
      setLoading(true);

      const participants = participantsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await apiCreateProposal({
        title: proposalTitle,
        description: proposalDesc,
        amount: proposalAmount,
        receiver,
        participants,
      });

      setProposalId(res.proposalId);
      setProposalInfo(null);
      console.log("Created proposal:", res);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProposalInfo = async () => {
    try {
      if (!proposalId) {
        setError("Önce bir proposalId seç / oluştur.");
        return;
      }
      setError(null);
      setLoading(true);
      const info = await apiGetProposal(proposalId);
      setProposalInfo(info);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (choice: boolean) => {
    try {
      if (!budgetId || !proposalId) {
        setError("BudgetId ve ProposalId gerekiyor.");
        return;
      }
      setError(null);
      setLoading(true);

      const res = await apiVoteOnProposal(proposalId, budgetId, choice);
      console.log("Vote result:", res);

      const info = await apiGetProposal(proposalId);
      setProposalInfo(info);
    } catch (e: any) {
      setError(e.message ?? String(e));
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
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const remaining =
    budgetInfo ? budgetInfo.total - budgetInfo.spent : undefined;

  // --- UI ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Community Budget dApp</h1>

      {error && (
        <div className="bg-red-900/40 border border-red-500 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-slate-400">Loading...</p>}

      {/* 1. Create Budget */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Create Budget</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            placeholder="Budget name"
          />
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 w-32"
            type="number"
            value={budgetTotal}
            onChange={(e) => setBudgetTotal(Number(e.target.value))}
            placeholder="Total"
          />
          <button
            onClick={handleCreateBudget}
            className="px-4 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            Create Budget
          </button>
          <button
            onClick={handleLoadBudgetInfo}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs"
          >
            Load Budget Detail
          </button>
        </div>
        <div className="mt-1 text-sm flex items-center gap-2">
          <span className="mr-1">Current budgetId:</span>
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 w-[460px]"
            value={budgetId}
            onChange={(e) => setBudgetId(e.target.value)}
            placeholder="Paste existing budgetId if you already have one"
          />
        </div>

        {budgetInfo && (
          <div className="mt-3 max-w-xl bg-slate-800/60 border border-slate-700 rounded p-3 text-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{budgetInfo.name}</span>
              <span className="font-mono text-xs">
                {budgetInfo.id.slice(0, 10)}…
              </span>
            </div>
            <div>
              Total: <span className="font-mono">{budgetInfo.total}</span>
            </div>
            <div>
              Spent: <span className="font-mono">{budgetInfo.spent}</span>
            </div>
            <div>
              Remaining:{" "}
              <span className="font-mono">
                {remaining !== undefined ? remaining : "-"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Create Proposal */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Create Proposal</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            placeholder="Title"
          />
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 w-72"
            value={proposalDesc}
            onChange={(e) => setProposalDesc(e.target.value)}
            placeholder="Description"
          />
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 w-24"
            type="number"
            value={proposalAmount}
            onChange={(e) => setProposalAmount(Number(e.target.value))}
            placeholder="Amount"
          />
          <input
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 w-[260px]"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Receiver address"
          />
        </div>

        <textarea
          className="mt-2 w-full min-h-[80px] px-2 py-1 rounded bg-slate-800 border border-slate-700"
          value={participantsText}
          onChange={(e) => setParticipantsText(e.target.value)}
          placeholder="One address per line"
        />

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button
            onClick={handleCreateProposal}
            className="px-4 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            Create Proposal
          </button>
          <button
            onClick={handleLoadProposalInfo}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs"
          >
            Load Proposal Detail
          </button>
          <span className="text-sm">
            Current proposalId:{" "}
            <input
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 w-[460px]"
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              placeholder="Paste existing proposalId if you already have one"
            />
          </span>
        </div>

        {proposalInfo && (
          <div className="mt-3 max-w-3xl bg-slate-800/60 border border-slate-700 rounded p-3 text-sm space-y-1">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">
                  {proposalInfo.title} – {proposalInfo.description}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {proposalInfo.id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase text-slate-400">Status</div>
                <div className="font-semibold">
                  {prettyStatus(proposalInfo.statusRaw)}
                </div>
              </div>
            </div>
            <div>
              Amount:{" "}
              <span className="font-mono">{proposalInfo.amount}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                ✅ <span className="font-mono">{proposalInfo.yesVotes}</span>
              </span>
              <span>
                ❌ <span className="font-mono">{proposalInfo.noVotes}</span>
              </span>
              <span className="text-xs text-slate-400">
                ({proposalInfo.votesCast}/{proposalInfo.totalVoters})
              </span>
            </div>
            <div>
              Receiver:{" "}
              <span className="font-mono">
                {proposalInfo.receiver.slice(0, 10)}…
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Participants ({proposalInfo.participants.length}):{" "}
              {proposalInfo.participants
                .map((p) => p.slice(0, 10) + "…")
                .join(", ")}
            </div>
          </div>
        )}
      </section>

      {/* 3. Vote & Logs */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Vote & Logs</h2>
        <div className="flex gap-2 mb-2 flex-wrap">
          <button
            onClick={() => handleVote(true)}
            className="px-4 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            Vote YES
          </button>
          <button
            onClick={() => handleVote(false)}
            className="px-4 py-1 rounded bg-rose-500 hover:bg-rose-600 text-black font-semibold"
          >
            Vote NO
          </button>
          <button
            onClick={handleLoadLogs}
            className="px-4 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
          >
            Load Logs
          </button>
        </div>

        <div className="text-xs text-slate-400 mb-1">
          tx&nbsp;&nbsp;proposal&nbsp;&nbsp;amount&nbsp;&nbsp;receiver&nbsp;&nbsp;time
        </div>
        {logs.length === 0 ? (
          <div className="text-sm text-slate-500">No logs yet</div>
        ) : (
          <ul className="space-y-1 text-xs">
            {logs.map((log) => (
              <li key={log.txDigest} className="font-mono">
                {log.txDigest.slice(0, 8)}… • {log.proposalId.slice(0, 8)}… •{" "}
                {log.amount} • {log.receiver.slice(0, 8)}… •{" "}
                {new Date(log.timestampMs).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// src/pages/CreateRequestPage.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { apiCreateProposal, apiCreateBudget } from "../api";

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Budget creation state
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [budgetTotal, setBudgetTotal] = useState(1000);

  // Proposal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [participantsText, setParticipantsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<"proposal" | "budget" | null>(null);
  const [copied, setCopied] = useState(false);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyId = async () => {
    if (successId) {
      try {
        await navigator.clipboard.writeText(successId);
        setCopied(true);
        // Clear any existing timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for environments where clipboard API is not available
        setError("Failed to copy to clipboard. Please copy the ID manually.");
      }
    }
  };

  const handleCreateBudget = async () => {
    if (!budgetName) {
      setError("Budget name is required.");
      return;
    }
    if (budgetTotal <= 0) {
      setError("Budget amount must be greater than 0.");
      return;
    }

    try {
      setError(null);
      setSuccessId(null);
      setSuccessType(null);
      setLoading(true);

      const res = await apiCreateBudget(budgetName, budgetTotal);
      setSuccessId(res.budgetId);
      setSuccessType("budget");
      setBudgetName("");
      setBudgetTotal(1000);
      setShowBudgetForm(false);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    // Validation
    if (!title) {
      setError("Title is required.");
      return;
    }
    if (!description) {
      setError("Description is required.");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (!receiver) {
      setError("Receiver address is required.");
      return;
    }

    const participants = participantsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (participants.length === 0) {
      setError("At least one participant address is required.");
      return;
    }

    try {
      setError(null);
      setSuccessId(null);
      setSuccessType(null);
      setLoading(true);

      const res = await apiCreateProposal({
        title,
        description,
        amount,
        receiver,
        participants,
      });

      setSuccessId(res.proposalId);
      setSuccessType("proposal");

      // Clear form
      setTitle("");
      setDescription("");
      setAmount(0);
      setReceiver("");
      setParticipantsText("");
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Create Request</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create a new budget request.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Success Display */}
        {successId && successType && (
          <div className="bg-emerald-900/40 border border-emerald-500 px-4 py-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <span className="text-emerald-300 font-medium">
                {successType === "proposal" ? "Request created successfully!" : "Budget created successfully!"}
              </span>
            </div>
            <div className="mb-3">
              <p className="text-sm text-slate-400 mb-1">
                {successType === "proposal" ? "Proposal ID:" : "Budget ID:"}
              </p>
              <p className="text-emerald-300 font-mono text-sm break-all">{successId}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyId}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-100 text-sm transition-colors"
              >
                <span>📋</span>
                {copied ? "Copied!" : "Copy ID"}
              </button>
              <button
                onClick={() => navigate("/requests")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm transition-colors"
              >
                <span>→</span>
                View Requests
              </button>
            </div>
          </div>
        )}

        {/* Budget Creation Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            {showBudgetForm ? "← Back to Proposal Form" : "Create New Budget"}
          </button>
        </div>

        {/* Budget Creation Form */}
        {showBudgetForm && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Create New Budget
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Budget Name
              </label>
              <input
                type="text"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="e.g., Event Budget"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Total Amount
              </label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleCreateBudget}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Budget"}
            </button>
          </div>
        )}

        {/* Proposal Form */}
        {!showBudgetForm && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              New Request
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New Chairs"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the request..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0"
                placeholder="Requested amount"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Receiver */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Receiver Address *
              </label>
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Participants (Voters) *
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Enter one address per line. These addresses can approve or reject the request.
              </p>
              <textarea
                value={participantsText}
                onChange={(e) => setParticipantsText(e.target.value)}
                placeholder="0x...\n0x...\n0x..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCreateProposal}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Request"}
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

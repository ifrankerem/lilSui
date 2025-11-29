// src/pages/CreateRequestPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { MainLayout } from "../components/MainLayout";
import { apiCreateProposal, apiCreateBudget } from "../api";
import { isAdmin } from "../lib/adminCheck";

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const userIsAdmin = isAdmin(account?.address);

  // Budget creation state
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [adminCapId, setAdminCapId] = useState("");
  const [coinObjectId, setCoinObjectId] = useState("");

  // Proposal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [participantsText, setParticipantsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateBudget = async () => {
    if (!budgetName) {
      setError("Budget name is required.");
      return;
    }
    if (!adminCapId) {
      setError("AdminCap ID is required.");
      return;
    }
    if (!coinObjectId) {
      setError("SUI Coin Object ID is required.");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const res = await apiCreateBudget(adminCapId, budgetName, coinObjectId);
      setSuccess(`Budget created! ID: ${res.budgetId}`);
      setBudgetName("");
      setAdminCapId("");
      setCoinObjectId("");
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
      setSuccess(null);
      setLoading(true);

      const res = await apiCreateProposal({
        title,
        description,
        amount,
        receiver,
        participants,
      });

      setSuccess(`Request created! Proposal ID: ${res.proposalId}`);

      // Clear form
      setTitle("");
      setDescription("");
      setAmount(0);
      setReceiver("");
      setParticipantsText("");

      // Optionally navigate to requests page after success
      setTimeout(() => {
        navigate("/requests");
      }, 2000);
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
            Create a new budget request or proposal.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-emerald-900/40 border border-emerald-500 px-4 py-3 rounded-lg text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Budget Creation Toggle - Only visible to admin */}
        {userIsAdmin && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              {showBudgetForm ? "← Back to Proposal Form" : "Create New Budget"}
            </button>
          </div>
        )}

        {/* Budget Creation Form - Only visible to admin */}
        {userIsAdmin && showBudgetForm && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Create New Budget
            </h2>
            <p className="text-sm text-amber-400">
              ⚠️ Admin only: This will deposit real SUI into the budget.
            </p>

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
                AdminCap Object ID
              </label>
              <input
                type="text"
                value={adminCapId}
                onChange={(e) => setAdminCapId(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SUI Coin Object ID (to deposit)
              </label>
              <input
                type="text"
                value={coinObjectId}
                onChange={(e) => setCoinObjectId(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            <button
              onClick={handleCreateBudget}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Budget"}
            </button>
          </div>
        )}

        {/* Proposal Form */}
        {(!userIsAdmin || !showBudgetForm) && (
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
                Amount (SUI) *
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

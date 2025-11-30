// src/pages/CreateRequestPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { MainLayout } from "../components/MainLayout";
import { apiCreateProposal, apiCreateBudget } from "../api";
import { isAdmin } from "../lib/adminCheck";

// 1 SUI = 1,000,000,000 MIST
const SUI_TO_MIST = 1_000_000_000;

type SuccessInfo = {
  type: "budget" | "proposal";
  id: string;
  txDigest: string;
};

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const userIsAdmin = isAdmin(account?.address);

  // Budget creation state
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [adminCapId, setAdminCapId] = useState("");
  const [coinObjectId, setCoinObjectId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  // Proposal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [participantsText, setParticipantsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    if (successInfo) {
      await navigator.clipboard.writeText(successInfo.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    const amountNum = parseFloat(budgetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    // Convert SUI to MIST
    const amountInMist = Math.floor(amountNum * SUI_TO_MIST);

    try {
      setError(null);
      setSuccessInfo(null);
      setLoading(true);

      const res = await apiCreateBudget(adminCapId, budgetName, coinObjectId, amountInMist);
      setSuccessInfo({
        type: "budget",
        id: res.budgetId,
        txDigest: res.txDigest,
      });
      setBudgetName("");
      setAdminCapId("");
      setCoinObjectId("");
      setBudgetAmount("");
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
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
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

    // Convert SUI to MIST for the proposal amount
    const amountInMist = Math.floor(amountNum * SUI_TO_MIST);

    try {
      setError(null);
      setSuccessInfo(null);
      setLoading(true);

      const res = await apiCreateProposal({
        title,
        description,
        amount: amountInMist,
        receiver,
        participants,
      });

      setSuccessInfo({
        type: "proposal",
        id: res.proposalId,
        txDigest: res.txDigest,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setAmount("");
      setReceiver("");
      setParticipantsText("");

      // NO auto-redirect - user stays on the page to see the ID
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSuccess = () => {
    setSuccessInfo(null);
    setShowBudgetForm(false);
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

        {/* Success Display with ID and Copy Button */}
        {successInfo && (
          <div className="bg-emerald-900/40 border border-emerald-500 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg font-semibold text-emerald-300">
                {successInfo.type === "budget" ? "Budget Created!" : "Proposal Created!"}
              </h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">
                  {successInfo.type === "budget" ? "Budget ID" : "Proposal ID"}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded bg-slate-800 text-emerald-300 font-mono text-sm break-all">
                    {successInfo.id}
                  </code>
                  <button
                    onClick={handleCopyId}
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors text-sm whitespace-nowrap"
                  >
                    {copied ? "Copied!" : "Copy ID"}
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-xs uppercase text-slate-400 mb-1">Transaction Digest</p>
                <code className="block px-3 py-2 rounded bg-slate-800 text-slate-300 font-mono text-xs break-all">
                  {successInfo.txDigest}
                </code>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => navigate("/requests")}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold transition-colors"
              >
                View Requests
              </button>
              <button
                onClick={handleResetSuccess}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* Budget Creation Toggle - Only visible to admin */}
        {userIsAdmin && !successInfo && (
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
        {userIsAdmin && showBudgetForm && !successInfo && (
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
                SUI Coin Object ID (to split from)
              </label>
              <input
                type="text"
                value={coinObjectId}
                onChange={(e) => setCoinObjectId(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Only the specified amount will be taken. Remaining SUI stays in your wallet.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount (SUI) *
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                min="0"
                step="0.000000001"
                placeholder="e.g., 10.5"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter the amount to deposit into the budget (in SUI).
              </p>
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
        {(!userIsAdmin || !showBudgetForm) && !successInfo && (
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
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.000000001"
                placeholder="e.g., 0.5"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter any amount (e.g., 0.1, 0.5, 1.5 SUI).
              </p>
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

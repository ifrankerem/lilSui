// src/pages/ProposalDetailPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"; // 👈 Değişti
import { Transaction } from "@mysten/sui/transactions"; // 👈 Değişti
import { apiGetProposal, type ProposalDto } from "../api";
import { MainLayout } from "../components/MainLayout";
import { StatusBadge, parseStatus } from "../components/StatusBadge";

const PACKAGE_ID = "0x774c316bb580ed5d8709f90ce6fbbd9193e78484c3b6e8868d35d618453b93b5";

export function ProposalDetailPage() {
  const { proposalId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  // Wallet hook'ları
  const account = useCurrentAccount();
  const userAddress = account?.address || "";
  
  // 👈 Yeni API
  const { mutateAsync: signAndExecute, isPending: isVoting } = useSignAndExecuteTransaction();

  // Kullanıcı bu proposal'a oy vermiş mi?
  const hasVotedKey = `voted-${proposalId}-${userAddress}`;
  const [hasVoted, setHasVoted] = useState(() => {
    if (! userAddress) return false;
    return localStorage.getItem(hasVotedKey) === "true";
  });

  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery<ProposalDto>({
    queryKey: ["proposal", proposalId],
    queryFn: () => apiGetProposal(proposalId),
    enabled: !!proposalId,
  });

  // 👈 Yeni: Frontend'den direkt vote
  const handleVote = async (choice: boolean) => {
    setVoteError(null);
    setVoteSuccess(null);

    const budgetId = proposal?.budgetId;
    if (!budgetId) {
      setVoteError("This proposal is not linked to a budget.");
      return;
    }

    try {
      // 👈 Yeni Transaction API
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::governance::vote`,
        arguments: [
          tx.object(budgetId),
          tx.object(proposalId),
          tx.pure. bool(choice),
        ],
      });

      const result = await signAndExecute({
        transaction: tx, // 👈 Değişti
      });

      setVoteSuccess(`Vote submitted successfully! TX: ${result.digest}`);
      localStorage.setItem(hasVotedKey, "true");
      setHasVoted(true);
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
    } catch (err: any) {
      const message = err.message || String(err);

      if (message.includes("MoveAbort") && message.includes(", 6)")) {
        setVoteError("You have already voted on this proposal.");
        localStorage.setItem(hasVotedKey, "true");
        setHasVoted(true);
      } else if (message.includes("MoveAbort") && message.includes(", 7)")) {
        setVoteError("You are not a participant in this proposal.");
      } else if (message.includes("MoveAbort") && message. includes(", 8)")) {
        setVoteError("Budget mismatch error.");
      } else if (message. includes("rejected") || message.includes("cancelled")) {
        setVoteError("Transaction was cancelled.");
      } else {
        setVoteError(message || "Failed to submit vote");
      }
    }
  };

  // Kullanıcı participant mı kontrol et
  const isParticipant = proposal?.participants?. some(
    (p) => p.toLowerCase() === userAddress.toLowerCase()
  ) ??  false;

  // Voting durumunda mı?
  const isVotingStatus = (() => {
    const status = proposal?.statusRaw;
    if (!status) return false;

    if (typeof status === "string") return status === "Voting";

    if (typeof status === "object" && status !== null) {
      const s = status as Record<string, unknown>;
      if (s.variant === "Voting") return true;
      if ("Voting" in s) return true;
    }

    return false;
  })();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !proposal) {
    return (
      <MainLayout>
        <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
          Proposal not found or an error occurred while loading.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Proposal Header */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {proposal. title}
              </h1>
              <p className="text-slate-400 mt-1">{proposal.description}</p>
            </div>
            <StatusBadge status={parseStatus(proposal.statusRaw)} />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            ID:{" "}
            <a
              href={`https://testnet.suivision.xyz/object/${proposal. id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              {proposal.id}
            </a>
          </div>
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400 mb-1">Amount</p>
            <p className="text-2xl font-bold text-emerald-400">
              {(proposal.amount / 1_000_000_000).toFixed(4)} SUI
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400 mb-1">Votes</p>
            <div className="flex items-center gap-4 text-lg">
              <span className="text-emerald-400">✓ {proposal.yesVotes}</span>
              <span className="text-red-400">✗ {proposal. noVotes}</span>
              <span className="text-sm text-slate-500">
                ({proposal.votesCast}/{proposal.totalVoters})
              </span>
            </div>
          </div>
        </div>

        {/* Vote Buttons */}
        {isVotingStatus && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <p className="text-xs uppercase text-slate-400 mb-4">Cast Your Vote</p>

            {! userAddress ? (
              <p className="text-yellow-400 text-sm">
                Please connect your wallet to vote.
              </p>
            ) : ! isParticipant ? (
              <p className="text-yellow-400 text-sm">
                You are not a participant in this proposal.  Only participants can vote.
              </p>
            ) : hasVoted ? (
              <div className="bg-emerald-900/40 border border-emerald-600 rounded-lg p-4">
                <p className="text-emerald-400 text-sm font-semibold">
                  ✓ You have already voted on this proposal.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(true)}
                    disabled={isVoting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 
                               disabled:cursor-not-allowed text-white font-semibold py-3 px-6 
                               rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isVoting ? <span>Signing...</span> : <><span>✓</span><span>Vote Yes</span></>}
                  </button>

                  <button
                    onClick={() => handleVote(false)}
                    disabled={isVoting}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800 
                               disabled:cursor-not-allowed text-white font-semibold py-3 px-6 
                               rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isVoting ? <span>Signing...</span> : <><span>✗</span><span>Vote No</span></>}
                  </button>
                </div>

                {voteError && (
                  <div className="mt-4 bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
                    {voteError}
                  </div>
                )}
                {voteSuccess && (
                  <div className="mt-4 bg-emerald-900/40 border border-emerald-500 px-4 py-3 rounded-lg text-sm text-emerald-300">
                    {voteSuccess}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Receiver */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-400 mb-2">Receiver</p>
          <p className="text-sm text-slate-100 font-mono break-all">
            {proposal. receiver}
          </p>
        </div>

        {/* Participants */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-400 mb-2">
            Participants ({proposal.participants.length})
          </p>
          <div className="space-y-1">
            {proposal.participants. map((p, i) => (
              <p
                key={i}
                className={`text-xs font-mono ${
                  p. toLowerCase() === userAddress.toLowerCase()
                    ? "text-cyan-400 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {p} {p.toLowerCase() === userAddress.toLowerCase() && "(You)"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
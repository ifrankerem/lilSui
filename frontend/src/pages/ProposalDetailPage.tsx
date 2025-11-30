// src/pages/ProposalDetailPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetProposal, apiVoteOnProposal, type ProposalDto } from "../api";
import { MainLayout } from "../components/MainLayout";
import { StatusBadge, parseStatus } from "../components/StatusBadge";

// sui-dapp-kit'ten wallet adresini al
const getUserAddress = (): string => {
  try {
    const walletInfo = localStorage.getItem("sui-dapp-kit:wallet-connection-info");
    if (walletInfo) {
      const parsed = JSON.parse(walletInfo);
      return parsed?.state?.lastConnectedAccountAddress || "";
    }
  } catch (e) {
    console.error("Failed to parse wallet info", e);
  }
  return "";
};

export function ProposalDetailPage() {
  const { proposalId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  // Kullanıcının adresini al
  const userAddress = getUserAddress();
  
  // ...  geri kalan kod aynı kalacak

  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery<ProposalDto>({
    queryKey: ["proposal", proposalId],
    queryFn: () => apiGetProposal(proposalId),
    enabled: !!proposalId,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (choice: boolean) => {
      const budgetId = localStorage. getItem("currentBudgetId") || "";
      if (!budgetId) {
        throw new Error("Budget ID not found.  Please select a budget first.");
      }
      return apiVoteOnProposal(proposalId, budgetId, choice);
    },
    onSuccess: (data) => {
      setVoteSuccess(`Vote submitted successfully!  TX: ${data.txDigest}`);
      setVoteError(null);
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
    },
    onError: (err: any) => {
      setVoteError(err.message || "Failed to submit vote");
      setVoteSuccess(null);
    },
  });

  // Kullanıcı participant mı kontrol et
  const isParticipant = proposal?.participants?. some(
    (p) => p.toLowerCase() === userAddress.toLowerCase()
  ) ??  false;

  // Voting durumunda mı? (Move enum formatı: { variant: 'Voting' })
  const isVotingStatus = (() => {
    const status = proposal?.statusRaw;
    if (!status) return false;
    
    if (typeof status === "string") return status === "Voting";
    
    if (typeof status === "object" && status !== null) {
      const s = status as Record<string, unknown>;
      // Move enum: { variant: 'Voting' }
      if (s. variant === "Voting") return true;
      // Eski format: { Voting: null }
      if ("Voting" in s) return true;
    }
    
    return false;
  })();

  const handleVote = (choice: boolean) => {
    setVoteError(null);
    setVoteSuccess(null);
    voteMutation.mutate(choice);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading... </div>
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
                {proposal.title}
              </h1>
              <p className="text-slate-400 mt-1">{proposal.description}</p>
            </div>
            <StatusBadge status={parseStatus(proposal.statusRaw)} />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            ID:{" "}
            <a
              href={`https://testnet.suivision.xyz/object/${proposal.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              {proposal. id}
            </a>
          </div>
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400 mb-1">Amount</p>
            <p className="text-2xl font-bold text-emerald-400">
              {proposal. amount} SUI
            </p>
          </div>

          {/* Votes */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400 mb-1">Votes</p>
            <div className="flex items-center gap-4 text-lg">
              <span className="text-emerald-400">✓ {proposal.yesVotes}</span>
              <span className="text-red-400">✗ {proposal.noVotes}</span>
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

            {! userAddress ?  (
              <p className="text-yellow-400 text-sm">
                Please connect your wallet to vote. 
              </p>
            ) : ! isParticipant ? (
              <p className="text-yellow-400 text-sm">
                You are not a participant in this proposal.  Only participants can vote.
              </p>
            ) : (
              <>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(true)}
                    disabled={voteMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 
                               disabled:cursor-not-allowed text-white font-semibold py-3 px-6 
                               rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {voteMutation.isPending ? (
                      <span>Voting...</span>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Vote Yes</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleVote(false)}
                    disabled={voteMutation. isPending}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800 
                               disabled:cursor-not-allowed text-white font-semibold py-3 px-6 
                               rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {voteMutation.isPending ?  (
                      <span>Voting... </span>
                    ) : (
                      <>
                        <span>✗</span>
                        <span>Vote No</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Vote Messages */}
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
            {proposal.receiver}
          </p>
        </div>

        {/* Participants */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-400 mb-2">
            Participants ({proposal.participants.length})
          </p>
          <div className="space-y-1">
            {proposal. participants.map((p, i) => (
              <p
                key={i}
                className={`text-xs font-mono ${
                  p.toLowerCase() === userAddress.toLowerCase()
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
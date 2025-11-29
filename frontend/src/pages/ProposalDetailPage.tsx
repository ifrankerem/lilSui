// src/pages/ProposalDetailPage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGetProposal, type ProposalDto } from "../api";

export function ProposalDetailPage() {
  const { proposalId = "" } = useParams();
  const navigate = useNavigate();

  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery<ProposalDto>({
    queryKey: ["proposal", proposalId],
    queryFn: () => apiGetProposal(proposalId),
    enabled: !!proposalId,
  });

  if (isLoading) {
    return <div className="p-4 text-slate-200">Loading…</div>;
  }

  if (error || !proposal) {
    return (
      <div className="p-4 text-red-400">
        Proposal bulunamadı veya yüklenirken hata oluştu.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-sm"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
      <p className="text-slate-300 mb-4">{proposal.description}</p>

      <div className="space-y-2 text-sm max-w-2xl">
        <div>
          <span className="font-semibold">Proposal ID: </span>
          <span className="font-mono">{proposal.id}</span>
        </div>
        <div>
          <span className="font-semibold">Amount: </span>
          <span className="font-mono">{proposal.amount}</span>
        </div>
        <div>
          <span className="font-semibold">Receiver: </span>
          <span className="font-mono">
            {proposal.receiver.slice(0, 10)}…
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            ✅ <span className="font-mono">{proposal.yesVotes}</span>
          </span>
          <span>
            ❌ <span className="font-mono">{proposal.noVotes}</span>
          </span>
          <span className="text-xs text-slate-400">
            ({proposal.votesCast}/{proposal.totalVoters})
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Participants ({proposal.participants.length}):{" "}
          {proposal.participants.map((p) => p.slice(0, 10) + "…").join(", ")}
        </div>
      </div>
    </div>
  );
}

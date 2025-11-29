// src/pages/ProposalDetailPage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGetProposal, type ProposalDto } from "../api";
import { MainLayout } from "../components/MainLayout";
import { StatusBadge, parseStatus } from "../components/StatusBadge";

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
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Yükleniyor...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !proposal) {
    return (
      <MainLayout>
        <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
          Proposal bulunamadı veya yüklenirken hata oluştu.
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
          ← Geri
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
            ID: {proposal.id}
          </div>
        </div>

        {/* Proposal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400 mb-1">Miktar</p>
            <p className="text-2xl font-bold text-emerald-400">
              {proposal.amount} TL
            </p>
          </div>

          {/* Votes */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400 mb-1">Oylar</p>
            <div className="flex items-center gap-4 text-lg">
              <span className="text-emerald-400">
                ✓ {proposal.yesVotes}
              </span>
              <span className="text-red-400">✗ {proposal.noVotes}</span>
              <span className="text-sm text-slate-500">
                ({proposal.votesCast}/{proposal.totalVoters})
              </span>
            </div>
          </div>
        </div>

        {/* Receiver */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-400 mb-2">Alıcı</p>
          <p className="text-sm text-slate-100 font-mono break-all">
            {proposal.receiver}
          </p>
        </div>

        {/* Participants */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <p className="text-xs uppercase text-slate-400 mb-2">
            Katılımcılar ({proposal.participants.length})
          </p>
          <div className="space-y-1">
            {proposal.participants.map((p, i) => (
              <p key={i} className="text-xs text-slate-400 font-mono">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

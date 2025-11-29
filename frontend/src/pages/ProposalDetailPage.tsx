// src/pages/ProposalDetailPage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGetProposal } from "../api";
import { useMessaging } from "../messaging/useMessaging";

export function ProposalDetailPage() {
  const { proposalId = "" } = useParams();
  const navigate = useNavigate();
  const { createOrGetProposalChannel } = useMessaging();

  const { data: proposal } = useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () => apiGetProposal(proposalId),
    enabled: !!proposalId,
  });

  if (!proposal) return <div>Loading…</div>;

  async function handleOpenChat() {
    try {
      console.log("[proposal] opening chat for", proposal.id);

      const channelId = await createOrGetProposalChannel({
        proposalId: proposal.id,
        budgetId: (proposal as any).budgetId ?? proposal.id,
        members: proposal.participants,
      });

      navigate(`/chat/${channelId}`);
    } catch (e) {
      console.error("[proposal] Failed to open proposal chat", e);
      alert(
        "Chat kanalı oluşturulurken hata oldu. Detay için F12 > Console'a bak.",
      );
    }
  }

  return (
    <div className="p-6 text-slate-100">
      <h1 className="text-3xl font-bold mb-2">
        {proposal.title ?? `Proposal ${proposal.id}`}
      </h1>
      {proposal.description && (
        <p className="text-sm text-slate-300 mb-4">{proposal.description}</p>
      )}

      <button
        onClick={handleOpenChat}
        className="px-3 py-2 rounded bg-sky-500 text-sm font-semibold text-black"
      >
        Proposal Chat’ini Aç
      </button>
    </div>
  );
}

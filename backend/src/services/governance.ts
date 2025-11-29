// backend/src/services/governance.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { PACKAGE_ID } from "../config/sui";
import { sponsorAndExecuteWithEnoki } from "../lib/enokiSponsor";
import { suiClient } from "../lib/suiClient";

// ----------------------------------------------------
// 1) BÜTÇE OLUŞTURMA  (Enoki sponsorlu)
// ----------------------------------------------------
export async function createBudgetOnChain(name: string, total: number) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_budget`,
    arguments: [tx.pure.string(name), tx.pure.u64(String(total))],
  });

  const res = await sponsorAndExecuteWithEnoki(tx, {
    allowedMoveCallTargets: [`${PACKAGE_ID}::governance::create_budget`],
  });

  const created = (res.objectChanges ?? []).find(
    (c: any) =>
      c.type === "created" &&
      typeof c.objectType === "string" &&
      c.objectType.includes("governance::CommunityBudget"),
  ) as any | undefined;

  if (!created) {
    throw new Error("create_budget: CommunityBudget object not found in effects");
  }

  return {
    txDigest: res.digest,
    budgetId: created.objectId,
    effects: res.effects,
  };
}

// ----------------------------------------------------
// 2) PROPOSAL OLUŞTURMA (Enoki sponsorlu)
// ----------------------------------------------------
export async function createProposalOnChain(input: {
  title: string;
  description: string;
  amount: number;
  receiver: string;
  participants: string[];
}) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_proposal`,
    arguments: [
      tx.pure.string(input.title),
      tx.pure.string(input.description),
      tx.pure.u64(String(input.amount)),
      tx.pure.address(input.receiver),
      tx.pure(input.participants),
    ],
  });

  const res = await sponsorAndExecuteWithEnoki(tx, {
    allowedMoveCallTargets: [`${PACKAGE_ID}::governance::create_proposal`],
    allowedAddresses: [input.receiver],
  });

  const created = (res.objectChanges ?? []).find(
    (c: any) =>
      c.type === "created" &&
      typeof c.objectType === "string" &&
      c.objectType.includes("governance::Proposal"),
  ) as any | undefined;

  if (!created) {
    throw new Error("create_proposal: Proposal object not found in effects");
  }

  return {
    txDigest: res.digest,
    proposalId: created.objectId,
    effects: res.effects,
  };
}

// ----------------------------------------------------
// 3) OY VERME (Enoki sponsorlu)
// ----------------------------------------------------
export async function voteOnProposalOnChain(input: {
  budgetId: string;
  proposalId: string;
  choice: boolean;
}) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::vote`,
    arguments: [
      tx.object(input.budgetId),
      tx.object(input.proposalId),
      tx.pure(input.choice), // true = yes, false = no
    ],
  });

  const res = await sponsorAndExecuteWithEnoki(tx, {
    allowedMoveCallTargets: [`${PACKAGE_ID}::governance::vote`],
    allowedAddresses: [input.budgetId, input.proposalId],
  });

  return {
    txDigest: res.digest,
    effects: res.effects,
  };
}

// ----------------------------------------------------
// 4) BÜTÇEYİ OKUMA  (Sadece read; Enoki yok)
// ----------------------------------------------------
export async function getBudget(budgetId: string) {
  const obj = await suiClient.getObject({
    id: budgetId,
    options: { showContent: true },
  });

  const data = (obj.data?.content as any)?.fields ?? {};

  return {
    id: budgetId,
    name: data.name ?? "",
    total: Number(data.total ?? 0),
    spent: Number(data.spent ?? 0),
  };
}

// ----------------------------------------------------
// 5) PROPOSAL OKUMA
// ----------------------------------------------------
export async function getProposal(proposalId: string) {
  const obj = await suiClient.getObject({
    id: proposalId,
    options: { showContent: true },
  });

  const data = (obj.data?.content as any)?.fields ?? {};

  return {
    id: proposalId,
    title: data.title ?? "",
    description: data.description ?? "",
    amount: Number(data.amount ?? 0),
    yesVotes: Number(data.yes_votes ?? data.yesVotes ?? 0),
    noVotes: Number(data.no_votes ?? data.noVotes ?? 0),
    totalVoters: Number(data.total_voters ?? data.totalVoters ?? 0),
    votesCast: Number(data.votes_cast ?? data.votesCast ?? 0),
    statusRaw: data.status ?? data.status_raw ?? data.statusRaw,
    receiver: data.receiver ?? "",
    participants: (data.participants as string[]) ?? [],
  };
}

// ----------------------------------------------------
// 6) HARCAMA LOG EVENTLERİ
// ----------------------------------------------------
export async function getSpendingEvents() {
  const ev = await suiClient.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::governance::SpendingEvent`,
    },
    limit: 50,
  });

  return ev.data.map((e: any) => {
    const parsed = (e.parsedJson ?? {}) as any;
    return {
      txDigest: e.id?.txDigest ?? e.txDigest ?? "",
      timestampMs: Number(e.timestampMs ?? 0),
      budgetId:
        parsed.budget_id ?? parsed.budget ?? parsed.budgetId ?? "unknown",
      proposalId:
        parsed.proposal_id ?? parsed.proposal ?? parsed.proposalId ?? "unknown",
      amount: Number(parsed.amount ?? 0),
      receiver: parsed.receiver ?? "",
    };
  });
}

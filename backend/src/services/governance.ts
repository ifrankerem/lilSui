// backend/src/services/governance.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { PACKAGE_ID } from "../config/sui";
import { sponsorAndExecuteWithEnoki } from "../lib/enokiSponsor";
import { suiClient } from "../lib/suiClient";

// ----------------------------------------------------
// 1) CREATE BUDGET (Enoki sponsored)
// Requires AdminCap and real SUI coin
// ----------------------------------------------------
export async function createBudgetOnChain(
  adminCapId: string,
  name: string,
  coinObjectId: string
) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_budget`,
    arguments: [
      tx.object(adminCapId),
      tx.pure.string(name),
      tx.object(coinObjectId),
    ],
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
// 2) CREATE PROPOSAL (Enoki sponsored)
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
// 3) VOTE (Enoki sponsored)
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
// 4) READ BUDGET (Read only; no Enoki)
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
// 5) READ PROPOSAL
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
// 6) GET SPENDING LOG EVENTS
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

// ----------------------------------------------------
// 7) GET ALL PROPOSALS (using indexer/RPC)
// Note: This is a limited implementation. In production, use an indexer like
// SuiVision or custom indexer to track all shared proposal objects.
// For now, this returns proposals from SpendingEvents (executed proposals only).
// The frontend also supports searching by proposal ID for pending proposals.
// ----------------------------------------------------
export async function getAllProposals() {
  try {
    // Query SpendingEvents to get proposal IDs of executed proposals
    // Note: This only captures executed proposals. For a complete list,
    // you would need an indexer that tracks all Proposal object creations.
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::governance::SpendingEvent`,
      },
      limit: 100,
    });

    const proposalIds = new Set<string>();
    events.data.forEach((e: any) => {
      const parsed = (e.parsedJson ?? {}) as any;
      if (parsed.proposal_id) {
        proposalIds.add(parsed.proposal_id);
      }
    });

    const proposals = await Promise.all(
      Array.from(proposalIds).map((id) => getProposal(id).catch(() => null))
    );

    return proposals.filter((p): p is NonNullable<typeof p> => p !== null);
  } catch {
    return [];
  }
}

// ----------------------------------------------------
// 8) GET PROPOSALS BY USER (participant)
// ----------------------------------------------------
export async function getProposalsByUser(userAddress: string) {
  const allProposals = await getAllProposals();
  return allProposals.filter((p) =>
    p.participants.some(
      (participant) => participant.toLowerCase() === userAddress.toLowerCase()
    )
  );
}

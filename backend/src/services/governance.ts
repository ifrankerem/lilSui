// src/services/governance.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import type { SuiObjectResponse } from "@mysten/sui.js/client";

import { suiClient } from "../lib/suiClient";
import { getSponsorKeypair } from "../lib/keypair";
import { PACKAGE_ID, SPENDING_EVENT_TYPE } from "../config/sui";

/**
 * Ortak helper: getObject sonucundan fields çek.
 */
function extractFields(res: SuiObjectResponse): any {
  if (res.error) {
    // error.message yok; komple stringify edelim
    throw new Error("getObject error: " + JSON.stringify(res.error));
  }

  const content = (res.data as any)?.content;
  if (!content || content.dataType !== "moveObject") {
    throw new Error("Unexpected object content");
  }

  return content.fields;
}

/* -------------------------------------------------------------------------- */
/*                                READ FONKS.                                 */
/* -------------------------------------------------------------------------- */

/**
 * Tek bütçeyi oku
 */
export async function getBudget(budgetId: string) {
  const res = await suiClient.getObject({
    id: budgetId,
    options: { showContent: true },
  });

  const fields = extractFields(res);

  return {
    id: budgetId,
    name: fields.name as string,
    total: Number(fields.total),
    spent: Number(fields.spent),
  };
}

/**
 * Tek proposal oku
 */
export async function getProposal(proposalId: string) {
  const res = await suiClient.getObject({
    id: proposalId,
    options: { showContent: true },
  });

  const fields = extractFields(res);

  return {
    id: proposalId,
    title: fields.title as string,
    description: fields.description as string,
    amount: Number(fields.amount),
    yesVotes: Number(fields.yes_votes),
    noVotes: Number(fields.no_votes),
    totalVoters: Number(fields.total_voters),
    votesCast: Number(fields.votes_cast),
    statusRaw: fields.status, // enum'u UI'da decode edersin
    receiver: fields.receiver as string,
    participants: fields.participants as string[],
  };
}

/**
 * SpendingEvent loglarını getir
 */
export async function getSpendingEvents() {
  const res = await suiClient.queryEvents({
    query: { MoveEventType: SPENDING_EVENT_TYPE },
    limit: 50,
    order: "descending",
  });

  return res.data.map((e) => ({
    txDigest: e.id.txDigest,
    timestampMs: Number(e.timestampMs ?? 0),
    budgetId: (e.parsedJson as any).budget_id as string,
    proposalId: (e.parsedJson as any).proposal_id as string,
    amount: Number((e.parsedJson as any).amount),
    receiver: (e.parsedJson as any).receiver as string,
  }));
}

/* -------------------------------------------------------------------------- */
/*                              WRITE / ON-CHAIN                              */
/* -------------------------------------------------------------------------- */

/**
 * Bütçeyi on-chain oluştur.
 * server.ts → POST /budgets burayı çağırıyor.
 */
export async function createBudgetOnChain(name: string, total: number) {
  const signer = getSponsorKeypair();
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_budget`,
    arguments: [
      tx.pure.string(name),
      tx.pure.u64(String(total)),
    ],
  });

  tx.setGasBudget(50_000_000);

  const result = await suiClient.signAndExecuteTransactionBlock({
    signer,
    transactionBlock: tx,
    options: { showEffects: true, showObjectChanges: true },
  });

  const created = (result.objectChanges || []).filter(
    (c: any) =>
      c.type === "created" &&
      c.objectType?.includes("governance::CommunityBudget"),
  ) as any[];

  const budgetId = created[0]?.objectId;

  return {
    txDigest: result.digest,
    budgetId,
    effects: result.effects,
  };
}

type CreateProposalArgs = {
  title: string;
  description: string;
  amount: number;
  receiver: string;
  participants: string[];
};

/**
 * Proposal'ı on-chain oluştur.
 * server.ts → POST /proposals burayı çağırıyor.
 */
export async function createProposalOnChain(args: CreateProposalArgs) {
  const { title, description, amount, receiver, participants } = args;

  const signer = getSponsorKeypair();
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_proposal`,
    arguments: [
      tx.pure.string(title),
      tx.pure.string(description),
      tx.pure.u64(String(amount)),
      tx.pure.address(receiver),
      tx.pure(participants), // vector<address>
    ],
  });

  tx.setGasBudget(50_000_000);

  const result = await suiClient.signAndExecuteTransactionBlock({
    signer,
    transactionBlock: tx,
    options: { showEffects: true, showObjectChanges: true },
  });

  const created = (result.objectChanges || []).filter(
    (c: any) =>
      c.type === "created" &&
      c.objectType?.includes("governance::Proposal"),
  ) as any[];

  const proposalId = created[0]?.objectId;

  return {
    txDigest: result.digest,
    proposalId,
    effects: result.effects,
  };
}

type VoteArgs = {
  budgetId: string;
  proposalId: string;
  choice: boolean;
};

/**
 * Proposal'a oy ver (yes/no).
 * server.ts → POST /proposals/:proposalId/vote burayı çağırıyor.
 */
export async function voteOnProposalOnChain(args: VoteArgs) {
  const { budgetId, proposalId, choice } = args;

  const signer = getSponsorKeypair();
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::vote`,
    arguments: [
      tx.object(budgetId),
      tx.object(proposalId),
      tx.pure(choice),
    ],
  });

  tx.setGasBudget(50_000_000);

  const result = await suiClient.signAndExecuteTransactionBlock({
    signer,
    transactionBlock: tx,
    options: { showEffects: true, showEvents: true },
  });

  return {
    txDigest: result.digest,
    effects: result.effects,
    events: result.events,
  };
}

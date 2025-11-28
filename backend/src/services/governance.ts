// src/services/governance.ts
import { suiClient } from "../lib/suiClient";
import { SPENDING_EVENT_TYPE } from "../config/sui";
import type { SuiObjectResponse } from "@mysten/sui.js/client";

/**
 * Ortak: getObject sonucundan fields çek.
 */
function extractFields(res: SuiObjectResponse): any {
  if (res.error) {
    // error.message yok, o yüzden komple stringify edelim
    throw new Error("getObject error: " + JSON.stringify(res.error));
  }

  const content = res.data?.content as any;
  if (!content || content.dataType !== "moveObject") {
    throw new Error("Unexpected object content");
  }

  return content.fields;
}

/**
 * Budget oku
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
 * Proposal oku
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

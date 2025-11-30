// backend/src/services/governance.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { PACKAGE_ID } from "../config/sui";
import { sponsorAndExecuteWithEnoki } from "../lib/enokiSponsor";
import { suiClient } from "../lib/suiClient";
import { executeWithAdminKey } from "../lib/directExecute";


// Helper: String'i vector<u8>'e çevir
function stringToBytes(str: string): number[] {
  return Array.from(new TextEncoder().encode(str));
}

// ----------------------------------------------------
// 1) CREATE BUDGET (Enoki sponsored)
// Requires AdminCap and real SUI coin
// amount: Amount to deposit in MIST (1 SUI = 1_000_000_000 MIST)
// ----------------------------------------------------
export async function createBudgetOnChain(
  adminCapId: string,
  name: string,
  coinObjectId: string,
  amount: number
) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_budget`,
    arguments: [
      tx.object(adminCapId),
      tx.pure(stringToBytes(name)),
      tx.object(coinObjectId),
      tx.pure. u64(BigInt(amount)),
    ],
  });

  // Enoki yerine direkt execute:
  const res = await executeWithAdminKey(tx);

  const created = (res. objectChanges ??  []).find(
    (c: any) =>
      c.type === "created" &&
      typeof c.objectType === "string" &&
      c.objectType. includes("governance::CommunityBudget"),
  ) as any | undefined;

  if (! created) {
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
  budgetId: string;  // 👈 Yeni parametre
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
      tx.object(input. budgetId),                  // 👈 Budget referansı
      tx. pure(stringToBytes(input. title)),
      tx.pure(stringToBytes(input.description)),
      tx. pure. u64(BigInt(input.amount)),
      tx. pure. address(input.receiver),
      tx. pure(input.participants),
    ],
  });

  const res = await sponsorAndExecuteWithEnoki(tx, {
    allowedMoveCallTargets: [`${PACKAGE_ID}::governance::create_proposal`],
  });

  const created = (res. objectChanges ??  []).find(
    (c: any) =>
      c.type === "created" &&
      typeof c.objectType === "string" &&
      c.objectType. includes("governance::Proposal"),
  ) as any | undefined;

  if (! created) {
    throw new Error("create_proposal: Proposal object not found");
  }

  return {
    txDigest: res.digest,
    proposalId: created. objectId,
    budgetId: input.budgetId,
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

  const data = (obj.data?. content as any)?.fields ??  {};

  return {
    id: proposalId,
    budgetId: data. budget_id ??  "",  // 👈 Yeni
    title: data.title ?? "",
    description: data.description ??  "",
    amount: Number(data.amount ??  0),
    yesVotes: Number(data.yes_votes ?? data.yesVotes ?? 0),
    noVotes: Number(data.no_votes ?? data.noVotes ?? 0),
    totalVoters: Number(data.total_voters ??  data.totalVoters ?? 0),
    votesCast: Number(data.votes_cast ??  data.votesCast ?? 0),
    statusRaw: data.status ??  data.status_raw ?? data.statusRaw,
    receiver: data.receiver ??  "",
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

// ...  mevcut kod ...

// ----------------------------------------------------
// 7) GET ALL PROPOSALS (using ProposalCreatedEvent)
// ----------------------------------------------------
export async function getAllProposals() {
  try {
    // Query ProposalCreatedEvent to get all proposal IDs
    const createdEvents = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::governance::ProposalCreatedEvent`,
      },
      limit: 100,
    });

    const proposalIds = new Set<string>();
    
    // ProposalCreatedEvent'lerden proposal ID'leri al
    createdEvents.data.forEach((e: any) => {
      const parsed = (e. parsedJson ??  {}) as any;
      if (parsed.proposal_id) {
        proposalIds.add(parsed.proposal_id);
      }
    });

    // Eğer ProposalCreatedEvent yoksa, SpendingEvent'lere de bak (eski proposal'lar için)
    if (proposalIds.size === 0) {
      const spendingEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::governance::SpendingEvent`,
        },
        limit: 100,
      });

      spendingEvents.data.forEach((e: any) => {
        const parsed = (e.parsedJson ?? {}) as any;
        if (parsed.proposal_id) {
          proposalIds. add(parsed.proposal_id);
        }
      });
    }

    // Tüm proposal detaylarını getir
    const proposals = await Promise.all(
      Array.from(proposalIds).map((id) => getProposal(id). catch(() => null))
    );

    return proposals.filter((p): p is NonNullable<typeof p> => p !== null);
  } catch (error) {
    console.error("getAllProposals error:", error);
    return [];
  }
}

// ----------------------------------------------------
// 8) GET PROPOSALS BY USER (participant)
// ----------------------------------------------------
export async function getProposalsByUser(userAddress: string) {
  try {
    // Önce ProposalCreatedEvent'lerden kullanıcının participant olduğu proposal'ları bul
    const createdEvents = await suiClient. queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::governance::ProposalCreatedEvent`,
      },
      limit: 100,
    });

    const userProposalIds = new Set<string>();

    createdEvents.data.forEach((e: any) => {
      const parsed = (e.parsedJson ?? {}) as any;
      const participants = parsed.participants || [];
      
      // Kullanıcı participant listesinde mi?
      const isParticipant = participants.some(
        (p: string) => p. toLowerCase() === userAddress.toLowerCase()
      );
      
      if (isParticipant && parsed.proposal_id) {
        userProposalIds.add(parsed.proposal_id);
      }
    });

    // Proposal detaylarını getir
    const proposals = await Promise.all(
      Array.from(userProposalIds).map((id) => getProposal(id).catch(() => null))
    );

    return proposals.filter((p): p is NonNullable<typeof p> => p !== null);
  } catch (error) {
    console.error("getProposalsByUser error:", error);
    return [];
  }
}

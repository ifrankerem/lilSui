// src/scripts/showProposal.ts
import { getProposal } from "../services/governance";

function prettyStatus(statusRaw: any): string {
  // status enum'u Move tarafında ProposalStatus::Voting/Executed/Rejected
  // Sui JSON'da genelde { type, fields } gibi gelir, o yüzden sadece string fallback yapıyoruz
  const asString = JSON.stringify(statusRaw);
  if (asString.includes("Voting")) return "Voting";
  if (asString.includes("Executed")) return "Executed";
  if (asString.includes("Rejected")) return "Rejected";
  return asString;
}

async function main() {
  const proposalId = process.argv[2];

  if (!proposalId) {
    console.error("Usage: npx ts-node src/scripts/showProposal.ts <PROPOSAL_ID>");
    process.exit(1);
  }

  const p = await getProposal(proposalId);

  console.log("Proposal:");
  console.log({
    id: p.id,
    title: p.title,
    description: p.description,
    amount: p.amount,
    yesVotes: p.yesVotes,
    noVotes: p.noVotes,
    totalVoters: p.totalVoters,
    votesCast: p.votesCast,
    status: prettyStatus(p.statusRaw),
    receiver: p.receiver,
    participants: p.participants,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

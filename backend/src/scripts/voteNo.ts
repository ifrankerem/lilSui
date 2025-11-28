// src/scripts/voteYes.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { PACKAGE_ID } from "../config/sui";
import { getClient } from "../lib/suiClient";   // 👈 BURAYI DEĞİŞTİRDİK
import { getSponsorKeypair } from "../lib/keypair";

async function main() {
  const [budgetId, proposalId] = process.argv.slice(2);
  if (!budgetId || !proposalId) {
    throw new Error("Usage: ts-node src/scripts/voteYes.ts <BUDGET_ID> <PROPOSAL_ID>");
  }

  const client = getClient();
  const signer = getSponsorKeypair();

  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::vote`,
    arguments: [
      tx.object(budgetId),
      tx.object(proposalId),
      tx.pure(false), // EVET oyu
    ],
  });

  const res = await client.signAndExecuteTransactionBlock({
    transactionBlock: tx,
    signer,
    options: { showEffects: false, showEvents: false },
  });

  console.log(JSON.stringify(res, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

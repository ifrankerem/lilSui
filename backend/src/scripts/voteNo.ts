// src/scripts/voteYes.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { suiClient } from "../lib/suiClient";
import { PACKAGE_ID } from "../config/sui";
import { getSponsorKeypair } from "../lib/keypair";

// Buraya terminalden argümanla da alabilirsin istersen:
const BUDGET_ID = "0x981de08c486441373363811629f73278c5e3f859f40eed7a541416667fb68952";
const PROPOSAL_ID = "0xc22ab84a8f0d7d961f8e3b5eef37fdb752477bb905532f8c9d6bdb647aca9849";

async function main() {
  const keypair = getSponsorKeypair();

  const tx = new TransactionBlock();

  tx.moveCall({
	target: `${PACKAGE_ID}::governance::vote`,
	arguments: [
	  tx.object(BUDGET_ID),
	  tx.object(PROPOSAL_ID),
	  tx.pure.bool(false), // Evet
	],
  });

  tx.setGasBudget(50_000_000);

  const result = await suiClient.signAndExecuteTransactionBlock({
	signer: keypair,
	transactionBlock: tx,
	options: { showEffects: false },
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

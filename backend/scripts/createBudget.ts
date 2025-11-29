// src/scripts/createBudget.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { suiClient } from "../src/lib/suiClient";
import { PACKAGE_ID } from "../src/config/sui";
import { getSponsorKeypair } from "../src/lib/keypair";

async function main() {
  const keypair = getSponsorKeypair();

  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_budget`,
    arguments: [
      tx.pure.string("Beta Budget"), // name_bytes: vector<u8>
      tx.pure.u64("1000"),          // total
    ],
  });

  tx.setGasBudget(50_000_000);

  const result = await suiClient.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
    options: { showEffects: true, showObjectChanges: true },
  });

  console.log(JSON.stringify(result, null, 2));

  const created = result.objectChanges?.filter(
    (c) =>
      c.type === "created" &&
      (c as any).objectType?.includes("governance::CommunityBudget"),
  ) as any[];

  if (created && created.length > 0) {
    console.log("New budget id:", created[0].objectId);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// src/scripts/createProposal.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { suiClient } from "../lib/suiClient";
import { PACKAGE_ID } from "../config/sui";
import { getSponsorKeypair } from "../lib/keypair";

const RECEIVER =
  "0xb8e7f780d0f45cfa8516c0d59ba281cf64c58b05508047d93c5acf1b9ce2a7bb";

async function main() {
  const keypair = getSponsorKeypair();

  const participants = [
    RECEIVER,
    RECEIVER,
    RECEIVER,
  ];

  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::governance::create_proposal`,
    arguments: [
      tx.pure.string("New Chairs"),
      tx.pure.string("Buy comfy chairs"),
      tx.pure.u64("300"),
      tx.pure.address(RECEIVER),
      tx.pure(participants), // vector<address>
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
      (c as any).objectType?.includes("governance::Proposal"),
  ) as any[];

  if (created && created.length > 0) {
    console.log("New proposal id:", created[0].objectId);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

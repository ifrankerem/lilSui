// backend/src/lib/directExecute.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { suiClient } from "./suiClient";
import { getSponsorKeypair } from "./keypair";

/**
 * Enoki olmadan direkt admin keypair ile execute
 */
export async function executeWithAdminKey(tx: TransactionBlock) {
  const adminKeypair = getSponsorKeypair();
  
  tx.setSender(adminKeypair.getPublicKey().toSuiAddress());
  
  const result = await suiClient.signAndExecuteTransactionBlock({
    transactionBlock: tx,
    signer: adminKeypair,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  return result;
}
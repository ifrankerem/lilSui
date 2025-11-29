// backend/src/lib/enokiSponsor.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { toB64, fromB64 } from "@mysten/bcs";
import {
  enokiClient,
  ENOKI_CLIENT_NETWORK,
  suiClient,
  adminKeypair,
} from "./enokiClient";

/**
 * Enoki ile sponsor + execute yapan helper.
 * Sonunda Sui RPC'den tx detayını döndürür (effects + objectChanges ile).
 */
export async function sponsorAndExecuteWithEnoki(
  tx: TransactionBlock,
  opts?: {
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
  },
) {
  // 1) Transaction kind bytes hazırla
  const txBytes = await tx.build({
    client: suiClient,
    onlyTransactionKind: true,
  });

  // 2) Enoki'den sponsor iste
  const sponsored = await enokiClient.createSponsoredTransaction({
    network: ENOKI_CLIENT_NETWORK,
    transactionKindBytes: toB64(txBytes),
    sender: adminKeypair.getPublicKey().toSuiAddress(),
    ...(opts?.allowedMoveCallTargets && {
      allowedMoveCallTargets: opts.allowedMoveCallTargets,
    }),
    ...(opts?.allowedAddresses && {
      allowedAddresses: opts.allowedAddresses,
    }),
  });

  // 3) Admin key ile imzala
  const { signature } = await adminKeypair.signTransactionBlock(
    fromB64(sponsored.bytes),
  );

  // 4) Sponsorlu tx'i execute et
  await enokiClient.executeSponsoredTransaction({
    digest: sponsored.digest,
    signature,
  });

  // 5) Sui RPC'den tx sonucunu getir (retry ile)
  const maxRetries = 5;
  const delayMs = 1000;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const txRes = await suiClient.getTransactionBlock({
        digest: sponsored.digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return txRes;
    } catch (err: any) {
      lastError = err;

      const msg = String(err?.message ?? "");
      const isNotFound =
        msg.includes("Could not find the referenced transaction");

      // Sadece "bulunamadı" hatasında retry yap
      if (isNotFound && attempt < maxRetries - 1) {
        console.warn(
          `[enokiSponsor] Tx not found yet, retrying (${attempt + 1}/${maxRetries})…`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      // Başka bir hata ise direkt fırlat
      throw err;
    }
  }

  throw lastError ?? new Error("Failed to fetch transaction result from Sui");
}

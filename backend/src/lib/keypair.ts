// src/lib/keypair.ts
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";
import "dotenv/config";

export function getSponsorKeypair(): Ed25519Keypair {
  const keyB64 = process.env.SPONSOR_KEY;
  if (!keyB64) {
    throw new Error("SPONSOR_KEY is not set in .env");
  }

  // Sui keystore formatı: [scheme_flag (1 byte)] + [secret_key (32 byte)]
  const full = fromB64(keyB64);

  if (full.length !== 33) {
    throw new Error(`Unexpected key length: ${full.length}, expected 33 bytes from keystore`);
  }

  const secretKey = full.slice(1); // ilk byte (scheme) at, geriye 32 byte secret key kalıyor

  return Ed25519Keypair.fromSecretKey(secretKey);
}

// src/lib/keypair.ts
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";

function parseSecretKey(raw: string): Uint8Array {
  const secret = raw.trim();

  // 1) suiprivkey1.... (CLI export formatı)
  if (secret.startsWith("suiprivkey")) {
    const decoded = decodeSuiPrivateKey(secret);
    return decoded.secretKey;
  }

  // 2) 0x.... hex
  if (secret.startsWith("0x")) {
    const hex = secret.slice(2);
    if (hex.length !== 64) {
      throw new Error(
        `Hex secret must be 32 bytes (64 hex chars), got ${hex.length}`,
      );
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }

  // 3) base64 fallback
  return fromB64(secret);
}

export function getSponsorKeypair(): Ed25519Keypair {
  const envKey = process.env.SPONSOR_KEY;

  if (!envKey) {
    console.error("[keypair] SPONSOR_KEY is not set in .env");
    console.error(
      "[keypair] Available env keys:",
      Object.keys(process.env).filter((k) => k.includes("SPONSOR")),
    );
    throw new Error("SPONSOR_KEY is not set in .env");
  }

  const secretBytes = parseSecretKey(envKey);
  return Ed25519Keypair.fromSecretKey(secretBytes);
}

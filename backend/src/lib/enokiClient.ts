// backend/src/lib/enokiClient.ts
import "dotenv/config";
import { EnokiClient } from "@mysten/enoki";
import { suiClient } from "./suiClient";
import { getSponsorKeypair } from "./keypair";

export const ENOKI_CLIENT_NETWORK =
  (process.env.ENOKI_CLIENT_NETWORK as "testnet" | "devnet" | "mainnet") ||
  "testnet";

if (!process.env.ENOKI_SECRET_KEY) {
  throw new Error("ENOKI_SECRET_KEY is not set in .env");
}

export const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_SECRET_KEY!,
});

// Mevcut SPONSOR_KEY'ini admin signer olarak kullanıyoruz
export const adminKeypair = getSponsorKeypair();

// Başka yerlerde de lazım olabileceği için tekrar export
export { suiClient } from "./suiClient";

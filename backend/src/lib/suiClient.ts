// src/lib/suiClient.ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import "dotenv/config";

const RPC_URL = process.env.SUI_RPC_URL || getFullnodeUrl("testnet");

const client = new SuiClient({
  // İstersen burayı "mainnet" / custom URL yapabilirsin
  url: getFullnodeUrl("testnet"),
});

/**
 * Convenience helper – çoğu yerde bunu kullanıyoruz.
 */
export function getClient(): SuiClient {
  return client;
}
export const suiClient = new SuiClient({ url: RPC_URL });

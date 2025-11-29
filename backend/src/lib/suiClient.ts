// src/lib/suiClient.ts
import "dotenv/config";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

const RPC_URL = process.env.SUI_RPC_URL || getFullnodeUrl("testnet");

export const suiClient = new SuiClient({
  url: RPC_URL,
});

export function getClient(): SuiClient {
  return suiClient;
}

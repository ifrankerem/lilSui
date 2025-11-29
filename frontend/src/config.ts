// src/config.ts
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const SUI_NETWORK = "testnet" as const;

export const ADMIN_ADDRESS = "0x6b34f727c0faba6ab8e45fe344432fd14f3a31c4ee968a354c1940233d02daf6";

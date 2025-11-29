// src/lib/adminCheck.ts
import { ADMIN_ADDRESS } from "../config";

export function isAdmin(userAddress: string | undefined): boolean {
  if (!userAddress) return false;
  return userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

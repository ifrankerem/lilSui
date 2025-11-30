// src/config/sui.ts
import "dotenv/config";

export const PACKAGE_ID = process.env.PACKAGE_ID!;

export const ADMIN_CAP_ID = "0xadb4eebc2b9c65248773a2904a6b1637d2cc01c47a9c17c66a4d1f7ddc8a4a87";

export const BUDGET_TYPE =
  `${PACKAGE_ID}::governance::CommunityBudget`;

export const PROPOSAL_TYPE =
  `${PACKAGE_ID}::governance::Proposal`;

export const SPENDING_EVENT_TYPE =
  `${PACKAGE_ID}::governance::SpendingEvent`;

export const ADMIN_CAP_TYPE =
  `${PACKAGE_ID}::governance::AdminCap`;

// src/config/sui.ts
import "dotenv/config";

export const PACKAGE_ID = process.env.PACKAGE_ID!;

export const ADMIN_ADDRESS = "0x6b34f727c0faba6ab8e45fe344432fd14f3a31c4ee968a354c1940233d02daf6";

export const BUDGET_TYPE =
  `${PACKAGE_ID}::governance::CommunityBudget`;

export const PROPOSAL_TYPE =
  `${PACKAGE_ID}::governance::Proposal`;

export const SPENDING_EVENT_TYPE =
  `${PACKAGE_ID}::governance::SpendingEvent`;

export const ADMIN_CAP_TYPE =
  `${PACKAGE_ID}::governance::AdminCap`;

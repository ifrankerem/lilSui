// src/config/sui.ts
import "dotenv/config";

export const PACKAGE_ID = process.env.PACKAGE_ID!;

export const BUDGET_TYPE =
  `${PACKAGE_ID}::governance::CommunityBudget`;

export const PROPOSAL_TYPE =
  `${PACKAGE_ID}::governance::Proposal`;

export const SPENDING_EVENT_TYPE =
  `${PACKAGE_ID}::governance::SpendingEvent`;

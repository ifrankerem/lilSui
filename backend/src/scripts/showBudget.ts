// src/scripts/showBudget.ts
import { getBudget } from "../services/governance";

async function main() {
  const budgetId = process.argv[2];

  if (!budgetId) {
    console.error("Usage: npx ts-node src/scripts/showBudget.ts <BUDGET_ID>");
    process.exit(1);
  }

  const budget = await getBudget(budgetId);
  console.log("CommunityBudget:");
  console.log(budget);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

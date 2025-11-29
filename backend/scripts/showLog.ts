// src/scripts/showLog.ts
import { getSpendingEvents } from "../services/governance";

async function main() {
  const events = await getSpendingEvents();
  console.table(
    events.map((e) => ({
      tx: e.txDigest,
      proposal: e.proposalId,
      amount: e.amount,
      receiver: e.receiver,
      time: new Date(e.timestampMs).toISOString(),
    })),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

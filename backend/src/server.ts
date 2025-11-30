// src/server.ts
import "dotenv/config";   // Put this at the top

import express from "express";
import cors from "cors";
import {
  createBudgetOnChain,
  createProposalOnChain,
  voteOnProposalOnChain,
  getBudget,
  getProposal,
  getSpendingEvents,
  getAllProposals,
  getProposalsByUser,
} from "./services/governance";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Healthcheck
 */
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Community Budget API is running" });
});

/**
 * Create new budget (requires AdminCap and SUI coin)
 * POST /budgets
 * body: { adminCapId: string, name: string, coinObjectId: string, amount: number }
 */
app.post("/budgets", async (req, res) => {
  try {
    const { adminCapId, name, coinObjectId, amount } = req.body;
    if (!adminCapId || !name || !coinObjectId || amount == null) {
      return res.status(400).json({ error: "adminCapId, name, coinObjectId, and amount are required" });
    }

    const result = await createBudgetOnChain(adminCapId, name, coinObjectId, Number(amount));
    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Read single budget
 * GET /budgets/:id
 */
app.get("/budgets/:id", async (req, res) => {
  try {
    const budget = await getBudget(req.params.id);
    res.json(budget);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Create new proposal
 * POST /proposals
 * body: {
 *   title: string;
 *   description: string;
 *   amount: number;
 *   receiver: string;
 *   participants: string[];
 * }
 */
app.post("/proposals", async (req, res) => {
  try {
    const { title, description, amount, receiver, participants } = req.body;

    if (!title || !description || amount == null || !receiver) {
      return res
        .status(400)
        .json({ error: "title, description, amount, receiver required" });
    }

    const participantsArr = Array.isArray(participants)
      ? participants
      : [];

    const result = await createProposalOnChain({
      title,
      description,
      amount: Number(amount),
      receiver,
      participants: participantsArr,
    });

    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Get all proposals
 * GET /proposals
 */
app.get("/proposals", async (_req, res) => {
  try {
    const proposals = await getAllProposals();
    res.json(proposals);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Get proposals for a specific user (participant)
 * GET /proposals/user/:address
 */
app.get("/proposals/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const proposals = await getProposalsByUser(address);
    res.json(proposals);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Read single proposal
 * GET /proposals/:id
 */
app.get("/proposals/:id", async (req, res) => {
  try {
    const proposal = await getProposal(req.params.id);
    res.json(proposal);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Vote on proposal
 * POST /proposals/:proposalId/vote
 * body: { budgetId: string, choice: boolean }
 */
app.post("/proposals/:proposalId/vote", async (req, res) => {
  try {
    const { budgetId, choice } = req.body;
    const { proposalId } = req.params;

    if (!budgetId || choice == null) {
      return res
        .status(400)
        .json({ error: "budgetId and choice are required" });
    }

    const result = await voteOnProposalOnChain({
      budgetId,
      proposalId,
      choice: Boolean(choice),
    });

    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Get spending logs
 * GET /logs
 */
app.get("/logs", async (_req, res) => {
  try {
    const logs = await getSpendingEvents();
    res.json(logs);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

app.listen(PORT, () => {
  console.log(`Community Budget API listening on http://localhost:${PORT}`);
});

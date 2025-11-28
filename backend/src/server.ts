// src/server.ts
import express from "express";
import cors from "cors";
import {
  createBudgetOnChain,
  createProposalOnChain,
  voteOnProposalOnChain,
  getBudget,
  getProposal,
  getSpendingEvents,
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
 * Yeni bütçe oluştur
 * POST /budgets
 * body: { name: string, total: number }
 */
app.post("/budgets", async (req, res) => {
  try {
    const { name, total } = req.body;
    if (!name || total == null) {
      return res.status(400).json({ error: "name and total are required" });
    }

    const result = await createBudgetOnChain(name, Number(total));
    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message ?? "unknown error" });
  }
});

/**
 * Tek bütçeyi oku
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
 * Yeni proposal oluştur
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
 * Tek proposal oku
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
 * Oy ver
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
 * Harcama loglarını getir
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

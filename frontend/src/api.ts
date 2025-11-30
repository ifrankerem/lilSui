// src/api.ts
import axios from "axios";
import { BACKEND_URL } from "./config";

const api = axios.create({
  baseURL: BACKEND_URL,
});

// ---------- Types ----------

export type BudgetDto = {
  id: string;
  name: string;
  total: number;
  spent: number;
};

export type ProposalDto = {
  id: string;
  budgetId: string;  // 👈 Yeni
  title: string;
  description: string;
  amount: number;
  receiver: string;
  participants: string[];
  yesVotes: number;
  noVotes: number;
  votesCast: number;
  totalVoters: number;
  statusRaw: unknown;
};

export type LogEntry = {
  txDigest: string;
  timestampMs: number;
  budgetId: string;
  proposalId: string;
  amount: number;
  receiver: string;
};

// ---------- Endpoint wrappers ----------

export async function apiHealth() {
  const res = await api.get("/");
  return res.data;
}

export async function apiCreateBudget(adminCapId: string, name: string, coinObjectId: string, amount: number) {
  const res = await api.post("/budgets", { adminCapId, name, coinObjectId, amount });
  return res.data as {
    txDigest: string;
    budgetId: string;
    effects: unknown;
  };
}

export async function apiGetBudget(id: string): Promise<BudgetDto> {
  const res = await api.get(`/budgets/${id}`);
  return res.data as BudgetDto;
}

// 👈 budgetId parametresi eklendi
export async function apiCreateProposal(params: {
  budgetId: string;
  title: string;
  description: string;
  amount: number;
  receiver: string;
  participants: string[];
}) {
  const res = await api.post("/proposals", params);
  return res.data as {
    txDigest: string;
    proposalId: string;
    budgetId: string;
  };
}

export async function apiGetProposal(id: string): Promise<ProposalDto> {
  const res = await api. get(`/proposals/${id}`);
  return res.data as ProposalDto;
}

export async function apiGetAllProposals(): Promise<ProposalDto[]> {
  const res = await api. get("/proposals");
  return res.data as ProposalDto[];
}

export async function apiGetUserProposals(userAddress: string): Promise<ProposalDto[]> {
  const res = await api.get(`/proposals/user/${userAddress}`);
  return res.data as ProposalDto[];
}

export async function apiVoteOnProposal(
  proposalId: string,
  budgetId: string,
  choice: boolean,
) {
  const res = await api.post(`/proposals/${proposalId}/vote`, {
    budgetId,
    choice,
  });
  return res.data;
}

export async function apiGetLogs(): Promise<LogEntry[]> {
  const res = await api.get("/logs");
  return res.data as LogEntry[];
}
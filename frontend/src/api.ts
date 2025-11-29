// src/api.ts
import axios from "axios";
import { BACKEND_URL } from "./config";

const api = axios.create({
  baseURL: BACKEND_URL,
});

export async function apiHealth() {
  const res = await api.get("/");
  return res.data;
}

export async function apiCreateBudget(name: string, total: number) {
  const res = await api.post("/budgets", { name, total });
  return res.data as {
    txDigest: string;
    budgetId: string;
    effects: unknown;
  };
}

export async function apiGetBudget(id: string) {
  const res = await api.get(`/budgets/${id}`);
  return res.data as {
    id: string;
    name: string;
    total: number;
    spent: number;
  };
}

export async function apiCreateProposal(params: {
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
  };
}

export async function apiGetProposal(id: string) {
  const res = await api.get(`/proposals/${id}`);
  return res.data;
}

export async function apiVote(proposalId: string, body: {
  budgetId: string;
  choice: boolean;
}) {
  const res = await api.post(`/proposals/${proposalId}/vote`, body);
  return res.data;
}

export async function apiGetLogs() {
  const res = await api.get("/logs");
  return res.data as Array<{
    txDigest: string;
    timestampMs: number;
    budgetId: string;
    proposalId: string;
    amount: number;
    receiver: string;
  }>;
}

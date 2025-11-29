// src/lib/api.ts

// Backend URL – dev'de localhost, istersen process / global üzerinden override edebilirsin.
const API_URL =
  // Node / build-time env
  (typeof process !== "undefined" &&
    (process.env as any)?.VITE_BACKEND_URL) ||
  // Runtime global değişken vs. tanımlarsan
  ((globalThis as any).__VITE_BACKEND_URL as string | undefined) ||
  // fallback
  "http://localhost:3000";

// ---- Tipler ----

export type CreateBudgetResponse = {
  txDigest: string;
  budgetId: string;
  effects?: unknown;
};

export type CreateProposalResponse = {
  txDigest: string;
  proposalId: string;
  effects?: unknown;
};

export type VoteResponse = {
  txDigest: string;
  effects?: unknown;
};

export type LogEntry = {
  txDigest: string;
  timestampMs: number;
  budgetId: string;
  proposalId: string;
  amount: number;
  receiver: string;
};

export type BudgetDto = {
  id: string;
  name: string;
  total: number;
  spent: number;
};

export type ProposalDto = {
  id: string;
  title: string;
  description: string;
  amount: number;
  yesVotes: number;
  noVotes: number;
  totalVoters: number;
  votesCast: number;
  statusRaw: any;
  receiver: string;
  participants: string[];
};

// ---- Generic request helper ----

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg += ` - ${body.error}`;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// ---- Public API wrapper fonksiyonları ----

// POST /budgets
export function apiCreateBudget(name: string, total: number) {
  return request<CreateBudgetResponse>("/budgets", {
    method: "POST",
    body: JSON.stringify({ name, total }),
  });
}

// GET /budgets/:id
export function apiGetBudget(id: string) {
  return request<BudgetDto>(`/budgets/${id}`);
}

// POST /proposals
export function apiCreateProposal(input: {
  title: string;
  description: string;
  amount: number;
  receiver: string;
  participants: string[];
}) {
  return request<CreateProposalResponse>("/proposals", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// GET /proposals/:id
export function apiGetProposal(id: string) {
  return request<ProposalDto>(`/proposals/${id}`);
}

// POST /proposals/:proposalId/vote
export function apiVoteOnProposal(
  proposalId: string,
  budgetId: string,
  choice: boolean,
) {
  return request<VoteResponse>(`/proposals/${proposalId}/vote`, {
    method: "POST",
    body: JSON.stringify({ budgetId, choice }),
  });
}

// GET /logs
export function apiGetLogs() {
  return request<LogEntry[]>("/logs");
}

// src/components/RequestsTable.tsx
import { Link } from "react-router-dom";
import type { ProposalDto } from "../api";
import { StatusBadge, parseStatus } from "./StatusBadge";

interface RequestsTableProps {
  proposals: ProposalDto[];
  isLoading?: boolean;
}

export function RequestsTable({ proposals, isLoading }: RequestsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Yükleniyor...</div>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
        <p className="text-slate-400">Henüz istek bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800/50 border-b border-slate-700">
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-slate-400">
              Tarih
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-slate-400">
              İsteyen Kişi
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-slate-400">
              Amaç
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-slate-400">
              Miktar
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase text-slate-400">
              Oylar
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase text-slate-400">
              Durum
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {proposals.map((proposal) => (
            <tr
              key={proposal.id}
              className="hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-slate-400">
                {/* API doesn't provide timestamp for proposals */}
                N/A
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-slate-300 font-mono">
                  {proposal.receiver.slice(0, 8)}…{proposal.receiver.slice(-4)}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/proposals/${proposal.id}`}
                  className="text-sm text-slate-100 hover:text-emerald-400 transition-colors"
                >
                  <span className="font-medium">{proposal.title}</span>
                  <span className="text-slate-400 ml-2">
                    {proposal.description}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-mono text-slate-100">
                  {proposal.amount} TL
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-emerald-400">✓{proposal.yesVotes}</span>
                  <span className="text-red-400">✗{proposal.noVotes}</span>
                  <span className="text-slate-500">
                    ({proposal.votesCast}/{proposal.totalVoters})
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={parseStatus(proposal.statusRaw)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

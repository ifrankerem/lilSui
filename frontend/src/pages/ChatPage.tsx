// frontend/src/pages/ChatPage.tsx
import { useEffect, useState } from "react";
import {
  apiGetLogs,
  type LogEntry,
} from "../../../backend/src/lib/api";

type ChatMessage = {
  id: string;
  author: string;
  text: string;
  timestamp: number;
};

function loadMessagesFor(proposalId: string): ChatMessage[] {
  if (!proposalId) return [];
  try {
    const raw = localStorage.getItem(`chat:${proposalId}`);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveMessagesFor(proposalId: string, msgs: ChatMessage[]) {
  if (!proposalId) return;
  localStorage.setItem(`chat:${proposalId}`, JSON.stringify(msgs));
}

export default function ChatPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alias, setAlias] = useState<string>("anon");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Logları (yani işlem geçmişini) yükle
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetLogs();
        setLogs(data);
        if (data.length > 0 && !selectedProposalId) {
          setSelectedProposalId(data[0].proposalId);
        }
      } catch (e: any) {
        setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Seçili proposal değişince localStorage'dan mesajları yükle
  useEffect(() => {
    if (!selectedProposalId) return;
    const msgs = loadMessagesFor(selectedProposalId);
    setMessages(msgs);
  }, [selectedProposalId]);

  const handleSend = () => {
    if (!selectedProposalId) {
      setError("Önce soldan bir proposal seç.");
      return;
    }
    if (!input.trim()) return;

    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author: alias || "anon",
      text: input.trim(),
      timestamp: Date.now(),
    };

    const next = [...messages, msg];
    setMessages(next);
    saveMessagesFor(selectedProposalId, next);
    setInput("");
  };

  const currentProposalLogs = logs.filter(
    (l) => l.proposalId === selectedProposalId,
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* SOL: Proposal listesi */}
      <aside className="w-80 border-r border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold mb-2">Proposals</h2>

        {loading && (
          <div className="text-xs text-slate-400 mb-2">Loading logs…</div>
        )}

        {error && (
          <div className="text-xs text-red-400 mb-2">{error}</div>
        )}

        {logs.length === 0 ? (
          <div className="text-sm text-slate-500">
            Henüz spending log yok. Dashboard’dan proposal yürüt.
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.txDigest}>
                <button
                  onClick={() => setSelectedProposalId(log.proposalId)}
                  className={`w-full text-left px-2 py-2 rounded border ${
                    log.proposalId === selectedProposalId
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-800/60 hover:bg-slate-700/60"
                  }`}
                >
                  <div className="font-mono text-xs">
                    {log.proposalId.slice(0, 10)}…
                  </div>
                  <div className="text-xs text-slate-400">
                    {log.amount} SUI • {log.receiver.slice(0, 8)}…
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(log.timestampMs).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* SAĞ: Chat alanı */}
      <main className="flex-1 flex flex-col p-4">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Proposal Chat</h2>
            {selectedProposalId ? (
              <div className="text-xs text-slate-400 font-mono">
                {selectedProposalId}
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Soldan bir proposal seç.
              </div>
            )}
          </div>

          {/* küçük özet: bu proposal’a ait harcama logları */}
          {currentProposalLogs.length > 0 && (
            <div className="text-xs text-slate-400 text-right">
              {currentProposalLogs.length} spending event • toplam{" "}
              {currentProposalLogs
                .reduce((sum, l) => sum + l.amount, 0)
                .toString()}{" "}
              SUI
            </div>
          )}
        </header>

        {/* Mesaj listesi */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="text-sm text-slate-500">
              Bu proposal için henüz mesaj yok. İlk yorumu sen yaz. 🙂
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="flex flex-col bg-slate-800/70 rounded px-3 py-2 text-sm"
              >
                <div className="flex justify-between mb-1 text-xs text-slate-400">
                  <span className="font-semibold">{m.author}</span>
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString()}{" "}
                    {new Date(m.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            ))
          )}
        </div>

        {/* Mesaj input alanı */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm w-40"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Takma ad (alias)"
            />
            <div className="text-xs text-slate-500 self-center">
              (Sadece chat için, on-chain değil)
            </div>
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[60px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bu proposal hakkında yorum yap, alternatif öneri yaz, eleştir..."
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold self-end h-[60px]"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

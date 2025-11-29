// src/pages/CreateRequestPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { apiCreateProposal, apiCreateBudget } from "../api";

export default function CreateRequestPage() {
  const navigate = useNavigate();

  // Budget creation state
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [budgetTotal, setBudgetTotal] = useState(1000);

  // Proposal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [participantsText, setParticipantsText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateBudget = async () => {
    if (!budgetName) {
      setError("Bütçe adı gerekli.");
      return;
    }
    if (budgetTotal <= 0) {
      setError("Bütçe miktarı 0'dan büyük olmalı.");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const res = await apiCreateBudget(budgetName, budgetTotal);
      setSuccess(`Bütçe oluşturuldu! ID: ${res.budgetId}`);
      setBudgetName("");
      setBudgetTotal(1000);
      setShowBudgetForm(false);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    // Validation
    if (!title) {
      setError("Başlık gerekli.");
      return;
    }
    if (!description) {
      setError("Açıklama gerekli.");
      return;
    }
    if (amount <= 0) {
      setError("Miktar 0'dan büyük olmalı.");
      return;
    }
    if (!receiver) {
      setError("Alıcı adresi gerekli.");
      return;
    }

    const participants = participantsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (participants.length === 0) {
      setError("En az bir katılımcı adresi gerekli.");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const res = await apiCreateProposal({
        title,
        description,
        amount,
        receiver,
        participants,
      });

      setSuccess(`İstek oluşturuldu! Proposal ID: ${res.proposalId}`);

      // Clear form
      setTitle("");
      setDescription("");
      setAmount(0);
      setReceiver("");
      setParticipantsText("");

      // Optionally navigate to requests page after success
      setTimeout(() => {
        navigate("/requests");
      }, 2000);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">İstek Oluştur</h1>
          <p className="text-slate-400 text-sm mt-1">
            Yeni bir bütçe talebi oluşturun.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 px-4 py-3 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-emerald-900/40 border border-emerald-500 px-4 py-3 rounded-lg text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Budget Creation Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            {showBudgetForm ? "← Proposal Formuna Dön" : "Yeni Bütçe Oluştur"}
          </button>
        </div>

        {/* Budget Creation Form */}
        {showBudgetForm && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Yeni Bütçe Oluştur
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bütçe Adı
              </label>
              <input
                type="text"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="Örn: Etkinlik Bütçesi"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Toplam Miktar (TL)
              </label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleCreateBudget}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Bütçe Oluştur"}
            </button>
          </div>
        )}

        {/* Proposal Form */}
        {!showBudgetForm && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Yeni İstek
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Başlık *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yeni Sandalyeler"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Açıklama *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="İstek hakkında detaylı açıklama..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Miktar (TL) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0"
                placeholder="Talep edilen miktar"
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Receiver */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alıcı Adresi *
              </label>
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Katılımcılar (Oy Verecekler) *
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Her satıra bir adres girin. Bu adresler isteği onaylayabilir
                veya reddedebilir.
              </p>
              <textarea
                value={participantsText}
                onChange={(e) => setParticipantsText(e.target.value)}
                placeholder="0x...\n0x...\n0x..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCreateProposal}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "İstek Oluştur"}
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

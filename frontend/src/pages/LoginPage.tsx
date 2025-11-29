// src/pages/LoginPage.tsx
import { WalletBar } from "../components/WalletBar";

export function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Community Budget dApp</h1>
      <p className="text-sm text-slate-300">
        Buradan cüzdan bağlayabilir veya ileride eklenecek{" "}
        <b>zkLogin (Google ile giriş)</b> ile oy verebilirsin.
      </p>

      {/* Cüzdan bağlama – Sui dApp Kit */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">1. Cüzdan Bağla</h2>
        <WalletBar />
      </div>

      {/* zkLogin placeholder */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">2. zkLogin (yakında)</h2>
        <button
          disabled
          className="bg-slate-700 text-white px-3 py-2 rounded w-full opacity-60 cursor-not-allowed"
        >
          Login with Google (zkLogin coming soon)
        </button>
        <p className="text-xs text-slate-400">
          Demo için şimdilik sadece cüzdan bağlantısı aktif. Sonraki adımda
          buraya gerçek zkLogin akışını bağlayacağız.
        </p>
      </div>
    </div>
  );
}

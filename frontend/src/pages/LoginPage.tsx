// src/pages/LoginPage.tsx
import { useEffect } from "react";
import {
  useCurrentAccount,
  ConnectButton,
  useConnectWallet,
  useWallets,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import {
  isEnokiWallet,
  type EnokiWallet,
  type AuthProvider,
} from "@mysten/enoki";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const account = useCurrentAccount();

  // Enoki için:
  const { mutate: connect } = useConnectWallet();
  const { currentWallet } = useCurrentWallet();
  const allWallets = useWallets();
  const enokiWallets = allWallets.filter(isEnokiWallet);

  // provider -> wallet map’i (google, facebook vs)
  const walletsByProvider = enokiWallets.reduce(
    (map, wallet) =>
      map.set((wallet as EnokiWallet).provider, wallet as EnokiWallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get("google");

  useEffect(() => {
    if (account) {
      // İstersen burada otomatik navigate("/dashboard") yapabilirsin.
    }
  }, [account]);

  const isEnokiConnected =
    !!currentWallet && isEnokiWallet((currentWallet as any).wallet ?? currentWallet);

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 px-6 py-8">
        {/* Sol sütun */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Campus Community Budget</h1>
          <p className="text-slate-300 text-sm">
            Kampüsteki kulüpler, öğrenci toplulukları ve sponsorlar için
            on-chain şeffaf bütçe yönetimi.
          </p>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm space-y-2">
            <p className="font-semibold">Flow:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Öğrenci Google hesabıyla zkLogin yapar (Enoki).</li>
              <li>Veya Sui cüzdanı ile bağlanır.</li>
              <li>Dashboard&apos;da proposal oluşturur ve oy verir.</li>
              <li>Tüm harcamalar on-chain log olarak görünür.</li>
            </ol>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-emerald-500/90 hover:bg-emerald-400 text-black font-semibold"
          >
            Go to Dashboard →
          </button>
        </div>

        {/* Sağ sütun */}
        <div className="space-y-4">
          {/* Normal wallet login */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase text-slate-300">
                Wallet Login
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Sui dApp Kit üzerinden cüzdanını bağla. Sponsor işlemler yine
              backend&apos;deki hesap üzerinden gidecek, ama senin adresin
              &quot;kimliğin&quot; olarak görünecek.
            </p>
            {/* Enoki wallet'ları modalden sakla */}
            <ConnectButton walletFilter={(wallet) => !isEnokiWallet(wallet)} />
            {account && (
              <div className="mt-2 text-xs text-slate-400">
                Connected as{" "}
                <span className="font-mono">
                  {account.address.slice(0, 10)}…
                </span>
              </div>
            )}
          </div>

          {/* Enoki zkLogin (Google) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase text-slate-300">
                zkLogin (Google, Enoki)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Enoki üzerinden Google ile giriş yap. zkLogin seni anonim bir
              Sui adresiyle temsil eder.
            </p>

            {!isEnokiConnected ? (
              googleWallet ? (
                <button
                  onClick={() =>
                    connect(
                      { wallet: googleWallet },
                      { onSuccess: () => console.log("Enoki Google connected") },
                    )
                  }
                  className="mt-2 w-full px-3 py-2 rounded bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 flex items-center justify-center gap-2"
                >
                  Continue with Google
                </button>
              ) : (
                <p className="text-xs text-red-400 mt-2">
                  Google Enoki wallet bulunamadı (RegisterEnokiWallets ve env
                  değerlerini kontrol et).
                </p>
              )
            ) : (
              <div className="mt-2 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Enoki zkLogin wallet</div>
                    {account && (
                      <div className="text-slate-400">
                        Address:{" "}
                        <span className="font-mono">
                          {account.address.slice(0, 12)}…
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="self-start px-3 py-1.5 rounded bg-emerald-500/90 hover:bg-emerald-400 text-black font-semibold text-xs"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

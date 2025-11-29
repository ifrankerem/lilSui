// src/pages/LoginPage.tsx
import { useEffect } from "react";
import {
  useCurrentAccount,
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

  // provider -> wallet map'i (google, facebook vs)
  const walletsByProvider = enokiWallets.reduce(
    (map, wallet) =>
      map.set((wallet as EnokiWallet).provider, wallet as EnokiWallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get("google");

  useEffect(() => {
    if (account) {
      navigate("/dashboard");
    }
  }, [account, navigate]);

  const isEnokiConnected =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!currentWallet && isEnokiWallet((currentWallet as any).wallet ?? currentWallet);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="w-full max-w-md px-6 py-12">
        {/* Logo / Club Name */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">
            Community Budget
          </h1>
          <p className="text-slate-400 text-lg">Hoş Geldiniz</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 space-y-6">
          <p className="text-center text-sm text-slate-400">
            Bütçe yönetim sistemine giriş yapmak için Google hesabınızı
            kullanın.
          </p>

          {/* Google Login Button */}
          {!isEnokiConnected ? (
            googleWallet ? (
              <button
                onClick={() =>
                  connect(
                    { wallet: googleWallet },
                    { onSuccess: () => console.log("Enoki Google connected") },
                  )
                }
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Login with Google
              </button>
            ) : (
              <p className="text-center text-sm text-red-400">
                Google Enoki wallet bulunamadı. Lütfen yapılandırmayı kontrol
                edin.
              </p>
            )
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                <p className="text-emerald-400 font-medium">Giriş Başarılı!</p>
                {account && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {account.address.slice(0, 12)}…{account.address.slice(-8)}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
              >
                Dashboard'a Git →
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Sui blockchain üzerinde şeffaf bütçe yönetimi
        </p>
      </div>
    </div>
  );
}

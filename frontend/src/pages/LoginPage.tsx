// src/pages/LoginPage.tsx
import { useEffect } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useConnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import {
  isEnokiWallet,
  type EnokiWallet,
  type AuthProvider,
} from "@mysten/enoki";
import { useNavigate } from "react-router-dom";
import { NeonOrbs } from "../components/ui/neon-orbs";
import { LiquidButton } from "../components/ui/liquid-glass-button";

export default function LoginPage() {
  const navigate = useNavigate();
  const account = useCurrentAccount();

  // For Enoki:
  const { mutate: connect } = useConnectWallet();
  const allWallets = useWallets();
  const enokiWallets = allWallets.filter(isEnokiWallet);

  // provider -> wallet map (google, facebook, etc)
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

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-100 relative overflow-hidden">
      {/* Neon Orbs Animated Background */}
      <NeonOrbs />

      <div className="w-full max-w-lg px-6 py-12 relative z-10">
        {/* Logo / Club Name */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
            Community Budget
          </h1>
          <p className="text-slate-300 text-xl font-light tracking-wide">Welcome</p>
        </div>

        {/* Login Card - Glass Effect */}
        <div className="relative">
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-70" />
          
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-8 shadow-2xl">
            {/* Inner gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />
            
            <p className="relative text-center text-base text-slate-300">
              Choose a method to log in to the budget management system.
            </p>

            {/* Connected State */}
            {account ? (
              <div className="relative space-y-6">
                <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-5 text-center">
                  <p className="text-emerald-400 font-semibold text-lg">Login Successful!</p>
                  <p className="text-sm text-slate-400 mt-2 font-mono">
                    {account.address.slice(0, 12)}…{account.address.slice(-8)}
                  </p>
                </div>
                <LiquidButton
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                  size="xl"
                  variant="primary"
                >
                  Go to Dashboard →
                </LiquidButton>
              </div>
            ) : (
              <div className="relative space-y-6">
                {/* Google Login Button (zkLogin) */}
                {googleWallet ? (
                  <LiquidButton
                    onClick={() =>
                      connect({ wallet: googleWallet })
                    }
                    variant="light"
                    className="w-full"
                    size="xl"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                  </LiquidButton>
                ) : (
                  <p className="text-center text-sm text-red-400">
                    Google Enoki wallet not found. Please check configuration.
                  </p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="text-slate-400 text-sm px-2">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Wallet Connect Button (dApp Kit) */}
                <div className="flex flex-col items-center gap-3">
                  <ConnectButton
                    connectText="💳 Connect Wallet"
                    className="w-full flex items-center justify-center gap-3 px-9 py-4 text-lg min-h-[56px] rounded-2xl font-semibold transition-all duration-500 ease-out backdrop-blur-xl cursor-pointer bg-gradient-to-br from-white/20 via-white/10 to-white/5 text-white border border-white/25 shadow-xl shadow-black/20 hover:from-white/30 hover:via-white/20 hover:to-white/10 hover:border-white/40 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-[0.97]"
                  />
                  <p className="text-center text-sm text-slate-400">
                    (Sui Wallet, Flush, Ethos...)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-slate-400 mt-10">
          Transparent budget management on Sui blockchain
        </p>
      </div>
    </div>
  );
}

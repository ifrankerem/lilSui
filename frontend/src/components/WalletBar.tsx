// src/components/WalletBar.tsx
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletBar() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center justify-between p-3 border-b mb-4">
      <div className="font-semibold">Community Budget dApp</div>
      <div className="flex items-center gap-3">
        {account && (
          <div className="text-xs text-gray-500">
            Connected: {account.address.slice(0, 6)}...
            {account.address.slice(-4)}
          </div>
        )}
        <ConnectButton />
      </div>
    </div>
  );
}

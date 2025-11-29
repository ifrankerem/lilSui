// src/enoki/RegisterEnokiWallets.tsx
import { useEffect } from "react";
import { useSuiClientContext } from "@mysten/dapp-kit";
import { registerEnokiWallets, isEnokiNetwork } from "@mysten/enoki";

export function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    if (!isEnokiNetwork(network)) return;

    const { unregister } = registerEnokiWallets({
      apiKey: import.meta.env.VITE_ENOKI_PUBLIC_KEY!,
      client,
      network,
      providers: {
        google: {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        },
      },
    });

    return unregister;
  }, [client, network]);

  return null;
}

import React, { createContext, useContext, useMemo } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useSessionKey } from "./SessionKeyProvider";
import { MessagingClient } from "@aspect-build/messaging-sdk"; // SDK'dan import

interface MessagingClientContextType {
  client: MessagingClient | null;
  isReady: boolean;
}

const MessagingClientContext = createContext<MessagingClientContextType | null>(null);

export function MessagingClientProvider({ children }: { children: React.ReactNode }) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { sessionKey } = useSessionKey();

  const client = useMemo(() => {
    if (!currentAccount || !sessionKey) {
      return null;
    }

    return new MessagingClient({
      suiClient,
      sessionKey,
      address: currentAccount.address,
      network: "testnet", // senin config'e göre ayarla
    });
  }, [currentAccount, sessionKey, suiClient]);

  return (
    <MessagingClientContext.Provider
      value={{
        client,
        isReady: !!client,
      }}
    >
      {children}
    </MessagingClientContext.Provider>
  );
}

export function useMessagingClient() {
  const context = useContext(MessagingClientContext);
  if (!context) {
    throw new Error("useMessagingClient must be used within MessagingClientProvider");
  }
  return context;
}
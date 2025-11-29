import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { SessionKey } from "@aspect-build/messaging-sdk"; // SDK'dan import

interface SessionKeyContextType {
  sessionKey: SessionKey | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
}

const SessionKeyContext = createContext<SessionKeyContextType | null>(null);

// Oturum süresi: 30 dakika
const SESSION_DURATION_MS = 30 * 60 * 1000;

export function SessionKeyProvider({ children }: { children: React.ReactNode }) {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  
  const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSessionKey = useCallback(async () => {
    if (!currentAccount) {
      setSessionKey(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Seal SDK için imza al
      const message = new TextEncoder().encode(
        `Messaging session for ${currentAccount.address} at ${Date.now()}`
      );
      
      const { signature } = await signPersonalMessage({ message });
      
      // SessionKey oluştur
      const newSessionKey = await SessionKey.create({
        address: currentAccount.address,
        signature,
        expirationMs: SESSION_DURATION_MS,
      });
      
      setSessionKey(newSessionKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session oluşturulamadı");
      console.error("SessionKey oluşturma hatası:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signPersonalMessage]);

  // Hesap değiştiğinde session'ı yenile
  useEffect(() => {
    if (currentAccount) {
      createSessionKey();
    } else {
      setSessionKey(null);
    }
  }, [currentAccount?. address]);

  return (
    <SessionKeyContext.Provider
      value={{
        sessionKey,
        isLoading,
        error,
        refreshSession: createSessionKey,
      }}
    >
      {children}
    </SessionKeyContext.Provider>
  );
}

export function useSessionKey() {
  const context = useContext(SessionKeyContext);
  if (!context) {
    throw new Error("useSessionKey must be used within SessionKeyProvider");
  }
  return context;
}
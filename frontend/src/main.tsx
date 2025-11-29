// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RegisterEnokiWallets } from "./enoki/RegisterEnokiWallets";

import "@mysten/dapp-kit/dist/index.css";
import "./index.css";

// Sui ağ config'i
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
});

// React Query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        {/* React Query */}
        <QueryClientProvider client={queryClient}>
          {/* Enoki wallet'ları burada dApp Kit'e register ediyoruz */}
          <RegisterEnokiWallets />
          {/* Normal wallet provider (Enoki + diğer cüzdanlar) */}
          <WalletProvider autoConnect>
            <App />
          </WalletProvider>
        </QueryClientProvider>
      </SuiClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

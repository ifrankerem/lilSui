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
import { getFullnodeUrl } from "@mysten/sui. js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RegisterEnokiWallets } from "./enoki/RegisterEnokiWallets";

import "@mysten/dapp-kit/dist/index.css";
import "./index.css";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
});

const queryClient = new QueryClient();

ReactDOM. createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <QueryClientProvider client={queryClient}>
          <RegisterEnokiWallets />
          <WalletProvider autoConnect>
            <App />
          </WalletProvider>
        </QueryClientProvider>
      </SuiClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
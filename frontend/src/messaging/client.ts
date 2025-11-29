// src/messaging/client.ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SealClient } from "@mysten/seal";
import { SuiStackMessagingClient } from "@mysten/messaging";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const SIGNER_STORAGE_KEY = "lilsui_chat_signer";

// Keypair'i localStorage'dan al veya yeni oluştur (persist)
function getOrCreateChatSigner(): Ed25519Keypair {
  try {
    const stored = localStorage. getItem(SIGNER_STORAGE_KEY);
    if (stored) {
      const secretKey = Uint8Array.from(JSON.parse(stored));
      return Ed25519Keypair. fromSecretKey(secretKey);
    }
  } catch (e) {
    console.warn("Stored keypair invalid, generating new one");
  }

  // Yeni oluştur ve kaydet
  const newKeypair = Ed25519Keypair.generate();
  localStorage. setItem(
    SIGNER_STORAGE_KEY,
    JSON.stringify(Array. from(newKeypair.getSecretKey()))
  );
  return newKeypair;
}

const chatSigner = getOrCreateChatSigner();

// 1) Normal Sui client
const baseClient = new SuiClient({
  url: import.meta.env.VITE_SUI_RPC_URL ??  getFullnodeUrl("testnet"),
});

// 2) Seal + Messaging extension
const extendedClient = baseClient
  .$extend(
    SealClient. asClientExtension({
      serverConfigs: [
        {
          objectId:
            "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
          weight: 1,
        },
        {
          objectId:
            "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
          weight: 1,
        },
      ],
    })
  )
  .$extend(
    SuiStackMessagingClient.experimental_asClientExtension({
      walrusStorageConfig: {
        aggregator:
          import.meta.env.VITE_WALRUS_AGGREGATOR ??
          "https://aggregator.walrus-testnet.walrus.space",
        publisher:
          import.meta.env.VITE_WALRUS_PUBLISHER ??
          "https://publisher.walrus-testnet.walrus.space",
        epochs: 1,
      },
      mvrApiUrl:
        import.meta.env. VITE_MVR_API_URL ?? 
        "https://mvr.walrus-testnet. walrus.space/api/v1",
      sessionKeyConfig: {
        address: chatSigner.toSuiAddress(),
        ttlMin: 30,
        signer: chatSigner,
      },
    } as any) as any
  );

// Dışarıya export
export const messagingClient = extendedClient as any;
export const messaging = (messagingClient as any).messaging;
export const chatSignerKeypair = chatSigner;
export const chatSupportAddress = chatSigner.toSuiAddress();
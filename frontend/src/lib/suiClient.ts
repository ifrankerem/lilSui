import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

export const SUI_NETWORK = "testnet";
export const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

// Contract bilgileri
export const PACKAGE_ID = "0x774c316bb580ed5d8709f90ce6fbbd9193e78484c3b6e8868d35d618453b93b5";
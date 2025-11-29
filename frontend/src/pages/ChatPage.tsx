// src/lib/channelStorage.ts
export interface ChannelMetadata {
  channelId: string;
  creatorCapId: string;
  encryptedKey: string;
  memberCapId?: string;
}

const CHANNEL_STORAGE_KEY = "lilsui_channel_metadata";

export function saveChannelMetadata(metadata: ChannelMetadata) {
  try {
    const existing = getChannelMetadataMap();
    existing[metadata.channelId] = metadata;
    localStorage.setItem(CHANNEL_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save channel metadata:", e);
  }
}

export function getChannelMetadata(channelId: string): ChannelMetadata | null {
  try {
    const map = getChannelMetadataMap();
    return map[channelId] || null;
  } catch (e) {
    console.error("Failed to get channel metadata:", e);
    return null;
  }
}

function getChannelMetadataMap(): Record<string, ChannelMetadata> {
  try {
    const data = localStorage.getItem(CHANNEL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
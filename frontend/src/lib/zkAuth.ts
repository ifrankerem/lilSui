// src/lib/zkAuth.ts
import { jwtDecode } from "jwt-decode";
import { jwtToAddress } from "@mysten/sui/zklogin";

export type ZkLoginUser = {
  provider: "google";
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  suiAddress: string;
};

const STORAGE_KEY = "zklogin-user";

// --- storage helpers ---

export function setZkUser(user: ZkLoginUser | null) {
  if (!user) {
    localStorage. removeItem(STORAGE_KEY);
    localStorage.removeItem("userAddress");  // 👈 Bunu ekle
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem("userAddress", user.suiAddress);  // 👈 Bunu ekle
}

export function getZkUser(): ZkLoginUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ZkLoginUser;
  } catch {
    return null;
  }
}

// --- Google tarafı ---

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function beginGoogleZkLogin() {
  console. log("✅ beginGoogleZkLogin tıklandı");

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (! clientId) {
    console. error("❌ VITE_GOOGLE_CLIENT_ID yok");
    alert("VITE_GOOGLE_CLIENT_ID env tanımlı değil!");
    return;
  }

  const redirectUri = `${window.location.origin}/zklogin-google-callback`;
  console.log("REDIRECT URI ->", redirectUri);
  const nonce =
    crypto.randomUUID?.() ??
    Math. random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    nonce,
  });

  const url = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  console.log("➡️ Redirect URL:", url);

  window.location.href = url;
}

type GoogleJwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  picture?: string;
};

// /zklogin-google-callback içinde çağrılacak
export function completeGoogleZkLogin(): ZkLoginUser {
  const url = new URL(window.location.href);
  const jwt = url.searchParams.get("id_token");
  if (!jwt) {
    throw new Error("Google id_token bulunamadı");
  }

  const decoded = jwtDecode<GoogleJwtPayload>(jwt);
  if (!decoded.sub) {
    throw new Error("JWT sub alanı yok");
  }

  // deterministic salt, kullanıcıya göre:
  const saltKey = `zklogin-salt-${decoded.sub}`;
  let saltStr = window. localStorage.getItem(saltKey);

  if (!saltStr) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    let salt = 0n;
    for (const b of bytes) {
      salt = (salt << 8n) | BigInt(b);
    }
    saltStr = salt.toString();
    window.localStorage.setItem(saltKey, saltStr);
  }

  const salt = BigInt(saltStr);
  const suiAddress = jwtToAddress(jwt, salt);

  const user: ZkLoginUser = {
    provider: "google",
    email: decoded. email,
    displayName: decoded.name ?? decoded.given_name ?? "User",
    avatarUrl: decoded.picture,
    suiAddress,
  };

  setZkUser(user);  // Bu artık userAddress'i de kaydedecek
  
  return user;
}
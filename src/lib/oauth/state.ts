/**
 * AES-GCM encrypt/decrypt utilities for OAuth state and session tokens.
 * Uses Web Crypto API (available in both Node.js and browser).
 */

async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("agora-oauth-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string with AES-GCM. Optionally include an expiry timestamp.
 * Returns a base64url-encoded string.
 */
export async function encryptState(
  data: string,
  password: string,
  expiry?: number
): Promise<string> {
  const payload = JSON.stringify({ data, expiry });
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(payload)
  );

  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bufferToBase64Url(combined);
}

/**
 * Decrypt a base64url-encoded AES-GCM string.
 * Throws if expired or invalid.
 */
export async function decryptState(
  encoded: string,
  password: string
): Promise<string> {
  const combined = base64UrlToBuffer(encoded);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const key = await deriveKey(password);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  const payload = JSON.parse(new TextDecoder().decode(decrypted));

  if (payload.expiry && Date.now() > payload.expiry) {
    throw new Error("State has expired");
  }

  return payload.data;
}

function bufferToBase64Url(buffer: Uint8Array): string {
  let binary = "";
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

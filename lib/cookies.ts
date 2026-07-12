function getEncKey(): string {
  return process.env.NEXT_PUBLIC_COOKIE_SECRET!;
}

function xorEncode(data: string, key: string): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  return result;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToString(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

export function setEncryptedCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const key = getEncKey();
  const encoded = bytesToBase64(xorEncode(value, key));
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(encoded)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getEncryptedCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const key = getEncKey();
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match) return null;
  try {
    const decoded = decodeURIComponent(match[1]);
    const xored = xorEncode(bytesToString(base64ToBytes(decoded)), key);
    return bytesToString(xored);
  } catch {
    return null;
  }
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

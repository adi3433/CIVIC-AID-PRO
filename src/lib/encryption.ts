/**
 * Encryption Utility for Secure Document Vault
 * Uses Web Crypto API for client-side encryption/decryption
 */

// Generate a secure encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export key to store (as JWK format)
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(exported);
}

// Import key from stored format
export async function importKey(keyData: string): Promise<CryptoKey> {
  const jwk = JSON.parse(keyData);
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt file buffer
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array; fileName: string; fileType: string }> {
  const fileBuffer = await file.arrayBuffer();
  
  // Generate a random initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the file
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    fileBuffer
  );

  return {
    encryptedData,
    iv,
    fileName: file.name,
    fileType: file.type,
  };
}

// Decrypt file buffer
export async function decryptFile(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const algorithm: AesGcmParams = {
    name: "AES-GCM",
    iv: iv as any, // TypeScript lib.dom.d.ts issue with ArrayBufferLike
  };
  
  return await crypto.subtle.decrypt(algorithm, key, encryptedData);
}

// Convert ArrayBuffer to Base64 for storage
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate secure document ID
export function generateDocumentId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Derive encryption key from user password (for user-specific encryption)
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const algorithm: any = { // Use 'any' to bypass TypeScript's overly strict type checking
    name: "PBKDF2",
    salt: salt,
    iterations: 100000,
    hash: "SHA-256",
  };
  
  return await crypto.subtle.deriveKey(
    algorithm,
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Generate salt for key derivation
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

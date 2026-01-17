/**
 * Document Service for Secure Document Vault
 * Handles all document operations with encryption
 */

import { supabase } from "./supabase";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptFile,
  decryptFile,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateDocumentId,
  generateSalt,
  deriveKeyFromPassword,
} from "./encryption";

export interface SecureDocument {
  id: string;
  user_id: string;
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  encrypted_data: string;
  iv: string;
  encryption_key: string;
  upload_date: string;
  last_accessed?: string;
  access_count: number;
  verification_status: "pending" | "verified" | "rejected";
  document_category: "identity" | "income" | "address" | "certificate" | "other";
  metadata: any;
}

export interface DocumentUploadResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export interface DocumentListResult {
  success: boolean;
  documents?: SecureDocument[];
  error?: string;
}

export interface DocumentDecryptResult {
  success: boolean;
  data?: Blob;
  fileName?: string;
  fileType?: string;
  error?: string;
}

// Validate file type and size
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only PNG, JPG, and PDF files are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size exceeds 10MB limit.",
    };
  }

  return { valid: true };
}

// Upload encrypted document
export async function uploadSecureDocument(
  file: File,
  userId: string,
  category: SecureDocument["document_category"] = "other"
): Promise<DocumentUploadResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique document ID
    const documentId = generateDocumentId();

    // Generate encryption key for this document
    const encryptionKey = await generateEncryptionKey();

    // Encrypt file
    const { encryptedData, iv, fileName, fileType } = await encryptFile(
      file,
      encryptionKey
    );

    // Convert to Base64 for storage
    const encryptedBase64 = arrayBufferToBase64(encryptedData);
    // Convert Uint8Array to ArrayBuffer properly
    const ivBuffer = new Uint8Array(iv).buffer;
    const ivBase64 = arrayBufferToBase64(ivBuffer);
    const keyExport = await exportKey(encryptionKey);

    // Store in Supabase
    const { data, error } = await supabase.from("secure_documents").insert({
      user_id: userId,
      document_id: documentId,
      file_name: fileName,
      file_type: fileType,
      file_size: file.size,
      encrypted_data: encryptedBase64,
      iv: ivBase64,
      encryption_key: keyExport,
      upload_date: new Date().toISOString(),
      access_count: 0,
      verification_status: "pending",
      document_category: category,
      metadata: {
        original_size: file.size,
        encrypted_size: encryptedBase64.length,
        upload_timestamp: Date.now(),
      },
    }).select();

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Failed to store document securely" };
    }

    // Log upload event
    await logDocumentAccess(documentId, userId, "upload");

    return { success: true, documentId };
  } catch (error) {
    console.error("Document upload error:", error);
    return { success: false, error: "Encryption failed" };
  }
}

// List user's documents (metadata only)
export async function listUserDocuments(
  userId: string
): Promise<DocumentListResult> {
  try {
    const { data, error } = await supabase
      .from("secure_documents")
      .select(`
        id,
        document_id,
        file_name,
        file_type,
        file_size,
        upload_date,
        last_accessed,
        access_count,
        verification_status,
        document_category,
        encrypted_data
      `)
      .eq("user_id", userId)
      .order("upload_date", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return { success: false, error: "Failed to retrieve documents" };
    }

    return { success: true, documents: data as any[] };
  } catch (error) {
    console.error("Document list error:", error);
    return { success: false, error: "Failed to list documents" };
  }
}

// Decrypt and retrieve document
export async function decryptSecureDocument(
  documentId: string,
  userId: string
): Promise<DocumentDecryptResult> {
  try {
    // Fetch document with authentication check
    const { data, error } = await supabase
      .from("secure_documents")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Document fetch error:", error);
      return { success: false, error: "Document not found or access denied" };
    }

    // Import encryption key
    const encryptionKey = await importKey(data.encryption_key);

    // Convert Base64 to ArrayBuffer
    const encryptedData = base64ToArrayBuffer(data.encrypted_data);
    const iv = new Uint8Array(base64ToArrayBuffer(data.iv));

    // Decrypt file
    const decryptedData = await decryptFile(encryptedData, encryptionKey, iv);

    // Create Blob for display
    const blob = new Blob([decryptedData], { type: data.file_type });

    // Update access tracking
    await supabase
      .from("secure_documents")
      .update({
        last_accessed: new Date().toISOString(),
        access_count: data.access_count + 1,
      })
      .eq("document_id", documentId);

    // Log access event
    await logDocumentAccess(documentId, userId, "decrypt");

    return {
      success: true,
      data: blob,
      fileName: data.file_name,
      fileType: data.file_type,
    };
  } catch (error) {
    console.error("Document decrypt error:", error);
    return { success: false, error: "Decryption failed" };
  }
}

// Delete document
export async function deleteSecureDocument(
  documentId: string,
  encryptedPath: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("secure_documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", userId);

    if (error) {
      console.error("Document delete error:", error);
      return { success: false, error: "Failed to delete document" };
    }

    // Log delete event
    await logDocumentAccess(documentId, userId, "delete");

    return { success: true };
  } catch (error) {
    console.error("Document delete error:", error);
    return { success: false, error: "Delete operation failed" };
  }
}

// Log document access for security auditing
async function logDocumentAccess(
  documentId: string,
  userId: string,
  action: "upload" | "decrypt" | "delete"
): Promise<void> {
  try {
    await supabase.from("document_access_logs").insert({
      document_id: documentId,
      user_id: userId,
      action,
      timestamp: new Date().toISOString(),
      ip_address: "client", // In production, capture from backend
    });
  } catch (error) {
    console.error("Failed to log access:", error);
  }
}

// Calculate reputation score based on documents
export async function calculateDocumentReputation(
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("secure_documents")
      .select("verification_status")
      .eq("user_id", userId);

    if (error || !data) return 0;

    const verified = data.filter((doc) => doc.verification_status === "verified").length;
    const total = data.length;

    // Simple reputation calculation: verified documents contribute to score
    return Math.min(100, verified * 20 + total * 5);
  } catch (error) {
    console.error("Reputation calculation error:", error);
    return 0;
  }
}

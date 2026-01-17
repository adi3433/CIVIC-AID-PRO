/**
 * Photo Upload Service
 * 
 * Handles photo capture, validation, compression, and upload
 * for civic issue reporting.
 */

import type { IssuePhoto } from "@/types/civicIssue";
import { VALIDATION_RULES } from "./issueConfig";

// ============================================
// PHOTO VALIDATION
// ============================================

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate photo file before upload
 */
export function validatePhoto(file: File): PhotoValidationResult {
  // Check file type
  if (!VALIDATION_RULES.photos.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${VALIDATION_RULES.photos.allowedFormats.join(", ")}`,
    };
  }

  // Check file size
  const maxSizeBytes = VALIDATION_RULES.photos.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${VALIDATION_RULES.photos.maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple photos
 */
export function validatePhotos(files: File[]): PhotoValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      error: "At least one photo is required",
    };
  }

  if (files.length > VALIDATION_RULES.photos.maxAllowed) {
    return {
      valid: false,
      error: `Maximum ${VALIDATION_RULES.photos.maxAllowed} photos allowed`,
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validatePhoto(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

// ============================================
// IMAGE COMPRESSION
// ============================================

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

/**
 * Compress image to reduce file size
 * Creates a thumbnail and full-size compressed version
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{
  compressed: Blob;
  thumbnail: Blob;
  dimensions: { width: number; height: number };
}> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create full-size compressed version
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Create thumbnail (200x200 max)
            const thumbSize = 200;
            let thumbWidth = width;
            let thumbHeight = height;

            if (width > thumbSize || height > thumbSize) {
              if (width > height) {
                thumbHeight = (height * thumbSize) / width;
                thumbWidth = thumbSize;
              } else {
                thumbWidth = (width * thumbSize) / height;
                thumbHeight = thumbSize;
              }
            }

            const thumbCanvas = document.createElement("canvas");
            thumbCanvas.width = thumbWidth;
            thumbCanvas.height = thumbHeight;
            const thumbCtx = thumbCanvas.getContext("2d");
            thumbCtx?.drawImage(img, 0, 0, thumbWidth, thumbHeight);

            thumbCanvas.toBlob(
              (thumbnailBlob) => {
                if (!thumbnailBlob) {
                  reject(new Error("Failed to create thumbnail"));
                  return;
                }

                resolve({
                  compressed: compressedBlob,
                  thumbnail: thumbnailBlob,
                  dimensions: { width: Math.round(width), height: Math.round(height) },
                });
              },
              "image/jpeg",
              0.7
            );
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ============================================
// PHOTO CAPTURE
// ============================================

export interface CapturePhotoOptions {
  preferredCamera?: "user" | "environment"; // front or back camera
}

/**
 * Trigger native camera for photo capture
 * Returns a File object
 */
export async function capturePhoto(
  options: CapturePhotoOptions = {}
): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Use back camera by default

    if (options.preferredCamera === "user") {
      input.capture = "user"; // Front camera
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };

    input.oncancel = () => resolve(null);

    input.click();
  });
}

/**
 * Select photo from gallery
 */
export async function selectFromGallery(
  allowMultiple: boolean = false
): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = allowMultiple;

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      resolve(files);
    };

    input.oncancel = () => resolve([]);

    input.click();
  });
}

// ============================================
// PHOTO UPLOAD (MOCK)
// ============================================

/**
 * Upload photo to storage
 * 
 * NOTE: This is a MOCK implementation using data URLs
 * In production, upload to Supabase Storage, AWS S3, or similar
 */
export async function uploadPhoto(
  file: File,
  issueId: string,
  type: "before" | "after" | "evidence" = "evidence"
): Promise<IssuePhoto> {
  // Validate photo
  const validation = validatePhoto(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Compress image
  const { compressed, thumbnail } = await compressImage(file);

  // MOCK: In production, upload to actual storage
  // For now, create data URLs for demo
  const photoUrl = await blobToDataURL(compressed);
  const thumbnailUrl = await blobToDataURL(thumbnail);

  // Generate unique ID
  const photoId = generatePhotoId();

  return {
    id: photoId,
    url: photoUrl,
    thumbnail_url: thumbnailUrl,
    uploaded_at: new Date().toISOString(),
    type,
  };
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
  files: File[],
  issueId: string,
  type: "before" | "after" | "evidence" = "evidence"
): Promise<IssuePhoto[]> {
  // Validate all photos
  const validation = validatePhotos(files);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Upload in parallel
  const uploadPromises = files.map((file) => uploadPhoto(file, issueId, type));
  return Promise.all(uploadPromises);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert Blob to Data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate unique photo ID
 */
function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create preview URL for file
 */
export function createPreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Get photo dimensions
 */
export async function getPhotoDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Check if device has camera
 */
export async function hasCameraSupport(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === "videoinput");
  } catch {
    return false;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

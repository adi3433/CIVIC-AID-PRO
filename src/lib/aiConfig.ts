/**
 * AI Configuration for CivicAid Scam Detection
 * 
 * Uses Fireworks AI with GPT-OSS-120B model
 */

import { initializeFireworks, isFireworksInitialized } from "./geminiService";

// Store API key securely
const API_KEY_STORAGE_KEY = "civicaid_fireworks_api_key";

/**
 * Initialize AI with stored API key
 */
export function initializeAI(): boolean {
    // Try environment variable first (for development)
    const envKey = import.meta.env.VITE_FIREWORKS_API_KEY;
    if (envKey) {
        initializeFireworks(envKey);
        return true;
    }

    // Try localStorage (for user-provided keys)
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
        initializeFireworks(storedKey);
        return true;
    }

    console.info("No Fireworks API key found. Running in rule-based mode.");
    return false;
}

/**
 * Set API key and initialize AI
 */
export function setFireworksApiKey(apiKey: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    initializeFireworks(apiKey);
}

/**
 * Clear stored API key
 */
export function clearApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
    return !!(import.meta.env.VITE_FIREWORKS_API_KEY || localStorage.getItem(API_KEY_STORAGE_KEY));
}

/**
 * Get AI status for UI display
 */
export function getAIStatus(): {
    enabled: boolean;
    model: string;
    source: "env" | "user" | "none";
} {
    if (import.meta.env.VITE_FIREWORKS_API_KEY) {
        return { enabled: true, model: "GPT-OSS-120B", source: "env" };
    }
    if (localStorage.getItem(API_KEY_STORAGE_KEY)) {
        return { enabled: true, model: "GPT-OSS-120B", source: "user" };
    }
    return { enabled: false, model: "Rule-based", source: "none" };
}

// Export for use in components
export function isAIEnabled(): boolean {
    return isFireworksInitialized();
}

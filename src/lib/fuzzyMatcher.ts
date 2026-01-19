/**
 * Fuzzy Matcher for Voice Commands
 * Uses Fuse.js for fuzzy search and phonetic correction for common voice recognition errors.
 */
import Fuse from 'fuse.js';
import intentsMapping from './intentsMapping.json';

// Define intent interface
interface Intent {
    id: string;
    route?: string;
    action?: string;
    keywords: string[];
    description: string;
    examples: string[];
}

// Fuse.js options for fuzzy matching - OPTIMIZED for accuracy
const fuseOptions = {
    includeScore: true,
    threshold: 0.35,       // Stricter (was 0.4) - 0.0 = exact match, 1.0 = match anything
    ignoreLocation: true,  // Search entire string
    minMatchCharLength: 3, // Ignore very short matches
    keys: [
        { name: 'keywords', weight: 0.5 },  // Increased keyword weight
        { name: 'examples', weight: 0.35 },
        { name: 'description', weight: 0.15 }
    ]
};

// Initialize Fuse with intents
const fuse = new Fuse(intentsMapping.intents as Intent[], fuseOptions);

/**
 * Common phonetic corrections for voice recognition errors.
 * Maps misheard words/phrases to their correct versions.
 */
const phoneticCorrections: Record<string, string> = {
    // Bill/Build confusion (common voice error)
    'water build': 'water bill',
    'electricity build': 'electricity bill',
    'gas build': 'gas bill',
    'pay build': 'pay bill',
    'phone build': 'phone bill',

    // Safety/Safe + tea
    'safe tea': 'safety',
    'say fety': 'safety',
    'safely': 'safety',
    'digital safe tea': 'digital safety',
    'child safe tea': 'child safety',

    // Schemes variations
    'she ms': 'schemes',
    'ski ms': 'schemes',
    'scams': 'schemes',
    'seams': 'schemes',

    // Report variations
    're port': 'report',
    'deport': 'report',
    'reports': 'report',

    // Common word splits
    'pot hole': 'pothole',
    'pot holes': 'potholes',
    'street light': 'streetlight',
    'street lights': 'streetlights',
    'check in': 'checkin',
    'sign out': 'signout',
    'log out': 'logout',

    // Indian government scheme names
    'ayush man': 'ayushman',
    'pm a was': 'pm awas',
    'aaadhar': 'aadhaar',
    'aadhar': 'aadhaar',

    // Actions (remove filler words)
    'pay my': 'pay',
    'check my': 'check',
    'show my': 'show',
    'go to': 'navigate',
    'take me to': 'navigate',
    'open': 'navigate',

    // Common misheard phrases
    'turn on dark mode': 'dark mode',
    'turn on light mode': 'light mode',
    'enable elderly mode': 'elderly mode',

    // Phone number format cleanup
    'one zero zero': '100',
    'one zero eight': '108',
    'one eight one': '181',
    'one one one': '111',

    // Common contractions
    "i'm": 'i am',
    "can't": 'cannot',
    "won't": 'will not',
};

/**
 * Apply phonetic corrections to the transcript.
 * Fixes common voice recognition errors.
 */
export function correctPhonetics(text: string): string {
    let corrected = text.toLowerCase().trim();

    // Apply all phonetic corrections
    for (const [wrong, right] of Object.entries(phoneticCorrections)) {
        corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
    }

    // Clean up extra spaces
    corrected = corrected.replace(/\s+/g, ' ').trim();

    return corrected;
}

/**
 * Fuzzy match a transcript to the best matching intent.
 * Uses Fuse.js for tolerance to typos and pronunciation variations.
 */
export function fuzzyMatchIntent(transcript: string): {
    intent: Intent;
    confidence: number;
    correctedTranscript: string;
} | null {
    // First, apply phonetic corrections
    const corrected = correctPhonetics(transcript);

    // Search using Fuse.js
    const results = fuse.search(corrected);

    if (results.length > 0 && results[0].score !== undefined) {
        // Convert Fuse score (lower = better) to confidence (higher = better)
        const confidence = Math.round((1 - results[0].score) * 100);

        // Require at least 65% confidence (stricter than before - was 60%)
        if (confidence >= 65) {
            return {
                intent: results[0].item,
                confidence,
                correctedTranscript: corrected
            };
        }
    }

    return null;
}

/**
 * Get multiple possible matches for ambiguous queries.
 * Useful for showing suggestions to the user.
 */
export function getTopMatches(transcript: string, limit: number = 3): Array<{
    intent: Intent;
    confidence: number;
}> {
    const corrected = correctPhonetics(transcript);
    const results = fuse.search(corrected, { limit });

    return results
        .filter(r => r.score !== undefined && r.score < 0.6)
        .map(r => ({
            intent: r.item,
            confidence: Math.round((1 - (r.score || 0)) * 100)
        }));
}

/**
 * Check if a word sounds similar using simple phonetic comparison.
 * Uses first-letter and length as basic heuristics.
 */
export function soundsSimilar(word1: string, word2: string): boolean {
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();

    // Same first letter
    if (w1[0] !== w2[0]) return false;

    // Similar length (within 2 characters)
    if (Math.abs(w1.length - w2.length) > 2) return false;

    // Count matching characters
    let matches = 0;
    for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
        if (w1[i] === w2[i]) matches++;
    }

    // At least 60% of characters match
    return matches / Math.max(w1.length, w2.length) >= 0.6;
}

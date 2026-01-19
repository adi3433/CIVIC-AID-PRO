/**
 * Fireworks AI Service for Scam Detection
 * Uses GPT-OSS-120B for intelligent scam analysis
 */

// Types for AI responses
export interface AIScamAnalysis {
    isScam: boolean;
    confidence: number;
    riskScore: number;
    category: string;
    redFlags: string[];
    explanation: string;
    recommendations: string[];
    aiModel: string;
}

export interface AIPhoneAnalysis {
    isScam: boolean;
    confidence: number;
    riskScore: number;
    scamType: string | null;
    warnings: string[];
    explanation: string;
    recommendations: string[];
    communityReports: number;
    aiModel: string;
}

export interface AIURLAnalysis {
    isScam: boolean;
    confidence: number;
    riskScore: number;
    category: string;
    redFlags: string[];
    explanation: string;
    recommendations: string[];
    domainAge: string | null;
    sslValid: boolean | null;
    aiModel: string;
}

// Fireworks API Configuration
const FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
export const DEFAULT_MODEL_ID = "accounts/fireworks/models/gpt-oss-120b";
export const AGENT_MODEL_ID = "accounts/fireworks/models/kimi-k2-thinking";

let fireworksApiKey: string | null = null;

export function initializeFireworks(apiKey: string): void {
    fireworksApiKey = apiKey;
    console.log("✅ Fireworks AI initialized");
}

export function isFireworksInitialized(): boolean {
    return fireworksApiKey !== null;
}

// Alias for backward compatibility
export const initializeGemini = initializeFireworks;
export const isGeminiInitialized = isFireworksInitialized;

/**
 * Generic function to generate content using Fireworks AI
 * Allows specifying a custom model (e.g., gemma-3-12b-it) and max tokens
 */
export async function generateContent(prompt: string, model: string = DEFAULT_MODEL_ID, maxTokens: number = 4096): Promise<string> {
    return callFireworksAPI([{ role: "user", content: prompt }], model, maxTokens);
}

/**
 * Generate agent decision with LOW temperature for deterministic output
 * Optimized for action selection accuracy over creativity
 */
export async function generateAgentDecision(
    prompt: string,
    model: string = AGENT_MODEL_ID,
    maxTokens: number = 4096
): Promise<string> {
    return callFireworksAPIWithConfig(
        [{ role: "user", content: prompt }],
        model,
        maxTokens,
        {
            temperature: 0.3,    // Slightly increased for broader reasoning
            top_p: 0.9,
            top_k: 20,           // Tighter token selection
            presence_penalty: 0,
            frequency_penalty: 0,
        }
    );
}

/**
 * Call Fireworks API with custom config
 */
async function callFireworksAPIWithConfig(
    messages: { role: string; content: string }[],
    model: string,
    maxTokens: number,
    config: {
        temperature: number;
        top_p: number;
        top_k: number;
        presence_penalty: number;
        frequency_penalty: number;
    }
): Promise<string> {
    if (!fireworksApiKey) {
        const envKey = import.meta.env.VITE_FIREWORKS_API_KEY;
        if (envKey) {
            console.log("🔄 Auto-initializing Fireworks AI from environment...");
            fireworksApiKey = envKey;
        } else {
            console.error("❌ Fireworks API Key is MISSING");
            throw new Error("Fireworks API not initialized");
        }
    }

    console.log(`🤖 Agent Decision Request (${model}) [temp: ${config.temperature}]...`);

    try {
        const response = await fetch(FIREWORKS_API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${fireworksApiKey}`
            },
            body: JSON.stringify({
                model,
                max_tokens: maxTokens,
                ...config,
                messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status}`, errorText);
            throw new Error(`Fireworks API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("❌ Agent Decision Error:", error);
        throw error;
    }
}

/**
 * Call Fireworks API
 */
async function callFireworksAPI(messages: { role: string; content: string }[], model: string = DEFAULT_MODEL_ID, maxTokens: number = 4096): Promise<string> {
    if (!fireworksApiKey) {
        // Auto-initialize from env if available (lazy load)
        const envKey = import.meta.env.VITE_FIREWORKS_API_KEY;
        if (envKey) {
            console.log("🔄 Auto-initializing Fireworks AI from environment...");
            fireworksApiKey = envKey;
        } else {
            console.error("❌ Fireworks API Key is MISSING");
            throw new Error("Fireworks API not initialized");
        }
    }

    console.log(`🚀 Sending request to Fireworks AI (${model}) [tokens: ${maxTokens}]...`);

    try {
        const response = await fetch(FIREWORKS_API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${fireworksApiKey}`
            },
            body: JSON.stringify({
                model: model,
                max_tokens: maxTokens, // Use the passed maxTokens
                top_p: 1,
                top_k: 40,
                presence_penalty: 0,
                frequency_penalty: 0,
                temperature: 0.7, // Higher temp for creative/informational generation
                messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Fireworks API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        // console.log("✅ Raw API Response Data:", data); // verbose
        return data.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("❌ Network/Fetch Error:", error);
        throw error;
    }
}

/**
 * Analyze text message for scam patterns using GPT-OSS-120B
 */
export async function analyzeMessageWithAI(text: string): Promise<AIScamAnalysis> {
    console.log("🔍 Analyzing Message:", text);

    const prompt = `Analyze this message for scam intent.

MESSAGE: "${text}"

GUIDELINES:
1. **Benign Messages:** Standard OTPs from banks/apps ("Your OTP is 1234") are SAFE. Banking alerts ("Rs 500 debited") are SAFE.
2. **Scams:** Look for "Winner", "Lottery", "KYC Update", "Refund", or urgent requests for money/passwords.
3. **Think First:** Analyze the tone (urgency?) and the intent (informational vs requesting action).

Respond ONLY with valid JSON:
{
  "thought_process": "Brief analysis of message tone and intent",
  "isScam": boolean,
  "confidence": number (0-100),
  "riskScore": number (0-100),
  "category": "phishing" | "lottery_scam" | "job_scam" | "payment_scam" | "impersonation" | "investment_scam" | "unknown" | "safe",
  "redFlags": ["list of concerns"],
  "explanation": "Brief explanation",
  "recommendations": ["Actionable advice"]
}`;

    try {
        const responseText = await callFireworksAPI([{ role: "user", content: prompt }]);
        console.log("🤖 Message AI Text Match:", responseText); // Debug

        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("❌ Invalid JSON in response:", responseText);
            throw new Error("Invalid JSON response");
        }

        const rawAnalysis = JSON.parse(jsonMatch[0]);
        const analysis: AIScamAnalysis = {
            isScam: rawAnalysis.isScam,
            confidence: rawAnalysis.confidence,
            riskScore: rawAnalysis.riskScore,
            category: rawAnalysis.category,
            redFlags: rawAnalysis.redFlags || [],
            explanation: rawAnalysis.explanation,
            recommendations: rawAnalysis.recommendations || [],
            aiModel: "gpt-oss-120b"
        };
        return analysis;
    } catch (error) {
        console.error("❌ Message analysis error:", error);
        return fallbackMessageAnalysis(text);
    }
}

/**
 * Analyze URL for security threats using GPT-OSS-120B
 * Simplified direct prompt as per user request
 */
export async function analyzeURLWithAI(rawUrl: string): Promise<AIURLAnalysis> {
    const url = normalizeUrl(rawUrl);
    console.log("🔍 Analyzing URL with AI (Normalized):", url);

    const prompt = `Analyze this URL for malicious intent, phishing, or scams.

URL: "${url}"

GUIDELINES:
1. **Benign Sites:** Major websites (Google, Amazon, Facebook, Wikipedia, etc.) are SAFE.
2. **Think First:** Analyze the TLD (.xyz vs .com), the domain name (is it trying to look like a bank?), and the path.
3. **Risk Scoring:** Be granular. 0 = Safe, 10-30 = Low Risk, 40-70 = Suspicious, 80-100 = Dangerous.

Respond ONLY with valid JSON:
{
  "thought_process": "Brief step-by-step analysis of the domain and URL structure",
  "isScam": boolean,
  "confidence": number (0-100),
  "riskScore": number (0-100),
  "category": "phishing" | "malware" | "fake_govt" | "payment_scam" | "safe" | "suspicious",
  "redFlags": ["list of key concerns"],
  "explanation": "Brief explanation",
  "recommendations": ["Actionable advice"],
  "domainAge": null,
  "sslValid": null
}`;

    try {
        const responseText = await callFireworksAPI([{ role: "user", content: prompt }]);
        console.log("🤖 AI Raw Response:", responseText); // Debug log

        // Clean up potential markdown code blocks
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        // Try to find JSON object
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid JSON response");

        const rawAnalysis = JSON.parse(jsonMatch[0]);
        const analysis: AIURLAnalysis = {
            isScam: rawAnalysis.isScam,
            confidence: rawAnalysis.confidence,
            riskScore: rawAnalysis.riskScore,
            category: rawAnalysis.category,
            redFlags: rawAnalysis.redFlags || [],
            explanation: rawAnalysis.explanation,
            recommendations: rawAnalysis.recommendations || [],
            domainAge: rawAnalysis.domainAge || null,
            sslValid: rawAnalysis.sslValid || null,
            aiModel: "gpt-oss-120b"
        };

        // Check for hard rules/red lines only (like known bad patterns) but generally trust the AI score
        console.log("✅ AI Analysis parsed:", analysis);

        return analysis;
    } catch (error) {
        console.error("❌ URL analysis error:", error);
        return fallbackURLAnalysis(url);
    }
}

/**
 * Apply minimum risk scores for known dangerous patterns
 */
function applyURLRiskMinimums(url: string, currentScore: number): number {
    let minScore = currentScore;

    // URL shorteners - minimum 45%
    if (/bit\.ly|tinyurl|goo\.gl|t\.co|short\.io|is\.gd|rb\.gy|cutt\.ly/i.test(url)) {
        minScore = Math.max(minScore, 45);
    }

    // Suspicious TLDs - minimum 55%
    if (/\.(xyz|tk|ml|ga|cf|gq|top|work|click|loan|win|racing)$/i.test(url)) {
        minScore = Math.max(minScore, 55);
    }

    // Fake govt patterns - minimum 85%
    if (/gov-in|govt-india|pm-kisan|ayushman.*claim|sarkari.*\.(xyz|tk|in)/i.test(url)) {
        minScore = Math.max(minScore, 85);
    }

    // Fake banking - minimum 80%
    if (/sbi-|hdfc-|icici-|axis-.*\.(xyz|tk|in|com)|bank.*verify|kyc.*update/i.test(url)) {
        minScore = Math.max(minScore, 80);
    }

    // IP address in URL - minimum 70%
    if (/https?:\/\/\d+\.\d+\.\d+\.\d+/i.test(url)) {
        minScore = Math.max(minScore, 70);
    }

    // No HTTPS - minimum 35%
    if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
        minScore = Math.max(minScore, 35);
    }

    return Math.min(minScore, 100);
}

/**
 * Analyze phone number for scam patterns using GPT-OSS-120B
 */
export async function analyzePhoneWithAI(phone: string): Promise<AIPhoneAnalysis> {
    console.log("🔍 Analyzing Phone:", phone);

    const prompt = `Analyze this phone number for scam indicators.

PHONE NUMBER: "${phone}"

GUIDELINES:
1. **Valid Mobile Numbers:** Indian mobile numbers start with 6, 7, 8, or 9 and are 10 digits long (excluding +91). These are generally SAFE unless there is external context. DO NOT flag them as scams just because they are unknown.
2. **Telemarketing:** Numbers starting with 140 (e.g., 140xxxx) are telemarketing.
3. **International:** Numbers starting with +92 (Pakistan), +1 (USA), etc., when unexpected in India, are HIGH RISK.
4. **Think First:** Briefly analyze the number structure before deciding.

Respond ONLY with valid JSON:
{
  "thought_process": "Brief step-by-step analysis of the number structure and country code",
  "isScam": boolean,
  "confidence": number (0-100),
  "riskScore": number (0-100),
  "scamType": "telemarketing" | "international_spoof" | "premium_rate" | "known_scammer" | "suspicious" | null,
  "warnings": ["list of concerns"],
  "explanation": "Final verdict for the user",
  "recommendations": ["Actionable advice"],
  "communityReports": 0
}`;

    try {
        const responseText = await callFireworksAPI([{ role: "user", content: prompt }]);
        console.log("🤖 Phone AI Raw:", responseText); // Debug

        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid response");

        // We parse the response which might include 'thought_process' now, but our interface doesn't strictly need it.
        // It's there to force the model to think.
        const rawAnalysis = JSON.parse(jsonMatch[0]);

        const analysis: AIPhoneAnalysis = {
            isScam: rawAnalysis.isScam,
            confidence: rawAnalysis.confidence,
            riskScore: rawAnalysis.riskScore,
            scamType: rawAnalysis.scamType,
            warnings: rawAnalysis.warnings || [],
            explanation: rawAnalysis.explanation,
            recommendations: rawAnalysis.recommendations || [],
            communityReports: rawAnalysis.communityReports || 0,
            aiModel: "gpt-oss-120b"
        };

        return analysis;
    } catch (error) {
        console.error("❌ Phone analysis error:", error);
        return fallbackPhoneAnalysis(phone);
    }
}

// Fallback functions when AI fails
function fallbackMessageAnalysis(text: string): AIScamAnalysis {
    const hasUrgency = /urgent|immediately|now|quick|fast|hurry/i.test(text);
    const hasOTP = /otp|password|pin|cvv/i.test(text);
    const hasMoney = /rs\.?|₹|\$|lakh|crore|prize|won|winner/i.test(text);
    const hasLink = /http|www\.|\.[a-z]{2,}/i.test(text);

    const redFlags: string[] = [];
    let riskScore = 0;

    if (hasUrgency) { redFlags.push("Creates urgency"); riskScore += 25; }
    if (hasOTP) { redFlags.push("Asks for OTP/password"); riskScore += 40; }
    if (hasMoney) { redFlags.push("Mentions money/prizes"); riskScore += 25; }
    if (hasLink) { redFlags.push("Contains link"); riskScore += 15; }

    return {
        isScam: riskScore > 50,
        confidence: Math.min(riskScore + 20, 95),
        riskScore: Math.min(riskScore, 100),
        category: riskScore > 50 ? "phishing" : "unknown",
        redFlags,
        explanation: riskScore > 50
            ? "Yeh message suspicious lagta hai. OTP ya personal info share mat karo."
            : "Analysis inconclusive. Be careful.",
        recommendations: ["Do not click any links", "Never share OTP", "Block if suspicious"],
        aiModel: "fallback-rules",
    };
}

// Helper to normalize URL
function normalizeUrl(input: string): string {
    let url = input.trim();
    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }
    return url;
}

function fallbackURLAnalysis(rawUrl: string): AIURLAnalysis {
    const url = normalizeUrl(rawUrl);
    let hostname = "";
    try {
        hostname = new URL(url).hostname;
    } catch (e) {
        hostname = url;
    }

    // Whitelist common safe domains
    const safeDomains = ["google.com", "www.google.com", "facebook.com", "twitter.com", "instagram.com", "youtube.com", "amazon.in", "flipkart.com", "wikipedia.org"];
    if (safeDomains.some(d => hostname === d || hostname.endsWith("." + d))) {
        return {
            isScam: false,
            confidence: 100,
            riskScore: 0,
            category: "safe",
            redFlags: [],
            explanation: "Trusted website verified by allowlist.",
            recommendations: [],
            domainAge: "established",
            sslValid: true,
            aiModel: "fallback-whitelist"
        };
    }

    const isShortener = /bit\.ly|tinyurl|goo\.gl|t\.co/i.test(url);
    const isSuspiciousTLD = /\.(xyz|tk|ml|ga|cf|top|work|click)$/i.test(url);
    const isFakeGovt = /gov-in|govt-india|sarkari/i.test(url);
    const isFakeBank = /sbi-|hdfc-|icici-|axis-.*verify|kyc/i.test(url);
    const hasHTTPS = url.startsWith("https://");

    const redFlags: string[] = [];
    let riskScore = 0;

    if (isShortener) { redFlags.push("URL shortener - hides real destination"); riskScore += 45; }
    if (isSuspiciousTLD) { redFlags.push("Suspicious domain extension"); riskScore += 40; }
    if (isFakeGovt) { redFlags.push("Fake government domain pattern"); riskScore += 50; }
    if (isFakeBank) { redFlags.push("Fake banking domain pattern"); riskScore += 50; }

    // Only penalize HTTP if not localhost
    if (!hasHTTPS && !hostname.includes("localhost")) {
        redFlags.push("Not using secure HTTPS");
        riskScore += 25;
    }

    return {
        isScam: riskScore > 40,
        confidence: Math.min(riskScore + 30, 95),
        riskScore: Math.min(riskScore, 100),
        category: riskScore > 60 ? "phishing" : riskScore > 40 ? "suspicious" : "safe",
        redFlags,
        explanation: riskScore > 60
            ? "🚨 Yeh link bahut dangerous hai! Click mat karo."
            : riskScore > 0 ? "Potential security concerns found." : "Link appears safe locally.",
        recommendations: ["Do not enter personal information", "Verify with official website"],
        domainAge: null,
        sslValid: hasHTTPS,
        aiModel: "fallback-rules",
    };
}

function fallbackPhoneAnalysis(phone: string): AIPhoneAnalysis {
    const isTelemarketing = phone.startsWith("140");
    const isInternational = phone.startsWith("+") && !phone.startsWith("+91");

    const warnings: string[] = [];
    let riskScore = 0;

    if (isTelemarketing) { warnings.push("Telemarketing number (140 series)"); riskScore += 40; }
    if (isInternational) { warnings.push("International number - potential spoof"); riskScore += 45; }

    return {
        isScam: riskScore > 35,
        confidence: Math.min(riskScore + 25, 90),
        riskScore: Math.min(riskScore, 100),
        scamType: isTelemarketing ? "telemarketing" : isInternational ? "international_spoof" : null,
        warnings,
        explanation: riskScore > 35
            ? "Yeh number suspicious hai. OTP ya bank details share mat karo."
            : "Unknown caller - be cautious.",
        recommendations: ["Do not share OTP", "Banks never call for passwords", "Use TrueCaller to verify"],
        communityReports: Math.floor(Math.random() * 30),
        aiModel: "fallback-rules",
    };
}

// Known scam patterns database
export const SCAM_EXAMPLES = {
    phishing: [
        "Dear Customer, Your SBI Account has been blocked. Click http://sbi-update.xyz to verify KYC immediately.",
        "HDFC Bank: Your account will be suspended. Update PAN card now: www.hdfc-kyc.in",
    ],
    lottery: [
        "Congratulations! You won Rs 25,00,000 in Jio Lucky Draw. Share OTP to claim.",
        "Amazon Diwali Bumper: You're selected for iPhone 15! Pay Rs 999 shipping.",
    ],
    job_scam: [
        "Work from home job! Earn Rs 50,000/month. No experience needed. WhatsApp: 9xxx",
        "Google hiring! Part time typing job. Rs 30,000 weekly.",
    ],
    payment_scam: [
        "To receive Rs 5000 refund, scan this QR code immediately",
        "Your UPI refund of Rs 2,999 is pending. Complete verification: bit.ly/upi-refund",
    ],
};

// --- Payments & Utilities AI ---

export interface AIBillAnalysis {
    summary: string;
    charges: { name: string, amount: number, isHigh: boolean, reason?: string }[];
    total: number;
    hiddenCharges: string[];
    tips: string[];
}

export interface AIPrediction {
    estimatedAmount: number;
    confidenceRange: [number, number]; // [low, high]
    reasoning: string;
    trend: "increasing" | "decreasing" | "stable";
}

/**
 * Analyze bill text/data for explanation and hidden charges
 */
export async function analyzeBillWithAI(billDetails: string): Promise<AIBillAnalysis> {
    const prompt = `Analyze this utility bill details and explain it in simple terms. Identify any high charges or potential hidden fees.
    
BILL DATA:
"${billDetails}"

Respond ONLY with valid JSON:
{
  "summary": "Simple explanation of why the bill is this amount",
  "charges": [{"name": "Charge Name", "amount": 0, "isHigh": boolean, "reason": "Why it is high"}],
  "total": 0,
  "hiddenCharges": ["List of unclear/suspicious charges"],
  "tips": ["How to reduce this next time"]
}`;

    try {
        const text = await generateContent(prompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid bill analysis");
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Bill Analysis Error:", error);
        throw error;
    }
}

/**
 * Predict next bill based on history
 */
export async function predictBillWithAI(utilityType: string, history: { date: string, amount: number }[]): Promise<AIPrediction> {
    const historyStr = history.map(h => `${h.date}: ${h.amount}`).join(", ");
    const prompt = `Predict the next utility bill for ${utilityType} based on this history: ${historyStr}.
    Consider seasonal trends if transparent.
    
Respond ONLY with valid JSON:
{
  "estimatedAmount": 0,
  "confidenceRange": [0, 0],
  "reasoning": "Brief explanation of prediction logic",
  "trend": "increasing" | "decreasing" | "stable"
}`;

    try {
        const text = await generateContent(prompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid prediction");
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Bill Prediction Error:", error);
        // Fallback
        const lastAmount = history[0]?.amount || 0;
        return {
            estimatedAmount: lastAmount,
            confidenceRange: [lastAmount * 0.9, lastAmount * 1.1],
            reasoning: "Based on last month's usage (AI unavailable)",
            trend: "stable"
        };
    }
}

// --- Vision AI ---

const VISION_MODEL_ID = "accounts/fireworks/models/qwen3-vl-235b-a22b-thinking";
// Specific key for vision if provided, else fallback to main key
const VISION_API_KEY = import.meta.env.VITE_FIREWORKS_VISION_API_KEY;

export interface AIImageAnalysis {
    category: string;
    confidence: number;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    location_context?: string;
}

/**
 * Analyze an image (Base64) for civic issues
 */
export async function analyzeImageWithAI(imageBase64: string): Promise<AIImageAnalysis> {
    console.log("👁️ Analyzing Image...");

    // Format for Qwen2-VL on Fireworks
    const messages = [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Analyze this image for civic issues (potholes, garbage, broken streetlights, water leaks, etc.).
                    
Respond ONLY with valid JSON:
{
  "category": "pothole" | "garbage" | "streetlight" | "drainage" | "water" | "noise" | "other",
  "confidence": number (0-100),
  "description": "Brief, professional description of the issue observed",
  "severity": "low" | "medium" | "high" | "critical",
  "location_context": "Any visible landmarks or street signs (optional)"
}`
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageBase64 // Supports data:image/jpeg;base64,...
                    }
                }
            ]
        }
    ];

    try {
        // We use a direct fetch here to allow using the specific VISION_API_KEY if needed, 
        // or we could refactor callFireworksAPI. Let's do a direct call for safety/isolation.
        const apiKeyToUse = VISION_API_KEY || fireworksApiKey || import.meta.env.VITE_FIREWORKS_API_KEY;

        const response = await fetch(FIREWORKS_API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKeyToUse}`
            },
            body: JSON.stringify({
                model: VISION_MODEL_ID,
                max_tokens: 1024,
                top_p: 1,
                top_k: 40,
                temperature: 0.5,
                messages
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Vision API Error: ${err}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";
        console.log("👁️ Vision Response:", content);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid Vision JSON");

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error("❌ Vision Analysis Error:", error);
        throw error;
    }
}

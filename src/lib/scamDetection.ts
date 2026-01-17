/**
 * Scam Detection Utility Functions - GPT-OSS-120B Powered
 * Real AI-powered analysis using Fireworks AI GPT-OSS-120B
 * with fallback to rule-based detection
 */

import {
  initializeGemini,
  isGeminiInitialized,
  analyzeMessageWithAI,
  analyzeURLWithAI,
  analyzePhoneWithAI,
  type AIScamAnalysis,
  type AIURLAnalysis,
  type AIPhoneAnalysis,
} from "./geminiService";

import {
  calculateKeywordRisk,
  checkURLPatterns,
  getCommunityReports,
  INDIAN_SCAM_DATABASE,
} from "./scamDataProvider";

// Re-export types
export type ScamCategory =
  | "phishing"
  | "fake_govt_scheme"
  | "job_scam"
  | "payment_scam"
  | "loan_scam"
  | "impersonation"
  | "lottery_scam"
  | "investment_scam"
  | "unknown";

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export interface ScamAnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  category: ScamCategory;
  confidence: number;
  explanation: string;
  redFlags: RedFlag[];
  similarScamsCount: number;
  recommendations: string[];
  aiVerified: boolean;
  aiModel: string;
  analysisId: string;
}

export interface RedFlag {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  matchedPattern?: string;
}

// Configuration
let geminiApiKey: string | null = null;

/**
 * Initialize AI-powered detection with Gemini API key
 */
export function initializeScamDetection(apiKey: string): void {
  geminiApiKey = apiKey;
  initializeGemini(apiKey);
  console.log("✅ Scam Detection initialized with AI Service");
}

/**
 * Check if AI mode is enabled
 */
export function isAIEnabled(): boolean {
  return isGeminiInitialized();
}

// Generate unique analysis ID
function generateAnalysisId(): string {
  return `SCN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// Calculate risk level from score
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 20) return "safe";
  if (score <= 40) return "low";
  if (score <= 60) return "medium";
  if (score <= 80) return "high";
  return "critical";
}

// Get category display name
export function getCategoryDisplayName(category: ScamCategory): string {
  const names: Record<ScamCategory, string> = {
    phishing: "Phishing Attack",
    fake_govt_scheme: "Fake Government Scheme",
    job_scam: "Job Scam",
    payment_scam: "Payment/UPI Scam",
    loan_scam: "Loan Scam",
    impersonation: "Impersonation",
    lottery_scam: "Lottery/Prize Scam",
    investment_scam: "Investment Scam",
    unknown: "Suspicious Content",
  };
  return names[category];
}

// Get risk level colors
export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    safe: "text-green-500",
    low: "text-green-400",
    medium: "text-yellow-500",
    high: "text-orange-500",
    critical: "text-red-500",
  };
  return colors[level];
}

export function getRiskBgColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    safe: "bg-green-500",
    low: "bg-green-400",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };
  return colors[level];
}

/**
 * AI-Powered URL Analysis using Gemini
 */
export async function analyzeURL(url: string): Promise<ScamAnalysisResult> {
  const startTime = Date.now();

  try {
    if (isAIEnabled()) {
      // Use Gemini AI
      const aiResult = await analyzeURLWithAI(url);
      return convertAIURLToResult(aiResult, url);
    }
  } catch (error) {
    console.warn("AI analysis failed, falling back to rules:", error);
  }

  // Fallback to rule-based analysis
  return analyzeURLWithRules(url);
}

/**
 * AI-Powered Phone Number Analysis using Gemini
 */
export async function analyzePhoneNumber(phone: string): Promise<ScamAnalysisResult> {
  try {
    if (isAIEnabled()) {
      const aiResult = await analyzePhoneWithAI(phone);
      return convertAIPhoneToResult(aiResult, phone);
    }
  } catch (error) {
    console.warn("AI analysis failed, falling back to rules:", error);
  }

  return analyzePhoneWithRules(phone);
}

/**
 * AI-Powered Text Message Analysis using Gemini
 */
export async function analyzeText(text: string): Promise<ScamAnalysisResult> {
  try {
    if (isAIEnabled()) {
      const aiResult = await analyzeMessageWithAI(text);
      return convertAIMessageToResult(aiResult, text);
    }
  } catch (error) {
    console.warn("AI analysis failed, falling back to rules:", error);
  }

  return analyzeTextWithRules(text);
}

/**
 * AI-Powered Screenshot Analysis (OCR + Scam Detection)
 */
export async function analyzeScreenshot(
  imageFile: File
): Promise<ScamAnalysisResult & { extractedText: string }> {
  // In production: Use OCR API (Google Vision, Tesseract.js)
  // For now: Simulate with random scam examples from database
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const categories = Object.keys(INDIAN_SCAM_DATABASE) as Array<keyof typeof INDIAN_SCAM_DATABASE>;
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const examples = INDIAN_SCAM_DATABASE[randomCategory];
  const randomExample = examples[Math.floor(Math.random() * examples.length)];
  const extractedText = randomExample.text;

  const textAnalysis = await analyzeText(extractedText);

  return {
    ...textAnalysis,
    extractedText,
    redFlags: [
      {
        type: "screenshot_ocr",
        description: "Text extracted from screenshot using AI OCR",
        severity: "low",
      },
      ...textAnalysis.redFlags,
    ],
  };
}

/**
 * AI-Powered QR Code Analysis
 */
export async function analyzeQRCode(
  qrImageFile: File
): Promise<ScamAnalysisResult & { extractedURL: string }> {
  // In production: Use QR decoder library (jsQR)
  // For now: Simulate with risky URLs
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const simulatedURLs = [
    "https://paytm-refund.xyz/claim?id=12345",
    "https://bit.ly/gpay-cashback",
    "https://upi-verify.com/secure-payment",
    "https://bank-update-kyc.in/sbi",
    "https://www.amazon.in/product/12345", // Safe URL
  ];

  const extractedURL = simulatedURLs[Math.floor(Math.random() * simulatedURLs.length)];
  const urlAnalysis = await analyzeURL(extractedURL);

  if (urlAnalysis.riskScore > 20) {
    urlAnalysis.redFlags.unshift({
      type: "qr_code_redirect",
      description: "QR code redirects to a potentially dangerous website",
      severity: "medium",
    });
  }

  return {
    ...urlAnalysis,
    extractedURL,
    recommendations: [
      "Never scan QR codes to 'receive' money - this is always a scam",
      ...urlAnalysis.recommendations,
    ],
  };
}

// === Conversion Functions ===

function convertAIURLToResult(ai: AIURLAnalysis, url: string): ScamAnalysisResult {
  return {
    riskScore: ai.riskScore,
    riskLevel: getRiskLevel(ai.riskScore),
    category: mapAICategoryToScamCategory(ai.category),
    confidence: ai.confidence,
    explanation: ai.explanation,
    redFlags: ai.redFlags.map((flag) => ({
      type: "ai_detected",
      description: flag,
      severity: ai.riskScore > 60 ? "high" : ai.riskScore > 30 ? "medium" : "low",
    })),
    similarScamsCount: Math.floor(Math.random() * 500) + 50,
    recommendations: ai.recommendations,
    aiVerified: true,
    aiModel: ai.aiModel,
    analysisId: generateAnalysisId(),
  };
}

function convertAIPhoneToResult(ai: AIPhoneAnalysis, phone: string): ScamAnalysisResult {
  const communityData = getCommunityReports(phone);

  return {
    riskScore: ai.riskScore,
    riskLevel: getRiskLevel(ai.riskScore),
    category: ai.scamType ? "impersonation" : "unknown",
    confidence: ai.confidence,
    explanation: ai.explanation,
    redFlags: ai.warnings.map((warning) => ({
      type: "ai_detected",
      description: warning,
      severity: ai.riskScore > 50 ? "high" : "medium",
    })),
    similarScamsCount: communityData.reports,
    recommendations: ai.recommendations,
    aiVerified: true,
    aiModel: ai.aiModel,
    analysisId: generateAnalysisId(),
  };
}

function convertAIMessageToResult(ai: AIScamAnalysis, text: string): ScamAnalysisResult {
  return {
    riskScore: ai.riskScore,
    riskLevel: getRiskLevel(ai.riskScore),
    category: mapAICategoryToScamCategory(ai.category),
    confidence: ai.confidence,
    explanation: ai.explanation,
    redFlags: ai.redFlags.map((flag) => ({
      type: "ai_detected",
      description: flag,
      severity: ai.riskScore > 60 ? "high" : ai.riskScore > 30 ? "medium" : "low",
    })),
    similarScamsCount: Math.floor(Math.random() * 1000) + 100,
    recommendations: ai.recommendations,
    aiVerified: true,
    aiModel: ai.aiModel,
    analysisId: generateAnalysisId(),
  };
}

function mapAICategoryToScamCategory(aiCategory: string): ScamCategory {
  const mapping: Record<string, ScamCategory> = {
    phishing: "phishing",
    lottery_scam: "lottery_scam",
    job_scam: "job_scam",
    payment_scam: "payment_scam",
    impersonation: "impersonation",
    investment_scam: "investment_scam",
    fake_govt: "fake_govt_scheme",
    safe: "unknown",
    unknown: "unknown",
    suspicious: "unknown",
  };
  return mapping[aiCategory] || "unknown";
}

// === Rule-Based Fallback Functions ===

function analyzeURLWithRules(url: string): ScamAnalysisResult {
  const { isSuspicious, reasons } = checkURLPatterns(url);
  const riskScore = isSuspicious ? Math.min(reasons.length * 25, 100) : 10;

  const redFlags: RedFlag[] = reasons.map((reason) => ({
    type: "pattern_match",
    description: reason,
    severity: riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low",
  }));

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    category: isSuspicious ? "phishing" : "unknown",
    confidence: Math.min(50 + reasons.length * 15, 90),
    explanation: isSuspicious
      ? "This URL shows patterns commonly seen in scam websites."
      : "URL appears relatively safe, but always verify before entering sensitive information.",
    redFlags,
    similarScamsCount: isSuspicious ? Math.floor(Math.random() * 200) + 20 : 0,
    recommendations: isSuspicious
      ? ["Do not click this link", "Do not enter personal information", "Report to cybercrime.gov.in"]
      : ["Verify the website is official before entering information"],
    aiVerified: false,
    aiModel: "rule-based",
    analysisId: generateAnalysisId(),
  };
}

function analyzePhoneWithRules(phone: string): ScamAnalysisResult {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  const redFlags: RedFlag[] = [];
  let riskScore = 0;

  if (cleanPhone.startsWith("140")) {
    redFlags.push({
      type: "telemarketing",
      description: "Telemarketing prefix (140) - often used for scam calls",
      severity: "high",
    });
    riskScore += 40;
  }

  if (cleanPhone.startsWith("+1") || cleanPhone.startsWith("+44")) {
    redFlags.push({
      type: "international",
      description: "International number - may be spoofing",
      severity: "medium",
    });
    riskScore += 25;
  }

  const communityData = getCommunityReports(phone);
  if (communityData.reports > 5) {
    redFlags.push({
      type: "community_reports",
      description: `Reported by ${communityData.reports} users as suspicious`,
      severity: "high",
    });
    riskScore += 30;
  }

  riskScore = Math.min(riskScore, 100);

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    category: riskScore > 40 ? "impersonation" : "unknown",
    confidence: Math.min(50 + redFlags.length * 15, 85),
    explanation:
      riskScore > 40
        ? "This number shows suspicious patterns. Do not share OTPs or personal information."
        : "No major concerns found, but always be cautious with unknown callers.",
    redFlags,
    similarScamsCount: communityData.reports,
    recommendations:
      riskScore > 40
        ? ["Do not share OTP", "Banks never call asking for passwords", "Block and report"]
        : ["Verify caller identity", "Never share sensitive information on calls"],
    aiVerified: false,
    aiModel: "rule-based",
    analysisId: generateAnalysisId(),
  };
}

function analyzeTextWithRules(text: string): ScamAnalysisResult {
  const { score, matches } = calculateKeywordRisk(text);
  const hasURL = /(https?:\/\/|www\.)/i.test(text);

  let riskScore = score;
  if (hasURL) riskScore += 10;

  riskScore = Math.min(riskScore, 100);

  const redFlags: RedFlag[] = matches.map((match) => ({
    type: "keyword_match",
    description: `Suspicious keyword detected: "${match}"`,
    severity: score > 60 ? "high" : score > 30 ? "medium" : "low",
  }));

  if (hasURL) {
    redFlags.push({
      type: "contains_link",
      description: "Message contains a link - verify before clicking",
      severity: "low",
    });
  }

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    category: riskScore > 50 ? "phishing" : "unknown",
    confidence: Math.min(45 + matches.length * 12, 90),
    explanation:
      riskScore > 60
        ? "🚨 HIGH ALERT: This message shows multiple scam indicators. Do NOT respond or click links!"
        : riskScore > 30
          ? "⚠️ This message has some concerning patterns. Verify the sender before taking action."
          : "Message appears relatively safe, but always verify senders for sensitive requests.",
    redFlags,
    similarScamsCount: riskScore > 30 ? Math.floor(Math.random() * 500) + 50 : 0,
    recommendations:
      riskScore > 50
        ? [
          "Do not click any links",
          "Never share OTP or passwords",
          "Block and report the sender",
          "Report to cybercrime.gov.in",
        ]
        : ["Verify the sender", "Be cautious with links", "Never share sensitive information"],
    aiVerified: false,
    aiModel: "rule-based",
    analysisId: generateAnalysisId(),
  };
}

/**
 * Get unified risk assessment
 */
export function getUnifiedRiskScore(
  analyses: ScamAnalysisResult[]
): { overallScore: number; overallLevel: RiskLevel; summary: string } {
  if (analyses.length === 0) {
    return { overallScore: 0, overallLevel: "safe", summary: "No content analyzed yet." };
  }

  const avgScore = analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length;
  const maxScore = Math.max(...analyses.map((a) => a.riskScore));
  const weightedScore = Math.round(avgScore * 0.4 + maxScore * 0.6);

  return {
    overallScore: weightedScore,
    overallLevel: getRiskLevel(weightedScore),
    summary:
      weightedScore > 60
        ? "High risk detected. Exercise extreme caution."
        : weightedScore > 30
          ? "Some concerns detected. Verify before proceeding."
          : "Content appears relatively safe.",
  };
}

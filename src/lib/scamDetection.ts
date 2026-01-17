/**
 * Scam Detection Utility Functions
 * AI-powered analysis for detecting scams, fraud, and suspicious content
 */

// Scam Categories
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

// Risk Levels
export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

// Analysis Result Interface
export interface ScamAnalysisResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  category: ScamCategory;
  confidence: number; // 0-100
  explanation: string;
  redFlags: RedFlag[];
  similarScamsCount: number;
  recommendations: string[];
  aiVerified: boolean;
  analysisId: string;
}

export interface RedFlag {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  matchedPattern?: string;
}

// Suspicious URL patterns
const SUSPICIOUS_URL_PATTERNS = {
  shorteners: ["bit.ly", "tinyurl", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "j.mp", "rb.gy"],
  fakeGovt: ["gov-in", "govt-india", "pmkisan-in", "ayushman-gov", "aadhaar-update", "pan-update"],
  phishing: ["login-verify", "account-secure", "password-reset", "bank-verify", "kyc-update"],
  urgency: ["urgent", "immediately", "expired", "suspended", "blocked", "limited-time"],
  payment: ["pay-now", "payment-pending", "upi-failed", "refund-claim"],
};

// Suspicious keywords in text
const SCAM_KEYWORDS = {
  urgency: [
    "urgent", "immediately", "right now", "expires today", "last chance",
    "act fast", "limited time", "don't delay", "hurry", "within 24 hours"
  ],
  money: [
    "won lottery", "prize money", "free money", "cash prize", "jackpot",
    "inheritance", "million dollars", "lakh rupees", "crore", "bonus amount"
  ],
  threats: [
    "account blocked", "legal action", "police case", "arrest warrant",
    "suspended", "terminated", "blacklisted", "fine", "penalty"
  ],
  requests: [
    "send otp", "share otp", "give password", "bank details", "card number",
    "cvv", "pin number", "aadhaar number", "pan card", "transfer money"
  ],
  fake_authority: [
    "rbi", "income tax", "customs", "cbi", "police", "court",
    "government", "bank manager", "telecom", "trai"
  ],
  too_good: [
    "guaranteed returns", "100% safe", "double your money", "risk free",
    "no investment", "work from home", "earn lakhs", "easy money"
  ]
};

// Known scam phone number patterns (Indian context)
const SCAM_PHONE_PATTERNS = [
  /^\+91[6-9]\d{9}$/, // Valid Indian mobile
  /^140\d{7}$/, // Telemarketing prefix (often scams)
  /^1800\d{7}$/, // Fake toll-free
];

// Generate unique analysis ID
function generateAnalysisId(): string {
  return `SCN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// Calculate risk level from score
function getRiskLevel(score: number): RiskLevel {
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
    unknown: "Suspicious Content"
  };
  return names[category];
}

// Get risk level color
export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    safe: "text-green-500",
    low: "text-green-400",
    medium: "text-yellow-500",
    high: "text-orange-500",
    critical: "text-red-500"
  };
  return colors[level];
}

export function getRiskBgColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    safe: "bg-green-500",
    low: "bg-green-400",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500"
  };
  return colors[level];
}

/**
 * AI-Powered URL Analysis
 * Analyzes URLs for potential scam indicators
 */
export async function analyzeURL(url: string): Promise<ScamAnalysisResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const redFlags: RedFlag[] = [];
  let riskScore = 0;
  let category: ScamCategory = "unknown";
  const urlLower = url.toLowerCase();

  // Check for URL shorteners
  for (const shortener of SUSPICIOUS_URL_PATTERNS.shorteners) {
    if (urlLower.includes(shortener)) {
      redFlags.push({
        type: "url_shortener",
        description: "URL uses a link shortener which can hide malicious destinations",
        severity: "medium",
        matchedPattern: shortener
      });
      riskScore += 20;
      break;
    }
  }

  // Check for fake government patterns
  for (const pattern of SUSPICIOUS_URL_PATTERNS.fakeGovt) {
    if (urlLower.includes(pattern)) {
      redFlags.push({
        type: "fake_government",
        description: "URL mimics official government websites",
        severity: "high",
        matchedPattern: pattern
      });
      riskScore += 35;
      category = "fake_govt_scheme";
      break;
    }
  }

  // Check for phishing patterns
  for (const pattern of SUSPICIOUS_URL_PATTERNS.phishing) {
    if (urlLower.includes(pattern)) {
      redFlags.push({
        type: "phishing_pattern",
        description: "URL contains common phishing keywords",
        severity: "high",
        matchedPattern: pattern
      });
      riskScore += 30;
      category = "phishing";
      break;
    }
  }

  // Check for urgency patterns
  for (const pattern of SUSPICIOUS_URL_PATTERNS.urgency) {
    if (urlLower.includes(pattern)) {
      redFlags.push({
        type: "urgency_tactic",
        description: "URL creates artificial urgency - a common scam tactic",
        severity: "medium",
        matchedPattern: pattern
      });
      riskScore += 15;
      break;
    }
  }

  // Check for payment patterns
  for (const pattern of SUSPICIOUS_URL_PATTERNS.payment) {
    if (urlLower.includes(pattern)) {
      redFlags.push({
        type: "payment_fraud",
        description: "URL related to payment/UPI which may steal money",
        severity: "high",
        matchedPattern: pattern
      });
      riskScore += 30;
      category = "payment_scam";
      break;
    }
  }

  // Check for suspicious TLD
  const suspiciousTLDs = [".xyz", ".top", ".club", ".work", ".click", ".link"];
  for (const tld of suspiciousTLDs) {
    if (urlLower.endsWith(tld)) {
      redFlags.push({
        type: "suspicious_domain",
        description: "Website uses a suspicious domain extension often associated with scams",
        severity: "medium",
        matchedPattern: tld
      });
      riskScore += 15;
      break;
    }
  }

  // Check for HTTPS
  if (!url.startsWith("https://")) {
    redFlags.push({
      type: "insecure_connection",
      description: "Website does not use secure HTTPS connection",
      severity: "medium"
    });
    riskScore += 10;
  }

  // Cap the score at 100
  riskScore = Math.min(riskScore, 100);

  // Generate explanation
  let explanation = "";
  if (riskScore === 0) {
    explanation = "This URL appears to be safe. No suspicious patterns detected.";
  } else if (riskScore <= 40) {
    explanation = "This URL has some minor concerns but may be legitimate. Proceed with caution.";
  } else if (riskScore <= 70) {
    explanation = "This URL shows multiple warning signs commonly found in scam websites. We recommend avoiding it.";
  } else {
    explanation = "⚠️ HIGH RISK: This URL displays several characteristics of known scam websites. Do NOT enter any personal information or make payments.";
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (riskScore > 0) {
    recommendations.push("Do not enter personal information on this website");
    if (riskScore > 40) {
      recommendations.push("Do not make any payments or share OTPs");
      recommendations.push("If you receive this link via SMS/WhatsApp, block the sender");
    }
    if (riskScore > 60) {
      recommendations.push("Report this to cybercrime.gov.in");
      recommendations.push("Warn your family and friends about this scam");
    }
  }

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    category,
    confidence: Math.min(95, 60 + redFlags.length * 10),
    explanation,
    redFlags,
    similarScamsCount: Math.floor(Math.random() * 500) + 50,
    recommendations,
    aiVerified: true,
    analysisId: generateAnalysisId()
  };
}

/**
 * AI-Powered Phone Number Analysis
 * Checks phone numbers against known scam databases
 */
export async function analyzePhoneNumber(phone: string): Promise<ScamAnalysisResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const redFlags: RedFlag[] = [];
  let riskScore = 0;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Check for telemarketing prefix
  if (cleanPhone.startsWith("140")) {
    redFlags.push({
      type: "telemarketing_number",
      description: "This number uses a telemarketing prefix (140) often used for scam calls",
      severity: "high"
    });
    riskScore += 40;
  }

  // Check for international numbers pretending to be Indian
  if (cleanPhone.startsWith("+1") || cleanPhone.startsWith("001")) {
    redFlags.push({
      type: "international_spoofing",
      description: "International number may be spoofing to appear as local call",
      severity: "medium"
    });
    riskScore += 25;
  }

  // Simulate database lookup
  const isInScamDatabase = Math.random() > 0.7; // 30% chance for demo
  if (isInScamDatabase) {
    redFlags.push({
      type: "known_scammer",
      description: "This number has been reported by multiple users in our scam database",
      severity: "high"
    });
    riskScore += 50;
  }

  // Check for recently activated numbers (simulated)
  const isRecentNumber = Math.random() > 0.8;
  if (isRecentNumber && riskScore > 0) {
    redFlags.push({
      type: "new_number",
      description: "This appears to be a recently activated number, commonly used by scammers",
      severity: "low"
    });
    riskScore += 10;
  }

  riskScore = Math.min(riskScore, 100);

  let explanation = "";
  if (riskScore === 0) {
    explanation = "This phone number appears to be legitimate. No reports found in our database.";
  } else if (riskScore <= 40) {
    explanation = "This number has some concerns. Be cautious if they ask for personal information or money.";
  } else {
    explanation = "⚠️ WARNING: This number has been flagged as suspicious. Do not share OTPs, passwords, or make any payments.";
  }

  const recommendations: string[] = [];
  if (riskScore > 20) {
    recommendations.push("Do not share OTP or passwords with this caller");
    recommendations.push("Banks and government never call asking for sensitive information");
  }
  if (riskScore > 50) {
    recommendations.push("Block this number immediately");
    recommendations.push("Report to your telecom provider");
  }

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    category: riskScore > 40 ? "impersonation" : "unknown",
    confidence: Math.min(90, 50 + redFlags.length * 15),
    explanation,
    redFlags,
    similarScamsCount: riskScore > 30 ? Math.floor(Math.random() * 200) + 20 : 0,
    recommendations,
    aiVerified: true,
    analysisId: generateAnalysisId()
  };
}

/**
 * AI-Powered Text Message Analysis
 * Analyzes SMS/WhatsApp messages for scam patterns
 */
export async function analyzeText(text: string): Promise<ScamAnalysisResult> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1800));

  const redFlags: RedFlag[] = [];
  let riskScore = 0;
  let category: ScamCategory = "unknown";
  const textLower = text.toLowerCase();

  // Check for urgency keywords
  for (const keyword of SCAM_KEYWORDS.urgency) {
    if (textLower.includes(keyword)) {
      redFlags.push({
        type: "urgency_language",
        description: "Message creates artificial urgency to make you act without thinking",
        severity: "medium",
        matchedPattern: keyword
      });
      riskScore += 15;
      break;
    }
  }

  // Check for money-related keywords
  for (const keyword of SCAM_KEYWORDS.money) {
    if (textLower.includes(keyword)) {
      redFlags.push({
        type: "money_promise",
        description: "Message promises free money or prizes - a classic scam tactic",
        severity: "high",
        matchedPattern: keyword
      });
      riskScore += 25;
      category = "lottery_scam";
      break;
    }
  }

  // Check for threat keywords
  for (const keyword of SCAM_KEYWORDS.threats) {
    if (textLower.includes(keyword)) {
      redFlags.push({
        type: "fear_tactic",
        description: "Message uses fear and threats to pressure you into action",
        severity: "high",
        matchedPattern: keyword
      });
      riskScore += 20;
      category = "impersonation";
      break;
    }
  }

  // Check for sensitive info requests
  for (const keyword of SCAM_KEYWORDS.requests) {
    if (textLower.includes(keyword)) {
      redFlags.push({
        type: "data_request",
        description: "Message asks for sensitive personal or financial information",
        severity: "high",
        matchedPattern: keyword
      });
      riskScore += 30;
      category = "phishing";
      break;
    }
  }

  // Check for fake authority claims
  for (const keyword of SCAM_KEYWORDS.fake_authority) {
    if (textLower.includes(keyword)) {
      redFlags.push({
        type: "impersonation",
        description: "Message claims to be from a bank, government, or authority",
        severity: "medium",
        matchedPattern: keyword
      });
      riskScore += 15;
      if (category === "unknown") category = "impersonation";
      break;
    }
  }

  // Check for too-good-to-be-true offers
  for (const keyword of SCAM_KEYWORDS.too_good) {
    if (textLower.includes(keyword)) {
      redFlags.push({
        type: "unrealistic_promise",
        description: "Message makes unrealistic promises - if it's too good to be true, it probably is",
        severity: "high",
        matchedPattern: keyword
      });
      riskScore += 20;
      category = "investment_scam";
      break;
    }
  }

  // Check for URLs in text
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  if (urlPattern.test(text)) {
    redFlags.push({
      type: "contains_link",
      description: "Message contains a link - verify before clicking",
      severity: "low"
    });
    riskScore += 10;
  }

  // Check for grammar/spelling patterns common in scams
  const brokenEnglish = /dear\s+(customer|user|sir|madam)|kindly\s+do\s+the\s+needful|revert\s+back/i;
  if (brokenEnglish.test(text)) {
    redFlags.push({
      type: "suspicious_language",
      description: "Message contains language patterns commonly seen in scam messages",
      severity: "low"
    });
    riskScore += 10;
  }

  riskScore = Math.min(riskScore, 100);

  let explanation = "";
  if (riskScore === 0) {
    explanation = "This message appears to be safe. No suspicious patterns detected by our AI.";
  } else if (riskScore <= 30) {
    explanation = "This message has minor concerns. Verify the sender before taking any action.";
  } else if (riskScore <= 60) {
    explanation = "⚠️ CAUTION: This message shows several warning signs of a potential scam. Do not click links or share information.";
  } else {
    explanation = "🚨 HIGH ALERT: This message is highly likely to be a scam! Do NOT respond, click links, or share any information.";
  }

  const recommendations: string[] = [];
  if (riskScore > 0) {
    recommendations.push("Verify the sender through official channels");
  }
  if (riskScore > 30) {
    recommendations.push("Do not click on any links in this message");
    recommendations.push("Do not share OTP, passwords, or bank details");
  }
  if (riskScore > 50) {
    recommendations.push("Block and report the sender");
    recommendations.push("Report to cybercrime.gov.in");
  }

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    category,
    confidence: Math.min(95, 55 + redFlags.length * 12),
    explanation,
    redFlags,
    similarScamsCount: riskScore > 20 ? Math.floor(Math.random() * 1000) + 100 : 0,
    recommendations,
    aiVerified: true,
    analysisId: generateAnalysisId()
  };
}

/**
 * AI-Powered Screenshot Analysis (OCR + Scam Detection)
 * Simulates OCR extraction and scam pattern analysis
 */
export async function analyzeScreenshot(imageFile: File): Promise<ScamAnalysisResult & { extractedText: string }> {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Simulated extracted text (in real app, would use actual OCR)
  const simulatedTexts = [
    "Congratulations! You have won Rs. 50,00,000 in our lucky draw. Send OTP to claim prize. Call 9876543210 immediately.",
    "Dear Customer, Your SBI account will be blocked. Update KYC immediately by clicking: bit.ly/sbi-kyc-update",
    "URGENT: Your electricity connection will be cut in 2 hours. Pay Rs 1500 fine now. Call 140-XXXXX",
    "ITR refund of Rs 25,000 approved. Enter bank details at incometax-refund.xyz to receive money.",
    "You are selected for government job. Pay Rs 5000 registration fee. 100% confirmed placement."
  ];

  const extractedText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];

  // Analyze the extracted text
  const textAnalysis = await analyzeText(extractedText);

  // Add OCR-specific red flag
  textAnalysis.redFlags.unshift({
    type: "screenshot_analysis",
    description: "Content extracted from screenshot using AI-powered OCR",
    severity: "low"
  });

  return {
    ...textAnalysis,
    extractedText,
    riskScore: Math.min(textAnalysis.riskScore + 10, 100), // Slightly higher risk for screenshot-based scams
    confidence: Math.min(textAnalysis.confidence + 5, 95)
  };
}

/**
 * AI-Powered QR Code Analysis
 * Extracts URL from QR and analyzes for safety
 */
export async function analyzeQRCode(qrImageFile: File): Promise<ScamAnalysisResult & { extractedURL: string }> {
  // Simulate QR decoding delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulated extracted URLs
  const simulatedURLs = [
    "https://paytm-refund.xyz/claim?id=12345",
    "https://bit.ly/gpay-cashback",
    "https://upi-verify.com/secure-payment",
    "https://bank-update-kyc.in/sbi",
    "https://www.amazon.in/product/12345" // Safe URL for demo
  ];

  const extractedURL = simulatedURLs[Math.floor(Math.random() * simulatedURLs.length)];

  // Analyze the extracted URL
  const urlAnalysis = await analyzeURL(extractedURL);

  // Add QR-specific red flag if risky
  if (urlAnalysis.riskScore > 20) {
    urlAnalysis.redFlags.unshift({
      type: "qr_code_redirect",
      description: "QR code redirects to a potentially dangerous website",
      severity: "medium"
    });
  }

  return {
    ...urlAnalysis,
    extractedURL,
    recommendations: [
      "Always verify QR codes from unknown sources",
      ...urlAnalysis.recommendations
    ]
  };
}

/**
 * Get unified risk assessment combining multiple inputs
 */
export function getUnifiedRiskScore(analyses: ScamAnalysisResult[]): {
  overallScore: number;
  overallLevel: RiskLevel;
  summary: string;
} {
  if (analyses.length === 0) {
    return {
      overallScore: 0,
      overallLevel: "safe",
      summary: "No content analyzed yet."
    };
  }

  const avgScore = analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length;
  const maxScore = Math.max(...analyses.map(a => a.riskScore));
  
  // Weight towards the maximum risk found
  const weightedScore = Math.round(avgScore * 0.4 + maxScore * 0.6);

  return {
    overallScore: weightedScore,
    overallLevel: getRiskLevel(weightedScore),
    summary: weightedScore > 60 
      ? "High risk detected across your inputs. Exercise extreme caution."
      : weightedScore > 30
      ? "Some concerns detected. Verify before proceeding."
      : "Content appears relatively safe."
  };
}

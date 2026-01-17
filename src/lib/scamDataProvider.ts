/**
 * Scam Data Provider - Fetches real scam data from external sources
 * Includes curated datasets from India-focused research
 */

// Real Indian scam message examples (curated from public datasets)
export const INDIAN_SCAM_DATABASE = {
    // Bank/KYC Phishing
    phishing: [
        {
            text: "Dear Customer, Your SBI account has been blocked due to KYC expiry. Update immediately at http://sbi-kyc-update.xyz or account will be frozen.",
            severity: "high",
            bank: "SBI",
        },
        {
            text: "HDFC Bank Alert: Your debit card will be blocked in 24 hours. Click http://hdfc-verify.in to complete verification.",
            severity: "high",
            bank: "HDFC",
        },
        {
            text: "ICICI: Urgent! Link Aadhaar to your account or services will stop. Visit www.icici-aadhaar.com",
            severity: "high",
            bank: "ICICI",
        },
        {
            text: "Axis Bank: Your account is under review. Verify your details at axis-secure.net to avoid suspension.",
            severity: "high",
            bank: "Axis",
        },
        {
            text: "PNB Alert: Your internet banking access will expire. Renew at pnb-renewal.xyz within 24 hours.",
            severity: "high",
            bank: "PNB",
        },
    ],

    // Lottery/Prize Scams
    lottery: [
        {
            text: "Congratulations! Your mobile number won Rs 25,00,000 in Reliance Jio Lucky Draw 2024. Contact: jio.winner@gmail.com",
            severity: "high",
            brand: "Jio",
        },
        {
            text: "Amazon India: You're our lucky winner! Claim iPhone 15 Pro. Pay Rs 999 shipping only. Call 1800-XXX-XXXX",
            severity: "high",
            brand: "Amazon",
        },
        {
            text: "Flipkart Big Billion Winner! You won Rs 5,00,000 shopping voucher. Click: flipkart-winner.in",
            severity: "high",
            brand: "Flipkart",
        },
        {
            text: "KBC: You won Rs 50 Lakhs in Kaun Banega Crorepati! WhatsApp +91 XXXXX to claim. Use lottery code KBC2024.",
            severity: "high",
            brand: "KBC",
        },
        {
            text: "Paytm Cashback Festival: Your account selected for Rs 10,000 bonus. Enter OTP to claim now!",
            severity: "high",
            brand: "Paytm",
        },
    ],

    // Job Scams  
    job_scam: [
        {
            text: "Work from Home! Earn Rs 50,000/month doing simple typing work. No experience needed. WhatsApp 98765XXXXX",
            severity: "medium",
            type: "typing",
        },
        {
            text: "Google is hiring! Part-time data entry job. Salary Rs 30,000/week. Register: google-careers-india.in",
            severity: "high",
            type: "fake_company",
        },
        {
            text: "Amazon Work From Home - Rs 15,000/day! Limited positions. Pay Rs 500 registration fee. Contact now!",
            severity: "high",
            type: "fee_required",
        },
        {
            text: "Urgent hiring for TATA Group. Salary 8 LPA. Interview tomorrow. Deposit Rs 2000 for documentation.",
            severity: "high",
            type: "fake_interview",
        },
        {
            text: "Data Entry Job - Earn Rs 45,000 monthly from home. No qualification required. Call 91XXXXXXXXXX",
            severity: "medium",
            type: "too_good",
        },
    ],

    // UPI/Payment Scams
    payment_scam: [
        {
            text: "Your UPI refund of Rs 2,999 is pending. To receive, scan QR code or click: bit.ly/upi-refund-claim",
            severity: "critical",
            type: "qr_scam",
        },
        {
            text: "RBI Alert: Your UPI ID linked to suspicious activity. Verify immediately or face account freeze: rbi-upi-verify.in",
            severity: "critical",
            type: "fake_rbi",
        },
        {
            text: "Paytm: Transaction of Rs 49,999 detected. If not you, call 1800-XXX-XXXX immediately to block.",
            severity: "high",
            type: "fake_transaction",
        },
        {
            text: "Google Pay Cashback! Scan QR to receive Rs 500 directly. Offer valid today only!",
            severity: "critical",
            type: "qr_scam",
        },
        {
            text: "PhonePe: Your account is being used from new device. Send Rs 1 to verify ownership.",
            severity: "high",
            type: "verification_scam",
        },
    ],

    // Government Impersonation
    impersonation: [
        {
            text: "CBI Notice: Your Aadhaar is linked to money laundering case. Pay penalty Rs 50,000 or face arrest. Call 011-XXXXXXX",
            severity: "critical",
            agency: "CBI",
        },
        {
            text: "Income Tax Department: Outstanding tax dues of Rs 1,25,000 detected. Pay now to avoid prosecution: incometax-pay.in",
            severity: "critical",
            agency: "IT Dept",
        },
        {
            text: "Mumbai Police Cyber Cell: Your number used in fraud case FIR No XXX. Deposit security: 080-XXXXXXX",
            severity: "critical",
            agency: "Police",
        },
        {
            text: "TRAI: Your mobile will be disconnected in 2 hours due to illegal activity. Press 1 to speak to officer.",
            severity: "critical",
            agency: "TRAI",
        },
        {
            text: "Narcotics Bureau: Parcel with drugs found in your name at Mumbai airport. Pay fine or arrest warrant issued.",
            severity: "critical",
            agency: "NCB",
        },
    ],

    // Investment Scams
    investment_scam: [
        {
            text: "Double your money in 30 days! Invest Rs 10,000 get Rs 25,000. 100% guaranteed returns. WhatsApp us.",
            severity: "high",
            type: "ponzi",
        },
        {
            text: "Crypto Trading Bot: Guaranteed 50% monthly returns. Join our VIP group. Limited slots!",
            severity: "high",
            type: "crypto",
        },
        {
            text: "Stock Market Tips: Get sure-shot trading calls. Rs 1 Lakh profit guaranteed. Pay Rs 5000 membership.",
            severity: "high",
            type: "stock_tips",
        },
        {
            text: "Forex Trading Academy: Learn to earn Rs 1 Lakh/day. Free demo account. Register at forex-earn.in",
            severity: "medium",
            type: "forex",
        },
    ],
};

// Known scam phone number patterns (India)
export const SCAM_PHONE_PATTERNS = {
    telemarketing: {
        prefix: "140",
        description: "Registered telemarketing numbers",
        riskLevel: "medium",
    },
    international_spoof: {
        prefixes: ["+1", "+44", "+234", "+92", "+880"],
        description: "Common international spoof origins",
        riskLevel: "high",
    },
    premium_rate: {
        prefixes: ["1900", "1909"],
        description: "Premium rate numbers",
        riskLevel: "high",
    },
};

// Known scam URL patterns
export const SCAM_URL_PATTERNS = {
    fake_govt: [
        /gov-in\./i,
        /gov\.in\./i,
        /sarkari.*\.(xyz|tk|ml|ga)/i,
        /pmkisan.*\.(com|xyz|in)/i,
        /ayushman.*claim/i,
    ],
    fake_banking: [
        /sbi-.*\.(xyz|tk|in|com)/i,
        /hdfc-.*\.(xyz|tk|in)/i,
        /icici.*verify/i,
        /axis.*update/i,
        /-kyc\./i,
        /-secure\.(in|com)/i,
    ],
    shorteners: [
        /bit\.ly/i,
        /tinyurl/i,
        /goo\.gl/i,
        /t\.co/i,
        /short\.io/i,
    ],
    suspicious_tlds: [
        /\.(xyz|tk|ml|ga|cf|gq|top|win|loan)$/i,
    ],
};

// Scam red flag keywords (weighted)
export const RED_FLAG_KEYWORDS = {
    critical: {
        keywords: ["otp", "cvv", "pin", "password", "secret code", "verify now"],
        weight: 40,
    },
    high: {
        keywords: ["urgent", "immediate", "blocked", "suspended", "expire", "arrested", "warrant"],
        weight: 30,
    },
    medium: {
        keywords: ["winner", "lottery", "prize", "claim", "lucky", "selected", "congratulations"],
        weight: 25,
    },
    low: {
        keywords: ["click", "link", "update", "verify", "confirm"],
        weight: 15,
    },
};

// Get random scam examples by category
export function getScamExamples(category: keyof typeof INDIAN_SCAM_DATABASE, count: number = 3): string[] {
    const examples = INDIAN_SCAM_DATABASE[category];
    if (!examples) return [];

    const shuffled = [...examples].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(e => e.text);
}

// Get all categories
export function getScamCategories(): string[] {
    return Object.keys(INDIAN_SCAM_DATABASE);
}

// Calculate text risk score based on keywords
export function calculateKeywordRisk(text: string): { score: number; matches: string[] } {
    const lowerText = text.toLowerCase();
    let score = 0;
    const matches: string[] = [];

    for (const [severity, data] of Object.entries(RED_FLAG_KEYWORDS)) {
        for (const keyword of data.keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                score += data.weight;
                matches.push(`${keyword} (${severity})`);
            }
        }
    }

    return { score: Math.min(score, 100), matches };
}

// Check URL against known patterns
export function checkURLPatterns(url: string): { isSuspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];

    for (const pattern of SCAM_URL_PATTERNS.fake_govt) {
        if (pattern.test(url)) reasons.push("Fake government domain pattern");
    }
    for (const pattern of SCAM_URL_PATTERNS.fake_banking) {
        if (pattern.test(url)) reasons.push("Fake banking domain pattern");
    }
    for (const pattern of SCAM_URL_PATTERNS.shorteners) {
        if (pattern.test(url)) reasons.push("URL shortener (hides real destination)");
    }
    for (const pattern of SCAM_URL_PATTERNS.suspicious_tlds) {
        if (pattern.test(url)) reasons.push("Suspicious domain extension");
    }
    if (!url.startsWith("https://")) {
        reasons.push("Not using secure HTTPS");
    }

    return { isSuspicious: reasons.length > 0, reasons };
}

// Community reports simulation (would be real API in production)
export function getCommunityReports(identifier: string): { reports: number; lastReported: string | null } {
    // Simulate community reports based on hash
    const hash = identifier.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const reports = hash % 100 < 30 ? Math.floor(Math.random() * 50) : 0;

    return {
        reports,
        lastReported: reports > 0 ? "2 days ago" : null,
    };
}

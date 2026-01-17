/**
 * Red Flags Library
 * Educational content about common scam patterns
 */

export interface RedFlagPattern {
    id: string;
    title: string;
    description: string;
    examples: string[];
    howToSpot: string[];
    icon: string;
    severity: "low" | "medium" | "high";
    category: string;
}

export interface GuidanceStep {
    step: number;
    title: string;
    description: string;
    action: string;
    contactInfo?: string;
    urgency: "immediate" | "within_1_hour" | "within_24_hours" | "when_possible";
}

export interface PostScamGuidance {
    scamType: string;
    immediateSteps: GuidanceStep[];
    followUpSteps: GuidanceStep[];
    preventionTips: string[];
    helplineNumbers: { name: string; number: string }[];
}

// Common Red Flag Patterns
export const redFlagPatterns: RedFlagPattern[] = [
    {
        id: "urgency",
        title: "Urgency & Time Pressure",
        description: "Scammers create artificial urgency to make you act without thinking. They use phrases like 'Act now!' or 'Only 2 hours left!'",
        examples: [
            "Your account will be blocked in 24 hours",
            "Offer expires in 30 minutes",
            "Last chance to claim your prize",
            "Immediate action required"
        ],
        howToSpot: [
            "Legitimate organizations give you time to verify",
            "Real deadlines are communicated in advance",
            "Banks never ask for immediate action via SMS"
        ],
        icon: "⏰",
        severity: "high",
        category: "tactics"
    },
    {
        id: "otp_request",
        title: "OTP & Password Requests",
        description: "No legitimate organization will ever ask you to share your OTP, PIN, or password. This is the #1 rule to remember!",
        examples: [
            "Share OTP to verify your account",
            "Enter your password to confirm",
            "Tell us your ATM PIN for verification",
            "Send the code you received"
        ],
        howToSpot: [
            "Banks NEVER ask for OTP on calls",
            "OTP is only meant to be entered by YOU",
            "If someone asks for OTP, it's 100% a scam"
        ],
        icon: "🔐",
        severity: "high",
        category: "requests"
    },
    {
        id: "too_good",
        title: "Too Good To Be True",
        description: "If an offer seems unrealistically good, it probably is. Free money, lottery wins, and guaranteed returns are classic scam bait.",
        examples: [
            "You won Rs 50 Lakhs in lucky draw",
            "Earn Rs 50,000 daily from home",
            "100% guaranteed returns",
            "Free iPhone, just pay shipping"
        ],
        howToSpot: [
            "You can't win a lottery you never entered",
            "No investment has guaranteed returns",
            "Nothing valuable is truly free"
        ],
        icon: "🎁",
        severity: "high",
        category: "offers"
    },
    {
        id: "authority_claim",
        title: "Fake Authority Claims",
        description: "Scammers impersonate banks, police, government officials, or company executives to seem trustworthy.",
        examples: [
            "This is RBI calling about your account",
            "Cyber Police has filed a case against you",
            "Your Income Tax refund is pending",
            "SBI Manager here, verify your details"
        ],
        howToSpot: [
            "Government never calls for money or OTP",
            "Banks communicate through official channels",
            "Verify by calling official numbers yourself"
        ],
        icon: "👔",
        severity: "high",
        category: "impersonation"
    },
    {
        id: "payment_request",
        title: "Unexpected Payment Requests",
        description: "Scammers ask you to pay fees, taxes, or processing charges to receive money or prizes you never applied for.",
        examples: [
            "Pay Rs 5000 to release your lottery",
            "Processing fee required for job offer",
            "Pay customs duty for your gift",
            "Advance payment for loan approval"
        ],
        howToSpot: [
            "Legitimate prizes don't require payment",
            "Jobs don't require you to pay first",
            "If you're receiving money, why pay them?"
        ],
        icon: "💸",
        severity: "high",
        category: "requests"
    },
    {
        id: "suspicious_links",
        title: "Suspicious Links & Websites",
        description: "Scam links often use shortened URLs, misspelled domains, or unusual extensions to hide their true destination.",
        examples: [
            "bit.ly/claim-refund",
            "www.sbi-secure.xyz",
            "amazon-prize.in/winner",
            "govt-scheme-apply.com"
        ],
        howToSpot: [
            "Check for HTTPS and padlock icon",
            "Verify the domain carefully",
            "Official sites use .gov.in for government",
            "When in doubt, don't click"
        ],
        icon: "🔗",
        severity: "medium",
        category: "links"
    },
    {
        id: "personal_info",
        title: "Personal Information Fishing",
        description: "Scammers try to collect your personal data like Aadhaar, PAN, bank details under various pretexts.",
        examples: [
            "Verify your Aadhaar for KYC update",
            "Enter bank details for refund",
            "Share your PAN for ITR processing",
            "Fill this form with your details"
        ],
        howToSpot: [
            "Never share complete Aadhaar/PAN online",
            "Banks already have your KYC details",
            "Use only official apps and websites"
        ],
        icon: "📋",
        severity: "high",
        category: "requests"
    },
    {
        id: "emotional_manipulation",
        title: "Emotional Manipulation",
        description: "Scammers exploit emotions like fear, greed, sympathy, or romance to cloud your judgment.",
        examples: [
            "Your son is in police custody, pay now",
            "I'm stuck abroad, send money urgently",
            "Help me transfer my inheritance",
            "We've been dating online, I need help"
        ],
        howToSpot: [
            "Verify emergencies through direct calls",
            "Never send money to strangers",
            "Take time to think before acting"
        ],
        icon: "💔",
        severity: "medium",
        category: "tactics"
    },
    {
        id: "qr_scam",
        title: "QR Code Scams",
        description: "Scammers use QR codes that redirect to payment pages or phishing sites. Scanning the wrong QR can steal your money.",
        examples: [
            "Scan to receive payment (actually debits)",
            "QR at parking leads to fake UPI",
            "Restaurant QR replaced with scam QR",
            "Scan for cashback (phishing site)"
        ],
        howToSpot: [
            "You don't need to scan QR to RECEIVE money",
            "Verify QR sources before scanning",
            "Check the amount before confirming UPI"
        ],
        icon: "📱",
        severity: "high",
        category: "techniques"
    },
    {
        id: "caller_id_spoofing",
        title: "Caller ID Spoofing",
        description: "Scammers can fake the caller ID to show bank names or official numbers. Don't trust caller ID alone.",
        examples: [
            "Call appears from 'SBI' or bank name",
            "Shows official-looking number",
            "Appears as government office",
            "Shows police station number"
        ],
        howToSpot: [
            "Hang up and call official number yourself",
            "Banks rarely make outbound calls for sensitive matters",
            "Official calls won't ask for OTP"
        ],
        icon: "📞",
        severity: "medium",
        category: "techniques"
    }
];

// Post-Scam Guidance
export const postScamGuidance: Record<string, PostScamGuidance> = {
    payment_scam: {
        scamType: "UPI/Payment Scam",
        immediateSteps: [
            {
                step: 1,
                title: "Call Your Bank Immediately",
                description: "Report the fraudulent transaction to your bank's customer care. They may be able to freeze the transfer.",
                action: "Call bank helpline now",
                contactInfo: "Check your bank's official website for helpline",
                urgency: "immediate"
            },
            {
                step: 2,
                title: "Block Your UPI",
                description: "If you shared UPI PIN or credentials, immediately change your UPI PIN and disable the compromised UPI ID.",
                action: "Open your UPI app and change PIN",
                urgency: "immediate"
            },
            {
                step: 3,
                title: "Report on NPCI",
                description: "File a complaint on NPCI's dispute redressal portal for UPI-related frauds.",
                action: "Visit npci.org.in",
                urgency: "within_1_hour"
            }
        ],
        followUpSteps: [
            {
                step: 4,
                title: "File Cybercrime Complaint",
                description: "Register a formal complaint on the National Cybercrime Reporting Portal.",
                action: "Visit cybercrime.gov.in",
                urgency: "within_24_hours"
            },
            {
                step: 5,
                title: "File FIR",
                description: "Visit your nearest police station to file an FIR. Carry all evidence.",
                action: "Go to police station",
                urgency: "within_24_hours"
            },
            {
                step: 6,
                title: "Preserve Evidence",
                description: "Screenshot all messages, call logs, and transaction details. These are crucial for investigation.",
                action: "Take screenshots",
                urgency: "when_possible"
            }
        ],
        preventionTips: [
            "Never share OTP with anyone",
            "You don't need to scan QR to RECEIVE payment",
            "Verify payment requests through direct calls",
            "Don't click on payment links from unknown sources"
        ],
        helplineNumbers: [
            { name: "Cyber Crime Helpline", number: "1930" },
            { name: "RBI Sachet Portal", number: "sachet.rbi.org.in" },
            { name: "National Consumer Helpline", number: "1915" }
        ]
    },
    phishing: {
        scamType: "Phishing/Account Compromise",
        immediateSteps: [
            {
                step: 1,
                title: "Change All Passwords",
                description: "Immediately change passwords for all accounts, especially banking and email.",
                action: "Change passwords now",
                urgency: "immediate"
            },
            {
                step: 2,
                title: "Enable 2-Factor Authentication",
                description: "Add extra security layer to prevent unauthorized access.",
                action: "Enable 2FA on all accounts",
                urgency: "immediate"
            },
            {
                step: 3,
                title: "Check Recent Account Activity",
                description: "Review recent transactions and login activity for any unauthorized access.",
                action: "Check account statements",
                urgency: "within_1_hour"
            }
        ],
        followUpSteps: [
            {
                step: 4,
                title: "Report to the Impersonated Organization",
                description: "If scammers impersonated a bank or company, report the phishing attempt to them.",
                action: "Contact the real organization",
                urgency: "within_24_hours"
            },
            {
                step: 5,
                title: "Scan for Malware",
                description: "Run antivirus scan on your device if you clicked any links.",
                action: "Run security scan",
                urgency: "within_24_hours"
            }
        ],
        preventionTips: [
            "Always verify sender email addresses",
            "Don't click links in suspicious emails",
            "Type URLs directly in browser",
            "Check for HTTPS before entering credentials"
        ],
        helplineNumbers: [
            { name: "Cyber Crime Helpline", number: "1930" },
            { name: "CERT-In", number: "cert-in.org.in" }
        ]
    },
    job_scam: {
        scamType: "Job/Employment Scam",
        immediateSteps: [
            {
                step: 1,
                title: "Stop All Communication",
                description: "Block the scammer on all platforms. Do not respond to any further messages.",
                action: "Block contact",
                urgency: "immediate"
            },
            {
                step: 2,
                title: "Document Everything",
                description: "Save all job postings, messages, and payment receipts as evidence.",
                action: "Take screenshots",
                urgency: "immediate"
            }
        ],
        followUpSteps: [
            {
                step: 3,
                title: "Report Fake Job Posting",
                description: "Report the fake job to the platform where you found it (LinkedIn, Naukri, etc.)",
                action: "Use platform's report feature",
                urgency: "within_24_hours"
            },
            {
                step: 4,
                title: "File Complaint",
                description: "Report on cybercrime portal if you lost money.",
                action: "Visit cybercrime.gov.in",
                urgency: "within_24_hours"
            },
            {
                step: 5,
                title: "Warn Others",
                description: "Post about the scam to warn other job seekers.",
                action: "Share on social media",
                urgency: "when_possible"
            }
        ],
        preventionTips: [
            "Legitimate jobs never ask for money",
            "Research company on official website",
            "Verify recruiter identity on LinkedIn",
            "Interview via official company channels only"
        ],
        helplineNumbers: [
            { name: "Cyber Crime Helpline", number: "1930" },
            { name: "Labour Ministry", number: "1800-11-0040" }
        ]
    },
    impersonation: {
        scamType: "Police/Authority Impersonation",
        immediateSteps: [
            {
                step: 1,
                title: "Don't Panic - It's a Scam",
                description: "Police and courts never demand money over phone. Take a deep breath and end the call.",
                action: "Hang up immediately",
                urgency: "immediate"
            },
            {
                step: 2,
                title: "Do Not Pay Anything",
                description: "Under no circumstances transfer money. Legitimate authorities use official channels.",
                action: "Do not transfer any money",
                urgency: "immediate"
            }
        ],
        followUpSteps: [
            {
                step: 3,
                title: "Report the Call",
                description: "Report the scam number to cybercrime authorities.",
                action: "Call 1930",
                urgency: "within_1_hour"
            },
            {
                step: 4,
                title: "Verify with Real Police",
                description: "If concerned, visit your local police station in person to verify.",
                action: "Visit police station",
                urgency: "within_24_hours"
            },
            {
                step: 5,
                title: "Block the Number",
                description: "Block the scammer's number and report as spam.",
                action: "Block on phone",
                urgency: "when_possible"
            }
        ],
        preventionTips: [
            "Police never call to demand money",
            "CBI/Cyber Police don't negotiate on phone",
            "Legal notices come by post, not WhatsApp",
            "When in doubt, verify at police station"
        ],
        helplineNumbers: [
            { name: "Cyber Crime Helpline", number: "1930" },
            { name: "Police Emergency", number: "100" },
            { name: "Women Helpline", number: "181" }
        ]
    }
};

// Get guidance for a specific scam type
export function getGuidanceForScamType(type: string): PostScamGuidance | null {
    // Map scam categories to guidance
    const mapping: Record<string, string> = {
        payment_scam: "payment_scam",
        phishing: "phishing",
        job_scam: "job_scam",
        impersonation: "impersonation",
        fake_govt_scheme: "phishing",
        loan_scam: "payment_scam",
        lottery_scam: "payment_scam",
        investment_scam: "payment_scam"
    };

    const guidanceKey = mapping[type] || "phishing";
    return postScamGuidance[guidanceKey] || null;
}

// Get all red flag patterns by category
export function getRedFlagsByCategory(category: string): RedFlagPattern[] {
    return redFlagPatterns.filter(rf => rf.category === category);
}

// Get high severity red flags
export function getHighSeverityRedFlags(): RedFlagPattern[] {
    return redFlagPatterns.filter(rf => rf.severity === "high");
}

// Check text for red flags
export function detectRedFlagsInText(text: string): RedFlagPattern[] {
    const textLower = text.toLowerCase();
    const detectedFlags: RedFlagPattern[] = [];

    for (const pattern of redFlagPatterns) {
        for (const example of pattern.examples) {
            // Check if any keywords from examples appear in text
            const keywords = example.toLowerCase().split(/\s+/).filter(w => w.length > 4);
            const matches = keywords.filter(kw => textLower.includes(kw));

            if (matches.length >= 2) {
                detectedFlags.push(pattern);
                break;
            }
        }
    }

    return detectedFlags;
}

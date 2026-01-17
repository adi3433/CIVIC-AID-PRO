/**
 * Crowd-Sourced Scam Database
 * Community-reported scams for shared intelligence
 */

import { ScamCategory } from "./scamDetection";

export interface ReportedScam {
    id: string;
    type: ScamCategory;
    content: string;
    reportedBy: string;
    reportedAt: Date;
    verifiedCount: number;
    region: string;
    channel: "sms" | "whatsapp" | "email" | "call" | "website" | "qr_code";
    status: "pending" | "verified" | "resolved";
    amountLost?: number;
}

export interface ScamTrend {
    category: ScamCategory;
    count: number;
    percentageChange: number;
    recentExamples: string[];
}

// Mock reported scams database
export const reportedScams: ReportedScam[] = [
    {
        id: "SCM-001",
        type: "fake_govt_scheme",
        content: "PM Kisan: Your Rs 6000 is pending. Update Aadhaar at pmkisan-update.in to receive money.",
        reportedBy: "Anonymous",
        reportedAt: new Date("2026-01-15"),
        verifiedCount: 342,
        region: "Delhi NCR",
        channel: "sms",
        status: "verified"
    },
    {
        id: "SCM-002",
        type: "payment_scam",
        content: "Your UPI refund of Rs 2999 is pending. Complete verification at upi-refund-claim.xyz",
        reportedBy: "RahulK",
        reportedAt: new Date("2026-01-16"),
        verifiedCount: 128,
        region: "Maharashtra",
        channel: "whatsapp",
        status: "verified"
    },
    {
        id: "SCM-003",
        type: "phishing",
        content: "SBI Alert: Your account will be blocked. Update KYC now: bit.ly/sbi-kyc-urgent",
        reportedBy: "PriyaS",
        reportedAt: new Date("2026-01-16"),
        verifiedCount: 567,
        region: "Karnataka",
        channel: "sms",
        status: "verified"
    },
    {
        id: "SCM-004",
        type: "job_scam",
        content: "Amazon hiring! Work from home, earn Rs 5000 daily. No experience needed. WhatsApp: 9876543210",
        reportedBy: "VikramT",
        reportedAt: new Date("2026-01-14"),
        verifiedCount: 89,
        region: "Tamil Nadu",
        channel: "whatsapp",
        status: "verified"
    },
    {
        id: "SCM-005",
        type: "lottery_scam",
        content: "Congratulations! Your mobile number won Rs 25 Lakhs in KBC. Call 140-9999-XXX to claim.",
        reportedBy: "AmitP",
        reportedAt: new Date("2026-01-13"),
        verifiedCount: 1203,
        region: "Uttar Pradesh",
        channel: "call",
        status: "verified"
    },
    {
        id: "SCM-006",
        type: "loan_scam",
        content: "Instant loan approved! Get Rs 5 Lakh in 5 mins. No documents. Apply: easyloan-india.com",
        reportedBy: "SunilM",
        reportedAt: new Date("2026-01-15"),
        verifiedCount: 234,
        region: "Gujarat",
        channel: "sms",
        status: "verified"
    },
    {
        id: "SCM-007",
        type: "impersonation",
        content: "This is Cyber Police. Your Aadhaar is used in money laundering. Transfer Rs 50000 to clear case.",
        reportedBy: "MeenaK",
        reportedAt: new Date("2026-01-16"),
        verifiedCount: 456,
        region: "Telangana",
        channel: "call",
        status: "verified",
        amountLost: 50000
    },
    {
        id: "SCM-008",
        type: "investment_scam",
        content: "Join our trading group. 100% profit guaranteed. Invest 10K, get 1 Lakh in 7 days. WhatsApp now!",
        reportedBy: "RajeshG",
        reportedAt: new Date("2026-01-12"),
        verifiedCount: 678,
        region: "Rajasthan",
        channel: "whatsapp",
        status: "verified",
        amountLost: 100000
    },
    {
        id: "SCM-009",
        type: "payment_scam",
        content: "Electricity Bill: Pay Rs 2340 immediately or power will be cut. Scan QR to pay now.",
        reportedBy: "AnuD",
        reportedAt: new Date("2026-01-17"),
        verifiedCount: 45,
        region: "Punjab",
        channel: "qr_code",
        status: "pending"
    },
    {
        id: "SCM-010",
        type: "phishing",
        content: "HDFC: Unusual activity detected. Verify your account: hdfc-secure-login.in/verify",
        reportedBy: "KiranR",
        reportedAt: new Date("2026-01-17"),
        verifiedCount: 167,
        region: "Kerala",
        channel: "email",
        status: "verified"
    }
];

// Known scam phone numbers (mock database)
export const scamPhoneNumbers: string[] = [
    "140-9999-1234",
    "9876543210",
    "8765432109",
    "+91-9988776655",
    "140-8888-5678",
    "+1-234-567-8900" // International scam
];

// Get trending scam categories
export function getScamTrends(): ScamTrend[] {
    const trends: ScamTrend[] = [
        {
            category: "phishing",
            count: 1234,
            percentageChange: 23,
            recentExamples: [
                "Bank KYC update scams",
                "SBI/HDFC impersonation",
                "PAN card link scams"
            ]
        },
        {
            category: "payment_scam",
            count: 987,
            percentageChange: 45,
            recentExamples: [
                "UPI refund scams",
                "QR code payment frauds",
                "Fake cashback offers"
            ]
        },
        {
            category: "fake_govt_scheme",
            count: 756,
            percentageChange: 12,
            recentExamples: [
                "PM Kisan fraud",
                "Ayushman Bharat fake",
                "Free ration scheme"
            ]
        },
        {
            category: "job_scam",
            count: 543,
            percentageChange: 67,
            recentExamples: [
                "Work from home scams",
                "Amazon hiring fraud",
                "Part-time job offers"
            ]
        },
        {
            category: "investment_scam",
            count: 432,
            percentageChange: 89,
            recentExamples: [
                "Crypto trading scams",
                "Stock market groups",
                "Forex investment fraud"
            ]
        }
    ];

    return trends;
}

// Search for similar scams
export function findSimilarScams(text: string): ReportedScam[] {
    const textLower = text.toLowerCase();

    return reportedScams.filter(scam => {
        const scamLower = scam.content.toLowerCase();
        // Simple word matching
        const words = textLower.split(/\s+/).filter(w => w.length > 3);
        return words.some(word => scamLower.includes(word));
    }).slice(0, 5);
}

// Get recent scams by region
export function getScamsByRegion(region: string): ReportedScam[] {
    return reportedScams
        .filter(scam => scam.region.toLowerCase().includes(region.toLowerCase()))
        .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
}

// Get recent scams by category
export function getScamsByCategory(category: ScamCategory): ReportedScam[] {
    return reportedScams
        .filter(scam => scam.type === category)
        .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
}

// Add new scam report
export function reportNewScam(scam: Omit<ReportedScam, "id" | "reportedAt" | "verifiedCount" | "status">): ReportedScam {
    const newScam: ReportedScam = {
        ...scam,
        id: `SCM-${Date.now().toString(36).toUpperCase()}`,
        reportedAt: new Date(),
        verifiedCount: 0,
        status: "pending"
    };

    reportedScams.unshift(newScam);
    return newScam;
}

// Get total statistics
export function getScamStats(): {
    totalReports: number;
    verifiedScams: number;
    totalMoneySaved: number;
    activeRegions: number;
} {
    return {
        totalReports: reportedScams.length + 4532, // Including historical
        verifiedScams: reportedScams.filter(s => s.status === "verified").length + 3890,
        totalMoneySaved: 12500000 + reportedScams.reduce((sum, s) => sum + (s.amountLost || 0), 0) * 10,
        activeRegions: 28
    };
}

// Get channel statistics
export function getChannelStats(): { channel: string; count: number; percentage: number }[] {
    const channels = ["sms", "whatsapp", "email", "call", "website", "qr_code"];
    const channelData = [
        { channel: "SMS", count: 2345, percentage: 35 },
        { channel: "WhatsApp", count: 1876, percentage: 28 },
        { channel: "Phone Call", count: 1234, percentage: 18 },
        { channel: "Email", count: 654, percentage: 10 },
        { channel: "QR Code", count: 432, percentage: 6 },
        { channel: "Website", count: 201, percentage: 3 }
    ];

    return channelData;
}

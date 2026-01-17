
import { Zap, Droplets, Flame, Wifi, Smartphone, LucideIcon } from "lucide-react";

export type UtilityType = "electricity" | "water" | "gas" | "internet" | "mobile";

export interface Utility {
    id: string;
    type: UtilityType;
    providerName: string;
    consumerId: string;
    nickname?: string;
    color: string;
    icon?: any; // Lucide icon
}

export interface Bill {
    id: string;
    utilityId: string;
    amount: number;
    dueDate: string;
    status: "paid" | "due" | "overdue";
    billDate: string;
    unitsConsumed?: number; // e.g. kWh, Liters
    period: string; // "Jan 2025"
    breakdown?: {
        label: string,
        amount: number
    }[];
}

export interface PaymentProfile {
    utilities: Utility[];
    bills: Bill[];
    totalDue: number;
    safetyScore: number;
}

// Map types to Icons and Colors
export const UTILITY_CONFIG: Record<UtilityType, { label: string, icon: LucideIcon, color: string }> = {
    electricity: { label: "Electricity", icon: Zap, color: "bg-yellow-500" },
    water: { label: "Water", icon: Droplets, color: "bg-blue-500" },
    gas: { label: "Gas", icon: Flame, color: "bg-orange-500" },
    internet: { label: "Internet", icon: Wifi, color: "bg-indigo-500" },
    mobile: { label: "Mobile", icon: Smartphone, color: "bg-green-500" },
};

// --- MOCK DATA ---

const MOCK_UTILITIES: Utility[] = [
    {
        id: "ut_01",
        type: "electricity",
        providerName: "TATA Power",
        consumerId: "9021034567",
        nickname: "Home Electricity",
        color: "bg-yellow-500"
    },
    {
        id: "ut_02",
        type: "water",
        providerName: "Dell Jal Board", // Pun on User name if applicable, or generic
        consumerId: "DJB-456-789",
        color: "bg-blue-500"
    },
    {
        id: "ut_03",
        type: "internet",
        providerName: "Airtel Xstream",
        consumerId: "011-4567890",
        color: "bg-indigo-500"
    }
];

const MOCK_BILLS: Bill[] = [
    // Electricity History
    {
        id: "bill_e1", utilityId: "ut_01", amount: 1450, dueDate: "2025-02-15", status: "due", billDate: "2025-01-20",
        unitsConsumed: 245, period: "Jan 2025",
        breakdown: [{ label: "Energy Charges", amount: 1200 }, { label: "Fixed Charges", amount: 150 }, { label: "Tax", amount: 100 }]
    },
    {
        id: "bill_e2", utilityId: "ut_01", amount: 1320, dueDate: "2025-01-15", status: "paid", billDate: "2024-12-20",
        unitsConsumed: 220, period: "Dec 2024"
    },
    {
        id: "bill_e3", utilityId: "ut_01", amount: 1100, dueDate: "2024-12-15", status: "paid", billDate: "2024-11-20",
        unitsConsumed: 190, period: "Nov 2024"
    },

    // Water History
    {
        id: "bill_w1", utilityId: "ut_02", amount: 450, dueDate: "2025-02-10", status: "due", billDate: "2025-01-25",
        unitsConsumed: 25, period: "Jan 2025"
    },

    // Internet History
    {
        id: "bill_i1", utilityId: "ut_03", amount: 999, dueDate: "2025-02-05", status: "overdue", billDate: "2025-01-05",
        period: "Jan 2025"
    }
];

export const paymentsService = {
    getProfile: async (): Promise<PaymentProfile> => {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 500));

        // Calculate total due
        const totalDue = MOCK_BILLS
            .filter(b => b.status === "due" || b.status === "overdue")
            .reduce((sum, b) => sum + b.amount, 0);

        return {
            utilities: MOCK_UTILITIES,
            bills: MOCK_BILLS, // In real app, might just return recent bills
            totalDue,
            safetyScore: 85 // Mock score
        };
    },

    getUtilityDetails: (id: string) => {
        return MOCK_UTILITIES.find(u => u.id === id);
    },

    getBillHistory: (utilityId: string) => {
        return MOCK_BILLS.filter(b => b.utilityId === utilityId).sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime());
    },

    // Anomaly Detection (Rule Based Fallback)
    checkAnomaly: (bill: Bill, history: Bill[]): string | null => {
        if (!bill.unitsConsumed) return null;
        if (history.length < 2) return null;

        const avgUnits = history.reduce((sum, b) => sum + (b.unitsConsumed || 0), 0) / history.length;
        const diff = bill.unitsConsumed - avgUnits;
        const percentDiff = (diff / avgUnits) * 100;

        if (percentDiff > 30) {
            return `Usage is ${percentDiff.toFixed(0)}% higher than average (${avgUnits.toFixed(0)} units).`;
        }
        return null;
    }
};

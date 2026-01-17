
import { Utility, Bill, UTILITY_CONFIG } from "@/lib/paymentsService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";

interface UtilityCardProps {
    utility: Utility;
    bill?: Bill; // The latest bill
    onClick: () => void;
    onPay: (e: React.MouseEvent) => void;
}

export function UtilityCard({ utility, bill, onClick, onPay }: UtilityCardProps) {
    const config = UTILITY_CONFIG[utility.type];
    const Icon = config.icon;

    const isDue = bill?.status === "due" || bill?.status === "overdue";
    const isOverdue = bill?.status === "overdue";

    return (
        <Card
            onClick={onClick}
            className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all border-l-4"
            style={{ borderLeftColor: isOverdue ? "#ef4444" : isDue ? "#eab308" : "#22c55e" }}
        >
            {/* Icon */}
            <div className={`p-3 rounded-xl ${config.color} text-white shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-foreground truncate">{utility.nickname || config.label}</h3>
                    {bill && (
                        <span className={`font-bold ${isDue ? "text-foreground" : "text-muted-foreground"}`}>
                            ₹{bill.amount}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{utility.providerName}</p>

                <div className="flex items-center gap-2 mt-2">
                    {bill ? (
                        <Badge variant="outline" className={`text-[10px] px-1.5 h-5 ${isOverdue ? "bg-red-50 text-red-700 border-red-200" :
                                isDue ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                    "bg-green-50 text-green-700 border-green-200"
                            }`}>
                            {isOverdue ? "Overdue" : isDue ? "Due Now" : "Paid"}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px]">No bills</Badge>
                    )}

                    {isDue && (
                        <span className="text-[10px] text-red-600 font-medium animate-pulse">
                            Due {bill?.dueDate}
                        </span>
                    )}
                </div>
            </div>

            {/* Action */}
            {isDue ? (
                <Button size="sm" onClick={onPay} className="h-8 px-3 rounded-full">
                    Pay
                </Button>
            ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            )}
        </Card>
    );
}

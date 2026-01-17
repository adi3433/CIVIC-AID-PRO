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

export function UtilityCard({
  utility,
  bill,
  onClick,
  onPay,
}: UtilityCardProps) {
  const config = UTILITY_CONFIG[utility.type];
  const Icon = config.icon;

  const isDue = bill?.status === "due" || bill?.status === "overdue";
  const isOverdue = bill?.status === "overdue";
  const isPaid = bill?.status === "paid";

  return (
    <Card
      variant="elevated"
      size="default"
      onClick={onClick}
      className="cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`p-3 rounded-xl ${config.color} bg-opacity-20 shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {utility.nickname || config.label}
            </h3>
            {bill && (
              <span className="font-bold text-foreground text-lg shrink-0">
                ₹{bill.amount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mb-2">
            {utility.providerName}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {bill ? (
              <>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    isOverdue
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : isDue
                        ? "bg-warning/10 text-warning border-warning/30"
                        : "bg-success/10 text-success border-success/30"
                  }`}
                >
                  {isOverdue ? "Overdue" : isDue ? "Due Now" : "Paid"}
                </Badge>
                {bill.dueDate && isDue && (
                  <span className="text-xs text-muted-foreground">
                    Due {bill.dueDate}
                  </span>
                )}
              </>
            ) : (
              <Badge variant="outline" className="text-xs">
                No bills
              </Badge>
            )}
          </div>
        </div>

        {/* Action */}
        {isDue ? (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPay(e);
            }}
            className="shrink-0"
          >
            Pay
          </Button>
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>
    </Card>
  );
}

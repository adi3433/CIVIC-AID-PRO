import { Construction, Trash2, AlertTriangle, ShieldAlert, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    id: 1,
    title: "Infrastructure",
    subtitle: "Roads, Bridges",
    icon: Construction,
    color: "primary",
    path: "/report",
  },
  {
    id: 2,
    title: "Payments",
    subtitle: "Bills & Utilities",
    icon: CreditCard,
    color: "info",
    path: "/payments",
  },
  {
    id: 3,
    title: "Safety Hazards",
    subtitle: "Lighting, Crime",
    icon: AlertTriangle,
    color: "warning",
    path: "/safety",
  },
  {
    id: 4,
    title: "Scam Alerts",
    subtitle: "Report Fraud",
    icon: ShieldAlert,
    color: "destructive",
    path: "/safety",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Card
            key={action.id}
            variant="interactive"
            size="sm"
            onClick={() => navigate(action.path)}
            className="group"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${action.color === "primary"
                    ? "bg-primary/10"
                    : action.color === "success"
                      ? "bg-success/10"
                      : action.color === "warning"
                        ? "bg-warning/10"
                        : "bg-destructive/10"
                  }`}
              >
                <action.icon
                  className={`w-6 h-6 ${action.color === "primary"
                      ? "text-primary"
                      : action.color === "success"
                        ? "text-success"
                        : action.color === "warning"
                          ? "text-warning"
                          : "text-destructive"
                    }`}
                />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.subtitle}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

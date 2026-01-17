import {
  Construction,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const actions = [
  {
    id: 1,
    titleKey: "quickActions.infrastructure",
    subtitleKey: "quickActions.infrastructure.desc",
    icon: Construction,
    color: "primary",
    path: "/report",
  },
  {
    id: 2,
    titleKey: "quickActions.payments",
    subtitleKey: "quickActions.payments.desc",
    icon: CreditCard,
    color: "info",
    path: "/payments",
  },
  {
    id: 3,
    titleKey: "quickActions.safetyHazards",
    subtitleKey: "quickActions.safetyHazards.desc",
    icon: AlertTriangle,
    color: "warning",
    path: "/safety",
  },
  {
    id: 4,
    titleKey: "quickActions.scamAlerts",
    subtitleKey: "quickActions.scamAlerts.desc",
    icon: ShieldAlert,
    color: "destructive",
    path: "/safety",
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-foreground mb-3">
        {t("home.quickActions")}
      </h2>
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
                className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                  action.color === "primary"
                    ? "bg-primary/10"
                    : action.color === "success"
                      ? "bg-success/10"
                      : action.color === "warning"
                        ? "bg-warning/10"
                        : "bg-destructive/10"
                }`}
              >
                <action.icon
                  className={`w-6 h-6 ${
                    action.color === "primary"
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
                <h3 className="font-medium text-foreground text-sm">
                  {t(action.titleKey)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(action.subtitleKey)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

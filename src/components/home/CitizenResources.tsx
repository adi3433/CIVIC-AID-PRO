import { Book, Building2, MapIcon, ChevronRight, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function CitizenResources() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const resources = [
    {
      id: "library",
      title: t("resources.library"),
      description: t("resources.library.desc"),
      icon: Book,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      iconBg: "bg-blue-500/20",
      path: "/library",
    },
    {
      id: "offices",
      title: t("resources.offices"),
      description: t("resources.offices.desc"),
      icon: Building2,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      iconBg: "bg-purple-500/20",
      path: "/local-offices",
    },
    {
      id: "process",
      title: t("resources.navigator"),
      description: t("resources.navigator.desc"),
      icon: MapIcon,
      color: "bg-green-500/10 text-green-500 border-green-500/30",
      iconBg: "bg-green-500/20",
      path: "/process-navigator",
    },
    {
      id: "anti-bribery",
      title: t("resources.antiBribery"),
      description: t("resources.antiBribery.desc"),
      icon: Shield,
      color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      iconBg: "bg-orange-500/20",
      path: "/anti-bribery",
    },
  ];

  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-foreground mb-3">
        {t("home.citizenResources")}
      </h2>
      <div className="space-y-3">
        {resources.map((resource) => (
          <Card
            key={resource.id}
            variant="interactive"
            className={`cursor-pointer hover:shadow-md transition-shadow ${resource.color}`}
            onClick={() => navigate(resource.path)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${resource.iconBg}`}>
                <resource.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

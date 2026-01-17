import { Book, Building2, MapIcon, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function CitizenResources() {
  const navigate = useNavigate();

  const resources = [
    {
      id: "library",
      title: "Information Library",
      description: "Offline guides & citizen resources",
      icon: Book,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      iconBg: "bg-blue-500/20",
      path: "/library",
    },
    {
      id: "offices",
      title: "Local Offices",
      description: "District offices & contact numbers",
      icon: Building2,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      iconBg: "bg-purple-500/20",
      path: "/local-offices",
    },
    {
      id: "process",
      title: "Process Navigator",
      description: "Track applications & next steps",
      icon: MapIcon,
      color: "bg-green-500/10 text-green-500 border-green-500/30",
      iconBg: "bg-green-500/20",
      path: "/process-navigator",
    },
  ];

  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-foreground mb-3">
        Citizen Resources
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

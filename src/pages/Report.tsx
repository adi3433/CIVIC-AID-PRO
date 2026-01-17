import { useState } from "react";
import { Camera, MapPin, Construction, Trash2, Lightbulb, Droplets, Volume2, CloudRain, ChevronRight, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { id: "pothole", icon: Construction, label: "Potholes", color: "primary" },
  { id: "garbage", icon: Trash2, label: "Garbage", color: "success" },
  { id: "streetlight", icon: Lightbulb, label: "Streetlights", color: "warning" },
  { id: "drainage", icon: CloudRain, label: "Drainage", color: "info" },
  { id: "water", icon: Droplets, label: "Water Leaks", color: "secondary" },
  { id: "noise", icon: Volume2, label: "Noise", color: "destructive" },
];

const myReports = [
  {
    id: 1,
    title: "Large pothole on MG Road",
    category: "Potholes",
    status: "in_progress",
    eta: "2 days",
    date: "Jan 15",
    hasPhotos: true,
  },
  {
    id: 2,
    title: "Garbage pile near school",
    category: "Garbage",
    status: "resolved",
    eta: null,
    date: "Jan 12",
    hasPhotos: true,
  },
  {
    id: 3,
    title: "Broken streetlight",
    category: "Streetlights",
    status: "reported",
    eta: "5 days",
    date: "Jan 10",
    hasPhotos: false,
  },
];

const statusConfig = {
  reported: { label: "Reported", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-info/10 text-info border-info/30", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
};

export default function Report() {
  const [activeTab, setActiveTab] = useState("new");

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Report Issues</h1>
        <p className="text-muted-foreground text-sm mt-1">Help improve your community</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="new">New Report</TabsTrigger>
          <TabsTrigger value="my">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-0">
          <Card variant="primary" className="relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-xl">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-foreground text-lg">Report a New Issue</h3>
                <p className="text-primary-foreground/80 text-sm">Take a photo and we'll help you categorize it</p>
              </div>
              <ChevronRight className="w-6 h-6 text-primary-foreground/80" />
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-foreground/10 rounded-full" />
          </Card>

          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">AI-powered category detection</span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Select Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  variant="interactive"
                  size="sm"
                  className="flex flex-col items-center gap-2 py-4"
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      cat.color === "primary"
                        ? "bg-primary/10"
                        : cat.color === "success"
                        ? "bg-success/10"
                        : cat.color === "warning"
                        ? "bg-warning/10"
                        : cat.color === "info"
                        ? "bg-info/10"
                        : cat.color === "secondary"
                        ? "bg-secondary/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    <cat.icon
                      className={`w-5 h-5 ${
                        cat.color === "primary"
                          ? "text-primary"
                          : cat.color === "success"
                          ? "text-success"
                          : cat.color === "warning"
                          ? "text-warning"
                          : cat.color === "info"
                          ? "text-info"
                          : cat.color === "secondary"
                          ? "text-secondary"
                          : "text-destructive"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">{cat.label}</span>
                </Card>
              ))}
            </div>
          </div>

          <Card variant="default" size="sm" className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Auto-detect Location</p>
              <p className="text-xs text-muted-foreground">Using your current location</p>
            </div>
            <Badge variant="outline" className="text-xs">Enabled</Badge>
          </Card>
        </TabsContent>

        <TabsContent value="my" className="space-y-3 mt-0">
          {myReports.map((report) => {
            const status = statusConfig[report.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            return (
              <Card key={report.id} variant="interactive" size="sm">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {report.hasPhotos ? (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <Construction className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm truncate">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.category} • {report.date}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {report.eta && (
                        <span className="text-xs text-muted-foreground">ETA: {report.eta}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

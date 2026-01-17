import { useState, useRef } from "react";
import { Camera, MapPin, Construction, Trash2, Lightbulb, Droplets, Volume2, CloudRain, ChevronRight, Clock, CheckCircle2, AlertCircle, Sparkles, Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeImageWithAI } from "@/lib/geminiService";
import { Textarea } from "@/components/ui/textarea";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        await analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setAnalyzing(true);
    setDetectedCategory(null);
    try {
      const result = await analyzeImageWithAI(base64);
      setDetectedCategory(result.category);
      setDescription(result.description);
      // Optional: scroll to description or show success toast
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

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

        <TabsContent value="new" className="space-y-4 mt-0 pb-20">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />

          <Card
            variant="primary"
            className="relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-xl">
                {analyzing ? (
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                ) : selectedImage ? (
                  <img src={selectedImage} alt="Selected" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-foreground text-lg">
                  {analyzing ? "Analyzing Image..." : selectedImage ? "Photo Selected" : "Take a Photo"}
                </h3>
                <p className="text-primary-foreground/80 text-sm">
                  {analyzing ? "Identifying issues..." : "AI will detect the issue automatically"}
                </p>
              </div>
              {!analyzing && <ChevronRight className="w-6 h-6 text-primary-foreground/80" />}
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-foreground/10 rounded-full" />
          </Card>

          {analyzing && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center animate-pulse">
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm text-primary font-medium">Vision AI is scanning your photo...</p>
            </div>
          )}

          {detectedCategory && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Issue Detected: {detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1)}</p>
                <p className="text-xs text-green-700 mt-1">We've auto-selected the category for you.</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Select Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  variant="interactive"
                  size="sm"
                  className={`flex flex-col items-center gap-2 py-4 border-2 ${detectedCategory === cat.id ? "border-primary bg-primary/5" : "border-transparent"
                    }`}
                  onClick={() => setDetectedCategory(cat.id)}
                >
                  <div
                    className={`p-2.5 rounded-xl ${cat.color === "primary"
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
                      className={`w-5 h-5 ${cat.color === "primary"
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
                  <span className="text-xs font-medium text-foreground text-center line-clamp-1">{cat.label}</span>
                </Card>
              ))}
            </div>
          </div>

          {description && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Description</h2>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24"
              />
              <div className="flex justify-end">
                <Button className="w-full sm:w-auto">Submit Report</Button>
              </div>
            </div>
          )}

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

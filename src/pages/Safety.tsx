import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  AlertTriangle,
  Shield,
  ChevronRight,
  AlertOctagon,
  Car,
  PhoneCall,
  AlertCircle,
  Navigation,
  Eye,
  EyeOff,
  Lightbulb,
  Share2,
  MapPin,
  BookOpen,
  CheckCircle,
  Loader2,
  Activity,
  TrendingUp,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Digital Safety Components
import { DigitalSafetySection } from "@/components/digital-safety/DigitalSafetySection";

// Heat Map Component
import { HeatMapVisualization } from "@/components/HeatMapVisualization";

// Heat Map Service
import { fetchHeatmapReports, type ReportHeatmapData } from "@/lib/heatmapService";

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const emergencyContacts = [
  { name: "Police", number: "100", color: "destructive" },
  { name: "Ambulance", number: "108", color: "destructive" },
  { name: "Fire", number: "101", color: "warning" },
  { name: "Women Helpline", number: "181", color: "secondary" },
];

// Report categories mapping to visual properties
const REPORT_CATEGORIES = {
  pothole: {
    label: "Potholes",
    icon: AlertCircle,
    color: "#F59E0B",
    emoji: "🕳️",
  },
  garbage: {
    label: "Garbage",
    icon: AlertTriangle,
    color: "#10B981",
    emoji: "🗑️",
  },
  streetlight: {
    label: "Streetlights",
    icon: Lightbulb,
    color: "#FBBF24",
    emoji: "💡",
  },
  drainage: {
    label: "Drainage",
    icon: AlertCircle,
    color: "#3B82F6",
    emoji: "🌊",
  },
  water: {
    label: "Water Leaks",
    icon: AlertCircle,
    color: "#06B6D4",
    emoji: "💧",
  },
  noise: {
    label: "Noise",
    icon: AlertTriangle,
    color: "#EF4444",
    emoji: "🔊",
  },
};

// Real Report Heatmap Canvas Component
const ReportHeatmapCanvas = ({
  width = 300,
  height = 350,
  userLat,
  userLng,
  reports,
  visibleCategories,
}: {
  width: number;
  height: number;
  userLat: number;
  userLng: number;
  reports: ReportHeatmapData[];
  visibleCategories: Record<string, boolean>;
}) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const mapId = "map-container";
    const container = document.getElementById(mapId);

    if (container && !mapRef.current && !container.closest('[role="dialog"]')) {
      try {
        const mapInstance = L.map(mapId).setView([userLat, userLng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapInstance);

        // User location marker
        L.circleMarker([userLat, userLng], {
          radius: 8,
          fillColor: "#60A5FA",
          color: "#3B82F6",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindPopup("Your Location")
          .addTo(mapInstance);

        // Add real report markers
        reports.forEach((report) => {
          if (!visibleCategories[report.category]) return;

          const categoryConfig =
            REPORT_CATEGORIES[report.category as keyof typeof REPORT_CATEGORIES];
          if (!categoryConfig) return;

          // Calculate intensity based on upvotes and duplicates
          const intensity = Math.min(
            0.3 + (report.upvotes * 0.1) + (report.duplicate_count * 0.05),
            1.0
          );

          L.circleMarker([report.latitude, report.longitude], {
            radius: 5 + intensity * 5,
            fillColor: categoryConfig.color,
            color: categoryConfig.color,
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6,
          })
            .bindPopup(
              `${categoryConfig.emoji} ${categoryConfig.label}<br/>` +
              `Upvotes: ${report.upvotes}<br/>` +
              `Status: ${report.status}<br/>` +
              `<small>${new Date(report.created_at).toLocaleDateString()}</small>`,
            )
            .addTo(mapInstance);
        });

        mapRef.current = mapInstance;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLat, userLng, reports, visibleCategories]);

  return (
    <div
      id="map-container"
      data-map-instance="true"
      style={{
        width: "100%",
        height: "350px",
      }}
      className="rounded-lg overflow-hidden border border-border"
    />
  );
};

// Overall Safety Score Component
const SafetyScore = ({
  reports,
  visibleCategories,
}: {
  reports: ReportHeatmapData[];
  visibleCategories: Record<string, boolean>;
}) => {
  // Calculate total hazard based on visible reports
  const visibleReports = reports.filter(r => visibleCategories[r.category]);
  const totalReports = visibleReports.length;
  const totalUpvotes = visibleReports.reduce((sum, r) => sum + r.upvotes, 0);
  const totalDuplicates = visibleReports.reduce((sum, r) => sum + r.duplicate_count, 0);
  
  // Safety score decreases with more reports, upvotes, and duplicates
  const hazardScore = (totalReports * 2) + (totalUpvotes * 0.5) + (totalDuplicates * 0.3);
  const safetyScore = Math.max(0, 100 - hazardScore);
  const safetyLevel =
    safetyScore >= 80
      ? "Very Safe"
      : safetyScore >= 60
        ? "Safe"
        : safetyScore >= 40
          ? "Moderate"
          : safetyScore >= 20
            ? "Risky"
            : "Very Risky";

  const safetyColor =
    safetyScore >= 80
      ? "text-green-500 bg-green-500/10"
      : safetyScore >= 60
        ? "text-blue-500 bg-blue-500/10"
        : safetyScore >= 40
          ? "text-yellow-500 bg-yellow-500/10"
          : safetyScore >= 20
            ? "text-orange-500 bg-orange-500/10"
            : "text-red-500 bg-red-500/10";

  return (
    <div
      className={`rounded-xl p-4 border-2 backdrop-blur-sm bg-card/95 shadow-lg ${safetyColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold opacity-70">Safety Score</p>
          <p className="text-2xl font-bold">{Math.round(safetyScore)}/100</p>
          <p className="text-xs mt-1 opacity-75">{safetyLevel}</p>
        </div>
        <div className="relative w-20 h-20">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${(safetyScore / 100) * 282.7} 282.7`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Safety() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportHeatmapData[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>(
    {
      pothole: true,
      garbage: true,
      streetlight: true,
      drainage: true,
      water: true,
      noise: true,
    },
  );
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const navigate = useNavigate();

  // Get user's current location and fetch real reports
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Fetch real reports from database
          const result = await fetchHeatmapReports(5, latitude, longitude); // 5km radius
          if (result.success && result.reports) {
            setReports(result.reports);
          }
          setLoading(false);

          toast({
            title: "Location Found",
            description: `Loaded ${result.reports?.length || 0} active reports`,
            duration: 2000,
          });
        },
        async (error) => {
          console.error("Geolocation error:", error);
          const fallbackLat = 12.9716;
          const fallbackLng = 77.5946;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng });

          // Fetch reports with fallback location
          const result = await fetchHeatmapReports(5, fallbackLat, fallbackLng);
          if (result.success && result.reports) {
            setReports(result.reports);
          }
          setLoading(false);

          toast({
            title: "Using Fallback Location",
            description: "Enable location for accurate data",
            duration: 3000,
          });
        },
      );
    }
  }, [toast]);

  const toggleCategory = (category: string) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Safety</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Stay informed and protected
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 pb-4">
        <Tabs defaultValue="safety" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="digital">Digital Safety</TabsTrigger>
          </TabsList>

          {/* Safety Tab */}
          <TabsContent value="safety" className="mt-4">
            {/* Interactive Safety Map */}
            <div className="pb-4">
              {loading ? (
                <Card className="relative overflow-hidden h-80 p-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3 mx-auto" />
                    <p className="text-sm text-slate-300">
                      Getting your location...
                    </p>
                  </div>
                </Card>
              ) : userLocation && reports.length > 0 ? (
                <>
                  {/* Real Report Heatmap Canvas */}
                  <div
                    className="bg-card rounded-lg p-4 border border-border mb-4 relative"
                    data-map-wrapper="true"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Map className="w-4 h-4 text-primary" />
                        Civic Reports Map
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300"
                      >
                        {reports.length} Active
                      </Badge>
                    </div>
                    <div className="relative">
                      {!categorySheetOpen && (
                        <ReportHeatmapCanvas
                          width={320}
                          height={350}
                          userLat={userLocation.lat}
                          userLng={userLocation.lng}
                          reports={reports}
                          visibleCategories={visibleCategories}
                        />
                      )}
                      {categorySheetOpen && (
                        <div
                          style={{
                            width: "100%",
                            height: "350px",
                          }}
                          className="rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
                        >
                          <p className="text-sm text-muted-foreground">
                            Map hidden while viewing category info
                          </p>
                        </div>
                      )}
                      {/* Safety Score Overlay */}
                      {!categorySheetOpen && (
                        <div className="absolute bottom-2 right-2 z-[9999]">
                          <SafetyScore
                            reports={reports}
                            visibleCategories={visibleCategories}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      Your Location • 5km Radius • Real-Time Data
                    </p>
                  </div>

                  {/* Category Filter Trigger */}
                  <Card
                    className="bg-card border border-border mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setCategorySheetOpen(true)}
                  >
                    <div className="flex items-center justify-between p-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Report Categories
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="relative overflow-hidden h-44 p-4 bg-gradient-to-br from-yellow-100/50 to-orange-100/50 flex items-center justify-center border border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-800">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-yellow-900 dark:text-yellow-200">
                      Location access denied
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      Enable location to see safety heatmap
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Category Filter Sheet */}
            {userLocation && reports.length > 0 && (
              <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
                <SheetContent
                  className="w-full sm:max-w-md overflow-y-auto"
                  data-category-sheet="true"
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Report Categories
                    </SheetTitle>
                    <SheetDescription>
                      View and filter civic issues by category
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    {Object.entries(REPORT_CATEGORIES).map(([key, category]) => {
                      const categoryReports = reports.filter(r => r.category === key);
                      const visibleCount = visibleCategories[key]
                        ? categoryReports.length
                        : 0;
                      const totalUpvotes = categoryReports.reduce(
                        (sum, r) => sum + r.upvotes,
                        0
                      );
                      const avgUpvotes = categoryReports.length > 0
                        ? (totalUpvotes / categoryReports.length).toFixed(1)
                        : "0";

                      return (
                        <Card
                          key={key}
                          className="bg-card border border-border p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm font-semibold text-foreground">
                                {category.emoji} {category.label}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleCategory(key)}
                              className="p-1 rounded hover:bg-muted transition-colors"
                            >
                              {visibleCategories[key] ? (
                                <Eye className="w-5 h-5 text-primary" />
                              ) : (
                                <EyeOff className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Total Reports
                              </span>
                              <Badge variant="secondary">
                                {categoryReports.length}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Visible
                              </span>
                              <Badge variant="secondary">{visibleCount}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Avg Upvotes
                              </span>
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: `${category.color}20`,
                                  borderColor: category.color,
                                  color: category.color,
                                }}
                              >
                                {avgUpvotes}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Emergency Section */}
            <div className="py-4 pb-8">
              <h2 className="text-base font-semibold text-foreground mb-3">
                Emergency
              </h2>

              {/* SOS Button */}
              <Card
                variant="destructive"
                className="mb-4 border-2 border-destructive"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive-foreground/20 rounded-xl animate-pulse">
                    <AlertOctagon className="w-8 h-8 text-destructive-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive-foreground text-lg">
                      SOS Emergency
                    </h3>
                    <p className="text-destructive-foreground/80 text-sm">
                      Press and hold for 3 seconds
                    </p>
                  </div>
                </div>
              </Card>

              {/* Emergency Features Grid */}
              <div className="space-y-3">
                {/* Emergency Location Sharer */}
                <Card
                  className="bg-card border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    if (userLocation && navigator.share) {
                      const message = `Emergency Alert!\n\nI need help at this location:\n\nLatitude: ${userLocation.lat.toFixed(6)}\nLongitude: ${userLocation.lng.toFixed(6)}\n\nGoogle Maps: https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}\n\nPlease contact me immediately.`;

                      navigator
                        .share({
                          title: "Emergency Location",
                          text: message,
                        })
                        .catch((error) => {
                          console.error("Error sharing:", error);
                          // Fallback: copy to clipboard
                          navigator.clipboard.writeText(message);
                          toast({
                            title: "Location Copied",
                            description:
                              "Emergency location copied to clipboard",
                          });
                        });
                    } else if (userLocation) {
                      // Fallback for browsers without share API
                      const message = `🚨 Emergency Alert!\n\nI need help at this location:\n\nLatitude: ${userLocation.lat.toFixed(6)}\nLongitude: ${userLocation.lng.toFixed(6)}\n\nGoogle Maps: https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}\n\nPlease contact me immediately.`;
                      navigator.clipboard.writeText(message);
                      toast({
                        title: "Location Copied",
                        description:
                          "Emergency location copied to clipboard. Share it with your contacts.",
                      });
                    } else {
                      toast({
                        title: "Location Unavailable",
                        description: "Please enable location services",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Share2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Emergency Location Sharer
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Share your location instantly with emergency contacts
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>

                {/* Safe Shelter Locator */}
                <Card
                  className="bg-card border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate("/safety/shelter-locator")}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Safe Shelter Locator
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Find nearest shelters, hospitals during emergencies
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>

                {/* Emergency Numbers Dictionary */}
                <Card
                  className="bg-card border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate("/safety/emergency-contacts")}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <BookOpen className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Emergency Numbers
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Quick access to all emergency contact numbers
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>

                {/* Safety Check-in */}
                <Card
                  className="bg-card border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate("/safety/check-in")}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Safety Check-in
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Set timed check-ins with auto-alerts for safety
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Heat Map Tab */}
          <TabsContent value="heatmap" className="mt-4 pb-8">
            {userLocation ? (
              <div className="space-y-4">
                {/* Heat Map Header */}
                <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Civic Issue Heat Map
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This real-time visualization shows the density and severity of reported civic issues in your area. 
                    Darker red areas indicate hotspots where multiple citizens have reported the same problem, helping authorities 
                    identify neglected zones that require immediate attention.
                  </p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 gap-3">
                  <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Real-Time Updates</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Heat map automatically refreshes when new reports are submitted or existing ones are upvoted
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Smart Clustering</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reports within 10-20 meters are automatically grouped to identify duplicate issues and problem hotspots
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Priority Detection</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Intensity calculated from report count, upvotes, and duplicates to highlight areas needing urgent action
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Heat Map Visualization */}
                <HeatMapVisualization
                  userLat={userLocation.lat}
                  userLng={userLocation.lng}
                  radiusKm={50}
                  height="500px"
                />

                {/* How to Use */}
                <Card className="p-4 bg-muted/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    How to Use This Heat Map
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Heat Layer:</strong> Color intensity shows problem density - red = high concentration, yellow = lower concentration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Cluster Markers:</strong> Numbered circles show grouped reports - click for detailed breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Toggle Controls:</strong> Show/hide heat layer or clusters independently for clearer visualization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Live Updates:</strong> Map refreshes automatically when new civic issues are reported nearby</span>
                    </li>
                  </ul>
                </Card>

                {/* For Authorities */}
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">For Government Officials & Authorities</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This heat map serves as a civic intelligence tool to help you identify neglected zones, prioritize resource allocation, 
                        and respond more effectively to community needs. Dark red hotspots indicate areas with repeated complaints requiring 
                        immediate attention, particularly in rural or underserved regions where public awareness may be low.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-6 bg-gradient-to-br from-yellow-100/50 to-orange-100/50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Location Required</h3>
                  <p className="text-sm text-muted-foreground">
                    Please enable location services to view the heat map visualization
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Digital Safety Tab */}
          <TabsContent value="digital" className="mt-4 pb-8">
            <DigitalSafetySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

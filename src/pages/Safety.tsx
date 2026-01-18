import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map,
  AlertTriangle,
  Shield,
  ChevronRight,
  AlertOctagon,
  AlertCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Share2,
  MapPin,
  BookOpen,
  CheckCircle,
  Loader2,
  Baby,
  Clock,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Heat Map Service
import {
  fetchHeatmapReports,
  type ReportHeatmapData,
} from "@/lib/heatmapService";

// Alert Service
import { getLatestAlert, type Alert } from "@/lib/alertService";

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
            REPORT_CATEGORIES[
            report.category as keyof typeof REPORT_CATEGORIES
            ];
          if (!categoryConfig) return;

          // Calculate intensity based on upvotes and duplicates
          const intensity = Math.min(
            0.3 + report.upvotes * 0.1 + report.duplicate_count * 0.05,
            1.0,
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
  const visibleReports = reports.filter((r) => visibleCategories[r.category]);
  const totalReports = visibleReports.length;
  const totalUpvotes = visibleReports.reduce((sum, r) => sum + r.upvotes, 0);
  const totalDuplicates = visibleReports.reduce(
    (sum, r) => sum + r.duplicate_count,
    0,
  );

  // Safety score decreases with more reports, upvotes, and duplicates
  const hazardScore =
    totalReports * 2 + totalUpvotes * 0.5 + totalDuplicates * 0.3;
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
      ? "bg-green-500"
      : safetyScore >= 60
        ? "bg-blue-500"
        : safetyScore >= 40
          ? "bg-yellow-500"
          : safetyScore >= 20
            ? "bg-orange-500"
            : "bg-red-500";

  const safetyTextColor =
    safetyScore >= 80
      ? "text-green-700 dark:text-green-300"
      : safetyScore >= 60
        ? "text-blue-700 dark:text-blue-300"
        : safetyScore >= 40
          ? "text-yellow-700 dark:text-yellow-300"
          : safetyScore >= 20
            ? "text-orange-700 dark:text-orange-300"
            : "text-red-700 dark:text-red-300";

  return (
    <div className="w-full bg-card/95 backdrop-blur-sm border-t-2 border-border shadow-lg">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${safetyColor}/10`}>
            <Shield
              className={`w-5 h-5 ${safetyColor.replace("bg-", "text-")}`}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Safety Score
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-xl font-bold ${safetyTextColor}`}>
                {Math.round(safetyScore)}
              </p>
              <p className="text-xs text-muted-foreground">/100</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                {safetyLevel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-xs ml-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${safetyColor} transition-all duration-500`}
              style={{ width: `${safetyScore}%` }}
            />
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
  const [visibleCategories, setVisibleCategories] = useState<
    Record<string, boolean>
  >({
    pothole: true,
    garbage: true,
    streetlight: true,
    drainage: true,
    water: true,
    noise: true,
  });
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [sosHoldProgress, setSosHoldProgress] = useState(0);
  const [sosHolding, setSosHolding] = useState(false);
  const sosTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sosProgressRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [loadingAlert, setLoadingAlert] = useState(false);
  const alertMapRef = useRef<any>(null);

  // Generate dummy reports for demo purposes
  const generateDummyReports = (
    centerLat: number,
    centerLng: number,
  ): ReportHeatmapData[] => {
    const categories = Object.keys(REPORT_CATEGORIES);
    const dummyReports: ReportHeatmapData[] = [];

    // Generate 5-8 dummy reports to keep safety score moderate (50-60 range)
    const numReports = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numReports; i++) {
      // Random offset within ~2km radius (approximately 0.02 degrees)
      const latOffset = (Math.random() - 0.5) * 0.04;
      const lngOffset = (Math.random() - 0.5) * 0.04;

      const category =
        categories[Math.floor(Math.random() * categories.length)];

      // Lower upvotes (0-5) and duplicates (0-2) for moderate severity
      const upvotes = Math.floor(Math.random() * 6);
      const duplicate_count = Math.floor(Math.random() * 3);

      dummyReports.push({
        id: `dummy-${i}`,
        latitude: centerLat + latOffset,
        longitude: centerLng + lngOffset,
        category: category,
        status: ["reported", "in-progress", "resolved"][
          Math.floor(Math.random() * 3)
        ] as "reported" | "in-progress" | "resolved",
        upvotes: upvotes,
        duplicate_count: duplicate_count,
        created_at: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // Random date within last 30 days
      });
    }

    return dummyReports;
  };

  // Get user's current location and fetch real reports
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Fetch real reports from database
          const result = await fetchHeatmapReports(5, latitude, longitude); // 5km radius
          const realReports =
            result.success && result.reports ? result.reports : [];

          // Generate dummy reports for demo
          const dummyReports = generateDummyReports(latitude, longitude);

          // Combine real and dummy reports
          const allReports = [...realReports, ...dummyReports];
          setReports(allReports);
          setLoading(false);

          toast({
            title: "Location Found",
            description: `Loaded ${allReports.length} active reports`,
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
          const realReports =
            result.success && result.reports ? result.reports : [];

          // Generate dummy reports for demo
          const dummyReports = generateDummyReports(fallbackLat, fallbackLng);

          // Combine real and dummy reports
          const allReports = [...realReports, ...dummyReports];
          setReports(allReports);
          setLoading(false);

          toast({
            title: "Using Fallback Location",
            description: `Loaded ${allReports.length} active reports`,
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

  const handleSosStart = () => {
    setSosHolding(true);
    setSosHoldProgress(0);

    // Progress animation (updates every 30ms for smooth animation)
    let progress = 0;
    sosProgressRef.current = setInterval(() => {
      progress += 1;
      setSosHoldProgress(progress);
    }, 30);

    // Trigger emergency call after 3 seconds
    sosTimerRef.current = setTimeout(() => {
      // Clear intervals
      if (sosProgressRef.current) clearInterval(sosProgressRef.current);
      if (sosTimerRef.current) clearTimeout(sosTimerRef.current);

      // Reset state
      setSosHolding(false);
      setSosHoldProgress(0);

      // Trigger phone dialer with emergency number
      window.location.href = "tel:100";
    }, 3000);
  };

  const handleSosEnd = () => {
    // Clear timers
    if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
    if (sosProgressRef.current) clearInterval(sosProgressRef.current);

    // Reset state
    setSosHolding(false);
    setSosHoldProgress(0);
  };

  // Fetch latest alert for child safety
  useEffect(() => {
    const fetchAlert = async () => {
      setLoadingAlert(true);
      const result = await getLatestAlert();
      if (result.success && result.alert) {
        setLatestAlert(result.alert);
      }
      setLoadingAlert(false);
    };

    fetchAlert();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAlert, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize alert map
  useEffect(() => {
    if (latestAlert && latestAlert.latitude && latestAlert.longitude) {
      const mapId = "alert-map-container";
      const container = document.getElementById(mapId);

      if (
        container &&
        !alertMapRef.current &&
        !container.closest('[role="dialog"]')
      ) {
        try {
          const mapInstance = L.map(mapId).setView(
            [latestAlert.latitude, latestAlert.longitude],
            15,
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(mapInstance);

          // Alert marker
          const alertIcon = L.divIcon({
            className: "custom-alert-marker",
            html: '<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([latestAlert.latitude, latestAlert.longitude], {
            icon: alertIcon,
          })
            .bindPopup(
              `<strong>⚠️ ${latestAlert.type.replace("_", " ").toUpperCase()}</strong><br/>` +
              `Confidence: ${(latestAlert.confidence * 100).toFixed(1)}%<br/>` +
              `Time: ${new Date(latestAlert.alert_triggered_at).toLocaleString()}`,
            )
            .addTo(mapInstance)
            .openPopup();

          alertMapRef.current = mapInstance;
        } catch (error) {
          console.error("Error initializing alert map:", error);
        }
      }
    }

    return () => {
      if (alertMapRef.current) {
        alertMapRef.current.remove();
        alertMapRef.current = null;
      }
    };
  }, [latestAlert]);

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
            <TabsTrigger value="safety" data-agent-id="tab-safety-main">Safety</TabsTrigger>
            <TabsTrigger value="child" data-agent-id="tab-child-safety">Child Safety</TabsTrigger>
            <TabsTrigger value="digital" data-agent-id="tab-digital-safety">Digital Safety</TabsTrigger>
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
                      {/* Safety Score Bottom Bar */}
                      {!categorySheetOpen && (
                        <div className="absolute bottom-0 left-0 right-0 z-[9999]">
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
              <Sheet
                open={categorySheetOpen}
                onOpenChange={setCategorySheetOpen}
              >
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
                    {Object.entries(REPORT_CATEGORIES).map(
                      ([key, category]) => {
                        const categoryReports = reports.filter(
                          (r) => r.category === key,
                        );
                        const visibleCount = visibleCategories[key]
                          ? categoryReports.length
                          : 0;
                        const totalUpvotes = categoryReports.reduce(
                          (sum, r) => sum + r.upvotes,
                          0,
                        );
                        const avgUpvotes =
                          categoryReports.length > 0
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
                                <Badge variant="secondary">
                                  {visibleCount}
                                </Badge>
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
                      },
                    )}
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
                className="mb-4 border-2 border-destructive cursor-pointer select-none relative overflow-hidden"
                onMouseDown={handleSosStart}
                onMouseUp={handleSosEnd}
                onMouseLeave={handleSosEnd}
                onTouchStart={handleSosStart}
                onTouchEnd={handleSosEnd}
                data-agent-id="sos-emergency-btn"
              >
                {/* Progress bar */}
                {sosHolding && (
                  <div
                    className="absolute inset-0 bg-destructive-foreground/20 transition-all duration-75"
                    style={{
                      width: `${(sosHoldProgress / 100) * 100}%`,
                    }}
                  />
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-destructive-foreground/20 rounded-xl animate-pulse">
                    <AlertOctagon className="w-8 h-8 text-destructive-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive-foreground text-lg">
                      SOS Emergency
                    </h3>
                    <p className="text-destructive-foreground/80 text-sm">
                      {sosHolding
                        ? `Calling in ${Math.ceil((3000 - sosHoldProgress * 30) / 1000)}s...`
                        : "Press and hold for 3 seconds"}
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
                  data-agent-id="share-location-btn"
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
                  data-agent-id="shelter-locator-btn"
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
                  data-agent-id="emergency-numbers-btn"
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
                  data-agent-id="safety-checkin-btn"
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

          {/* Child Safety Tab */}
          <TabsContent value="child" className="mt-4 pb-8">
            <div className="space-y-4">
              {/* Latest Alert */}
              {loadingAlert ? (
                <Card className="p-8 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Loading latest alert...
                  </p>
                </Card>
              ) : latestAlert ? (
                <>
                  {/* Alert Warning Banner */}
                  <Card className="bg-red-500/10 border-2 border-red-500/50">
                    <div className="flex items-start gap-3 p-4">
                      <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1 animate-pulse" />
                      <div className="flex-1">
                        <h3 className="font-bold text-red-700 dark:text-red-400 text-lg mb-1">
                          ⚠️ WARNING:{" "}
                          {latestAlert.type.replace("_", " ").toUpperCase()}{" "}
                          DETECTED
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-700 dark:text-red-300">
                              Alert triggered:{" "}
                              {new Date(
                                latestAlert.alert_triggered_at,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-700 dark:text-red-300">
                              Confidence:{" "}
                              {(latestAlert.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Alert Location Map */}
                  {latestAlert.latitude && latestAlert.longitude ? (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          Alert Location
                        </h3>
                        <Badge variant="destructive" className="animate-pulse">
                          Active Alert
                        </Badge>
                      </div>
                      <div
                        id="alert-map-container"
                        data-alert-map="true"
                        style={{
                          width: "100%",
                          height: "300px",
                        }}
                        className="rounded-lg overflow-hidden border border-border"
                      />
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Latitude:
                            </span>
                            <span className="font-mono font-semibold">
                              {latestAlert.latitude.toFixed(6)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Longitude:
                            </span>
                            <span className="font-mono font-semibold">
                              {latestAlert.longitude.toFixed(6)}
                            </span>
                          </div>
                          {latestAlert.address && (
                            <div className="flex justify-between items-start mt-2 pt-2 border-t border-border">
                              <span className="text-muted-foreground">
                                Address:
                              </span>
                              <span className="text-right ml-2 font-medium">
                                {latestAlert.address}
                              </span>
                            </div>
                          )}
                          {latestAlert.location_accuracy && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Accuracy:
                              </span>
                              <span className="font-medium">
                                ±{latestAlert.location_accuracy.toFixed(1)}m
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Location data not available for this alert
                      </p>
                    </Card>
                  )}

                  {/* Alert Details */}
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Alert Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">
                          Alert ID
                        </span>
                        <span className="text-xs font-mono text-foreground">
                          {latestAlert.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">
                          Type
                        </span>
                        <Badge variant="destructive">
                          {latestAlert.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">
                          Timestamp
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {new Date(latestAlert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {latestAlert.device_info && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">
                            Device
                          </span>
                          <span className="text-xs text-foreground">
                            {latestAlert.device_info}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    All Clear
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No recent child safety alerts detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    System is actively monitoring for incidents
                  </p>
                </Card>
              )}
            </div>
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

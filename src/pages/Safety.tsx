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

// Hazard types and their properties
const HAZARD_TYPES = {
  potholes: {
    label: "Potholes",
    icon: AlertCircle,
    color: "#F59E0B",
    emoji: "🕳️",
  },
  stray_dogs: {
    label: "Stray Dogs",
    icon: AlertCircle,
    color: "#EF4444",
    emoji: "🐕",
  },
  robbers: {
    label: "Crime Risk",
    icon: AlertTriangle,
    color: "#DC2626",
    emoji: "🚨",
  },
  streetlight: {
    label: "Poor Lighting",
    icon: Lightbulb,
    color: "#FBBF24",
    emoji: "💡",
  },
  accidents: { label: "Accidents", icon: Car, color: "#F97316", emoji: "🚗" },
};

// Generate simulated hazard data around a location
const generateHazardData = (
  lat: number,
  lng: number,
  hazardType: string,
  count: number = 20,
) => {
  const data = [];
  const radiusInDegrees = 0.02; // ~2km radius

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radiusInDegrees;
    const randomLat = lat + distance * Math.cos(angle);
    const randomLng = lng + distance * Math.sin(angle);
    const intensity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0

    data.push({
      lat: randomLat,
      lng: randomLng,
      intensity,
      type: hazardType,
    });
  }
  return data;
};

// Heatmap Canvas Component
const HeatmapCanvas = ({
  width = 300,
  height = 350,
  userLat,
  userLng,
  hazardData,
  visibleHazards,
}: {
  width: number;
  height: number;
  userLat: number;
  userLng: number;
  hazardData: Record<string, any[]>;
  visibleHazards: Record<string, boolean>;
}) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Initialize map with unique ID based on timestamp to avoid conflicts
    const mapId = "map-container";
    const container = document.getElementById(mapId);

    // Ensure we're not initializing inside a sheet/dialog
    if (container && !mapRef.current && !container.closest('[role="dialog"]')) {
      try {
        // Initialize map
        const mapInstance = L.map(mapId).setView([userLat, userLng], 15);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapInstance);

        // Add user location marker
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

        // Add hazard markers
        Object.entries(hazardData).forEach(([hazardType, points]) => {
          if (!visibleHazards[hazardType]) return;

          const hazardConfig =
            HAZARD_TYPES[hazardType as keyof typeof HAZARD_TYPES];
          if (!hazardConfig) return;

          points.forEach((point: any) => {
            L.circleMarker([point.lat, point.lng], {
              radius: 4 + point.intensity * 4,
              fillColor: hazardConfig.color,
              color: hazardConfig.color,
              weight: 1,
              opacity: point.intensity,
              fillOpacity: point.intensity * 0.7,
            })
              .bindPopup(
                `${hazardConfig.emoji} ${hazardConfig.label}<br/>Intensity: ${(point.intensity * 100).toFixed(0)}%`,
              )
              .addTo(mapInstance);
          });
        });

        mapRef.current = mapInstance;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
  }, [userLat, userLng, hazardData, visibleHazards]);

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
  hazardData,
  visibleHazards,
}: {
  hazardData: Record<string, any[]>;
  visibleHazards: Record<string, boolean>;
}) => {
  let totalHazards = 0;
  Object.entries(hazardData).forEach(([hazardType, points]) => {
    if (visibleHazards[hazardType]) {
      totalHazards += points.reduce((sum, p) => sum + p.intensity, 0);
    }
  });

  const safetyScore = Math.max(0, 100 - totalHazards * 3);
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
  const [hazardData, setHazardData] = useState<Record<string, any[]>>({});
  const [visibleHazards, setVisibleHazards] = useState<Record<string, boolean>>(
    {
      potholes: true,
      stray_dogs: true,
      robbers: true,
      streetlight: true,
      accidents: true,
    },
  );
  const [hazardSheetOpen, setHazardSheetOpen] = useState(false);
  const navigate = useNavigate();

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Generate hazard data for each type
          const newHazardData: Record<string, any[]> = {};
          Object.keys(HAZARD_TYPES).forEach((hazardType) => {
            newHazardData[hazardType] = generateHazardData(
              latitude,
              longitude,
              hazardType,
            );
          });
          setHazardData(newHazardData);
          setLoading(false);

          // Show toast notification
          toast({
            title: "Location Found",
            description: `You're at ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
            duration: 2000,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Bangalore coordinates if geolocation fails
          const fallbackLat = 12.9716;
          const fallbackLng = 77.5946;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng });

          const newHazardData: Record<string, any[]> = {};
          Object.keys(HAZARD_TYPES).forEach((hazardType) => {
            newHazardData[hazardType] = generateHazardData(
              fallbackLat,
              fallbackLng,
              hazardType,
            );
          });
          setHazardData(newHazardData);
          setLoading(false);

          // Show fallback location toast
          toast({
            title: "Using Fallback Location",
            description: "Enable location for accurate data",
            duration: 3000,
          });
        },
      );
    }
  }, []);

  const toggleHazard = (hazardType: string) => {
    setVisibleHazards((prev) => ({
      ...prev,
      [hazardType]: !prev[hazardType],
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="safety">Safety</TabsTrigger>
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
              ) : userLocation && Object.keys(hazardData).length > 0 ? (
                <>
                  {/* Heatmap Canvas */}
                  <div
                    className="bg-card rounded-lg p-4 border border-border mb-4 relative"
                    data-map-wrapper="true"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Map className="w-4 h-4 text-primary" />
                        Safety Heatmap
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-300"
                      >
                        Live
                      </Badge>
                    </div>
                    <div className="relative">
                      {!hazardSheetOpen && (
                        <HeatmapCanvas
                          width={320}
                          height={350}
                          userLat={userLocation.lat}
                          userLng={userLocation.lng}
                          hazardData={hazardData}
                          visibleHazards={visibleHazards}
                        />
                      )}
                      {hazardSheetOpen && (
                        <div
                          style={{
                            width: "100%",
                            height: "350px",
                          }}
                          className="rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
                        >
                          <p className="text-sm text-muted-foreground">
                            Map hidden while viewing hazard info
                          </p>
                        </div>
                      )}
                      {/* Safety Score Overlay */}
                      {!hazardSheetOpen && (
                        <div className="absolute bottom-2 right-2 z-[9999]">
                          <SafetyScore
                            hazardData={hazardData}
                            visibleHazards={visibleHazards}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      Your Location • 2km Radius View
                    </p>
                  </div>

                  {/* Hazard Information Trigger */}
                  <Card
                    className="bg-card border border-border mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setHazardSheetOpen(true)}
                  >
                    <div className="flex items-center justify-between p-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Hazard Information
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

            {/* Hazard Information Sheet */}
            {userLocation && Object.keys(hazardData).length > 0 && (
              <Sheet open={hazardSheetOpen} onOpenChange={setHazardSheetOpen}>
                <SheetContent
                  className="w-full sm:max-w-md overflow-y-auto"
                  data-hazard-sheet="true"
                >
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Hazard Information
                    </SheetTitle>
                    <SheetDescription>
                      View and manage hazard layers on the map
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    {Object.entries(HAZARD_TYPES).map(([key, hazard]) => {
                      const hazardPoints = hazardData[key] || [];
                      const visibleCount = visibleHazards[key]
                        ? hazardPoints.length
                        : 0;
                      const avgIntensity =
                        visibleCount > 0
                          ? (
                              (hazardPoints.reduce(
                                (sum, p) => sum + p.intensity,
                                0,
                              ) /
                                hazardPoints.length) *
                              100
                            ).toFixed(0)
                          : 0;

                      return (
                        <Card
                          key={key}
                          className="bg-card border border-border p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: hazard.color }}
                              />
                              <span className="text-sm font-semibold text-foreground">
                                {hazard.label}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleHazard(key)}
                              className="p-1 rounded hover:bg-muted transition-colors"
                            >
                              {visibleHazards[key] ? (
                                <Eye className="w-5 h-5 text-primary" />
                              ) : (
                                <EyeOff className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Total Points
                              </span>
                              <Badge variant="secondary">
                                {hazardPoints.length}
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
                                Avg Intensity
                              </span>
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: `${hazard.color}20`,
                                  borderColor: hazard.color,
                                  color: hazard.color,
                                }}
                              >
                                {avgIntensity}%
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

          {/* Digital Safety Tab */}
          <TabsContent value="digital" className="mt-4 pb-8">
            <DigitalSafetySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

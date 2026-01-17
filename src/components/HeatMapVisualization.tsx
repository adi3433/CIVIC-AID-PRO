import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from "lucide-react";
import {
  fetchHeatmapReports,
  clusterReports,
  subscribeToReportChanges,
  calculateHeatmapStats,
  type ReportHeatmapData,
  type ClusteredReport,
} from "@/lib/heatmapService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface HeatMapVisualizationProps {
  userLat: number;
  userLng: number;
  radiusKm?: number;
  height?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  pothole: "#F59E0B",
  garbage: "#10B981",
  streetlight: "#FBBF24",
  drainage: "#3B82F6",
  water: "#06B6D4",
  noise: "#EF4444",
};

const CATEGORY_LABELS: Record<string, string> = {
  pothole: "Potholes",
  garbage: "Garbage",
  streetlight: "Streetlights",
  drainage: "Drainage",
  water: "Water Leaks",
  noise: "Noise",
};

export const HeatMapVisualization = ({
  userLat,
  userLng,
  radiusKm = 50,
  height = "450px",
}: HeatMapVisualizationProps) => {
  const [reports, setReports] = useState<ReportHeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<ClusteredReport | null>(
    null
  );
  const [stats, setStats] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const clusterMarkersRef = useRef<L.Marker[]>([]);
  const { toast } = useToast();

  // Fetch reports data
  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const result = await fetchHeatmapReports(radiusKm, userLat, userLng);

      if (result.success && result.reports) {
        setReports(result.reports);
        setLastUpdate(new Date());

        // Calculate statistics
        const calculatedStats = calculateHeatmapStats(result.reports);
        setStats(calculatedStats);

        if (showToast) {
          toast({
            title: "Heat Map Updated",
            description: `Loaded ${result.reports.length} active reports`,
            duration: 2000,
          });
        }
      } else {
        console.error("Failed to fetch reports:", result.error);
      }
    } catch (error) {
      console.error("Error fetching heat map data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(false);
  }, [userLat, userLng, radiusKm]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToReportChanges(() => {
      fetchData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [userLat, userLng, radiusKm]);

  // Initialize map
  useEffect(() => {
    if (!userLat || !userLng || mapRef.current) return;

    const mapContainer = document.getElementById("heatmap-container");
    if (!mapContainer) return;

    try {
      // Initialize map
      const map = L.map("heatmap-container", {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: true,
      });

      // Add tile layer with dark theme for better heat map visibility
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `<div style="
          width: 20px; 
          height: 20px; 
          background: #3B82F6; 
          border: 3px solid white; 
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userLat, userLng], { icon: userIcon })
        .bindPopup("<b>Your Location</b>")
        .addTo(map);

      // Add radius circle
      L.circle([userLat, userLng], {
        radius: radiusKm * 1000,
        color: "#3B82F6",
        fillColor: "#3B82F6",
        fillOpacity: 0.05,
        weight: 1,
      }).addTo(map);

      mapRef.current = map;
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLat, userLng, radiusKm]);

  // Update heat map layer
  useEffect(() => {
    if (!mapRef.current || reports.length === 0) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!showHeatmap) return;

    try {
      // Prepare heat map data: [lat, lng, intensity]
      const heatData: [number, number, number][] = reports.map((report) => {
        // Calculate intensity based on upvotes, duplicates, and age
        const baseIntensity = 0.5;
        const upvoteBonus = Math.min(report.upvotes * 0.1, 0.3);
        const duplicateBonus = Math.min(report.duplicate_count * 0.05, 0.2);

        const intensity = Math.min(
          baseIntensity + upvoteBonus + duplicateBonus,
          1.0
        );

        return [report.latitude, report.longitude, intensity];
      });

      // Create heat layer with custom gradient (yellow -> orange -> red)
      const heatLayer = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 20,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: "#FFFF00",
          0.3: "#FFD700",
          0.5: "#FFA500",
          0.7: "#FF4500",
          1.0: "#DC2626",
        },
      });

      heatLayer.addTo(mapRef.current);
      heatLayerRef.current = heatLayer;
    } catch (error) {
      console.error("Error creating heat layer:", error);
    }
  }, [reports, showHeatmap]);

  // Update cluster markers
  useEffect(() => {
    if (!mapRef.current || reports.length === 0) return;

    // Remove existing cluster markers
    clusterMarkersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    clusterMarkersRef.current = [];

    if (!showClusters) return;

    try {
      // Create clusters
      const clusters = clusterReports(reports, 20);

      // Add cluster markers
      clusters.forEach((cluster) => {
        if (!mapRef.current) return;

        // Determine color based on intensity
        const color =
          cluster.intensity > 0.7
            ? "#DC2626"
            : cluster.intensity > 0.5
            ? "#F59E0B"
            : "#FBBF24";

        const size = 30 + cluster.count * 5; // Size grows with count

        const clusterIcon = L.divIcon({
          className: "custom-cluster-marker",
          html: `<div style="
            width: ${size}px; 
            height: ${size}px; 
            background: ${color}; 
            border: 3px solid white; 
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            cursor: pointer;
            animation: pulse 2s infinite;
          ">${cluster.count}</div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
          </style>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([cluster.latitude, cluster.longitude], {
          icon: clusterIcon,
        });

        marker
          .bindPopup(
            `<div style="min-width: 150px;">
              <b>${CATEGORY_LABELS[cluster.category] || cluster.category}</b><br/>
              <strong>${cluster.count}</strong> reports<br/>
              Intensity: <strong>${(cluster.intensity * 100).toFixed(0)}%</strong><br/>
              Avg Upvotes: <strong>${cluster.avgUpvotes.toFixed(1)}</strong><br/>
              <small style="color: #666;">Click for details</small>
            </div>`
          )
          .on("click", () => {
            setSelectedCluster(cluster);
          })
          .addTo(mapRef.current!);

        clusterMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error("Error creating cluster markers:", error);
    }
  }, [reports, showClusters]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading heat map data...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Heat Map Controls */}
      <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-bold text-foreground">
              Real-Time Issue Heat Map
            </h3>
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 animate-pulse"
            >
              Live
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>
            Showing {reports.length} active reports within {radiusKm}km
          </span>
          <span>•</span>
          <span>Updated {lastUpdate.toLocaleTimeString()}</span>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant={showHeatmap ? "default" : "outline"}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="text-xs"
          >
            {showHeatmap ? (
              <Eye className="w-3 h-3 mr-1" />
            ) : (
              <EyeOff className="w-3 h-3 mr-1" />
            )}
            Heat Layer
          </Button>
          <Button
            size="sm"
            variant={showClusters ? "default" : "outline"}
            onClick={() => setShowClusters(!showClusters)}
            className="text-xs"
          >
            {showClusters ? (
              <Eye className="w-3 h-3 mr-1" />
            ) : (
              <EyeOff className="w-3 h-3 mr-1" />
            )}
            Clusters
          </Button>
        </div>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-muted-foreground">
                Hotspots
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.highPriorityAreas.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              High-priority areas
            </p>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-muted-foreground">
                Total Clusters
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalClusters}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.avgReportsPerCluster} reports/cluster
            </p>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <Card className="p-0 overflow-hidden">
        <div
          id="heatmap-container"
          style={{
            width: "100%",
            height: height,
            position: "relative",
          }}
          className="rounded-lg"
        />
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Heat Map Legend
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
            <span className="text-muted-foreground">Low Intensity (1-3 reports)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-muted-foreground">Medium Intensity (4-6 reports)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-muted-foreground">
              High Intensity (7+ reports or high engagement)
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
          <strong>Note:</strong> Heat map automatically updates when new reports
          are submitted or existing reports receive upvotes. Darker colors
          indicate areas requiring immediate attention.
        </p>
      </Card>

      {/* Category Breakdown */}
      {stats && stats.categoryBreakdown && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Issues by Category
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[category] || "#6B7280",
                    }}
                  ></div>
                  <span className="text-sm text-foreground">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </div>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cluster Details Dialog */}
      <Dialog
        open={!!selectedCluster}
        onOpenChange={(open) => !open && setSelectedCluster(null)}
      >
        <DialogContent className="max-w-md">
          {selectedCluster && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Hotspot Details
                </DialogTitle>
                <DialogDescription>
                  Multiple reports in this area
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Cluster Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Reports
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedCluster.count}
                    </p>
                  </Card>
                  <Card className="p-3 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-muted-foreground mb-1">
                      Intensity
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {(selectedCluster.intensity * 100).toFixed(0)}%
                    </p>
                  </Card>
                </div>

                {/* Category & Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[selectedCluster.category] ||
                        selectedCluster.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Avg {selectedCluster.avgUpvotes.toFixed(1)} upvotes
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {selectedCluster.latitude.toFixed(6)},{" "}
                    {selectedCluster.longitude.toFixed(6)}
                  </div>
                </div>

                {/* Individual Reports */}
                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-2">
                    Individual Reports ({selectedCluster.reports.length})
                  </h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCluster.reports.map((report) => (
                      <Card key={report.id} className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                ↑ {report.upvotes}
                              </Badge>
                              {report.duplicate_count > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30"
                                >
                                  {report.duplicate_count} duplicates
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    <strong>Priority Area:</strong> This location has received
                    multiple reports and requires immediate attention from
                    authorities.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

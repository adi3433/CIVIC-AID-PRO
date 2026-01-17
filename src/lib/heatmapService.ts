import { supabase } from "./supabase";

export interface ReportHeatmapData {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  created_at: string;
  status: string;
  upvotes: number;
  downvotes: number;
  duplicate_count: number;
}

export interface ClusteredReport {
  latitude: number;
  longitude: number;
  count: number;
  intensity: number;
  reports: ReportHeatmapData[];
  category: string;
  avgUpvotes: number;
}

/**
 * Haversine formula to calculate distance between two coordinates in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Fetch active reports with their interaction counts for heat map visualization
 */
export const fetchHeatmapReports = async (
  radiusKm: number = 50,
  userLat?: number,
  userLng?: number
): Promise<{ success: boolean; reports?: ReportHeatmapData[]; error?: string }> => {
  try {
    // Fetch reports with status "reported" (active issues only)
    let query = supabase
      .from("reports")
      .select(`
        id,
        latitude,
        longitude,
        category,
        created_at,
        status
      `)
      .eq("status", "reported")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    const { data: reports, error: reportsError } = await query;

    if (reportsError) {
      console.error("Fetch reports error:", reportsError);
      return { success: false, error: reportsError.message };
    }

    if (!reports || reports.length === 0) {
      return { success: true, reports: [] };
    }

    // Fetch interaction counts for each report
    const reportIds = reports.map((r) => r.id);
    const { data: interactions, error: interactionsError } = await supabase
      .from("report_interactions")
      .select("report_id, interaction_type")
      .in("report_id", reportIds);

    if (interactionsError) {
      console.error("Fetch interactions error:", interactionsError);
    }

    // Calculate upvotes and downvotes for each report
    const interactionCounts: Record<
      string,
      { upvotes: number; downvotes: number }
    > = {};

    interactions?.forEach((interaction) => {
      if (!interactionCounts[interaction.report_id]) {
        interactionCounts[interaction.report_id] = {
          upvotes: 0,
          downvotes: 0,
        };
      }
      if (interaction.interaction_type === "upvote") {
        interactionCounts[interaction.report_id].upvotes++;
      } else if (interaction.interaction_type === "downvote") {
        interactionCounts[interaction.report_id].downvotes++;
      }
    });

    // Calculate duplicate counts (reports within 10m of each other)
    const duplicateCounts: Record<string, number> = {};
    reports.forEach((report, index) => {
      let count = 0;
      reports.forEach((otherReport, otherIndex) => {
        if (
          index !== otherIndex &&
          report.category === otherReport.category
        ) {
          const distance = calculateDistance(
            report.latitude!,
            report.longitude!,
            otherReport.latitude!,
            otherReport.longitude!
          );
          if (distance <= 10) {
            // 10 meters
            count++;
          }
        }
      });
      duplicateCounts[report.id] = count;
    });

    // Filter by radius if user location provided
    let filteredReports = reports;
    if (userLat && userLng) {
      filteredReports = reports.filter((report) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          report.latitude!,
          report.longitude!
        );
        return distance <= radiusKm * 1000; // Convert km to meters
      });
    }

    // Combine all data
    const heatmapReports: ReportHeatmapData[] = filteredReports.map(
      (report) => ({
        id: report.id,
        latitude: report.latitude!,
        longitude: report.longitude!,
        category: report.category,
        created_at: report.created_at,
        status: report.status,
        upvotes: interactionCounts[report.id]?.upvotes || 0,
        downvotes: interactionCounts[report.id]?.downvotes || 0,
        duplicate_count: duplicateCounts[report.id] || 0,
      })
    );

    return { success: true, reports: heatmapReports };
  } catch (error) {
    console.error("Fetch heatmap reports error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Cluster reports that are within specified radius (default 20m)
 * This helps identify hotspots where multiple citizens report the same issue
 */
export const clusterReports = (
  reports: ReportHeatmapData[],
  clusterRadiusMeters: number = 20
): ClusteredReport[] => {
  const clusters: ClusteredReport[] = [];
  const processed = new Set<string>();

  reports.forEach((report) => {
    if (processed.has(report.id)) return;

    // Find all reports within cluster radius
    const nearbyReports = reports.filter((other) => {
      if (processed.has(other.id) || report.id === other.id) return false;

      const distance = calculateDistance(
        report.latitude,
        report.longitude,
        other.latitude,
        other.longitude
      );

      return distance <= clusterRadiusMeters && report.category === other.category;
    });

    // Create cluster
    const clusterReports = [report, ...nearbyReports];
    clusterReports.forEach((r) => processed.add(r.id));

    // Calculate cluster center (average coordinates)
    const avgLat =
      clusterReports.reduce((sum, r) => sum + r.latitude, 0) /
      clusterReports.length;
    const avgLng =
      clusterReports.reduce((sum, r) => sum + r.longitude, 0) /
      clusterReports.length;

    // Calculate intensity based on count, upvotes, and duplicates
    const totalUpvotes = clusterReports.reduce((sum, r) => sum + r.upvotes, 0);
    const totalDuplicates = clusterReports.reduce(
      (sum, r) => sum + r.duplicate_count,
      0
    );
    const avgUpvotes = totalUpvotes / clusterReports.length;

    // Intensity formula: weighted combination of count, upvotes, and duplicates
    // Higher values = more intense (deeper red on heat map)
    const countWeight = 0.5;
    const upvoteWeight = 0.3;
    const duplicateWeight = 0.2;

    const normalizedCount = Math.min(clusterReports.length / 10, 1); // Cap at 10 reports
    const normalizedUpvotes = Math.min(avgUpvotes / 5, 1); // Cap at 5 avg upvotes
    const normalizedDuplicates = Math.min(totalDuplicates / 10, 1); // Cap at 10 duplicates

    const intensity =
      normalizedCount * countWeight +
      normalizedUpvotes * upvoteWeight +
      normalizedDuplicates * duplicateWeight;

    clusters.push({
      latitude: avgLat,
      longitude: avgLng,
      count: clusterReports.length,
      intensity: Math.min(intensity, 1), // Cap at 1.0
      reports: clusterReports,
      category: report.category,
      avgUpvotes,
    });
  });

  return clusters;
};

/**
 * Subscribe to real-time report changes
 * Returns unsubscribe function
 */
export const subscribeToReportChanges = (
  callback: () => void
): (() => void) => {
  const channel = supabase
    .channel("report-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "reports",
      },
      () => {
        console.log("Report change detected, refreshing heat map data...");
        callback();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "report_interactions",
      },
      () => {
        console.log("Interaction change detected, refreshing heat map data...");
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Calculate heat map statistics for display
 */
export const calculateHeatmapStats = (reports: ReportHeatmapData[]) => {
  const totalReports = reports.length;
  const categoryBreakdown: Record<string, number> = {};
  const highPriorityAreas: ClusteredReport[] = [];

  reports.forEach((report) => {
    categoryBreakdown[report.category] =
      (categoryBreakdown[report.category] || 0) + 1;
  });

  // Cluster and find high-priority areas (intensity > 0.7)
  const clusters = clusterReports(reports, 20);
  clusters.forEach((cluster) => {
    if (cluster.intensity > 0.7) {
      highPriorityAreas.push(cluster);
    }
  });

  // Sort high-priority areas by intensity
  highPriorityAreas.sort((a, b) => b.intensity - a.intensity);

  return {
    totalReports,
    categoryBreakdown,
    highPriorityAreas: highPriorityAreas.slice(0, 5), // Top 5
    totalClusters: clusters.length,
    avgReportsPerCluster:
      clusters.length > 0
        ? (totalReports / clusters.length).toFixed(1)
        : "0",
  };
};

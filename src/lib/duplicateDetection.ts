/**
 * Duplicate Detection & Issue Clustering Service
 * 
 * This service implements:
 * 1. Radius-based duplicate detection
 * 2. Issue clustering for hotspot identification
 * 3. Geographic proximity calculations
 * 
 * Uses the Haversine formula for accurate distance calculation
 * between GPS coordinates.
 */

import type {
  IssueLocation,
  IssueType,
  IssueCategory,
  NearbyIssue,
  IssueCluster,
  CivicIssue,
} from "@/types/civicIssue";
import { VALIDATION_RULES } from "./issueConfig";

// ============================================
// DISTANCE CALCULATION
// ============================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * 
 * @returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// ============================================
// DUPLICATE DETECTION
// ============================================

interface DuplicateDetectionInput {
  location: IssueLocation;
  issue_type: IssueType;
  created_at: string;
  existing_issues: Array<{
    id: string;
    location: IssueLocation;
    issue_type: IssueType;
    status: string;
    created_at: string;
    title: string;
    photo_url?: string;
  }>;
  radius_meters?: number;
}

interface DuplicateDetectionResult {
  is_duplicate: boolean;
  nearby_issues: NearbyIssue[];
  warning_message?: string;
  recommendation?: string;
}

/**
 * Detect if a new issue is a duplicate of existing issues
 * 
 * Criteria for potential duplicate:
 * 1. Same issue type
 * 2. Within specified radius (default 100m)
 * 3. Not resolved (status != 'resolved')
 * 4. Created within last 30 days
 * 
 * NOTE: This is a soft warning - users can still submit
 */
export function detectDuplicates(
  input: DuplicateDetectionInput
): DuplicateDetectionResult {
  const {
    location,
    issue_type,
    created_at,
    existing_issues,
    radius_meters = VALIDATION_RULES.location.nearbyDuplicateRadiusMeters,
  } = input;

  const nearby: NearbyIssue[] = [];
  const now = new Date(created_at);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Find nearby issues of the same type
  existing_issues.forEach((issue) => {
    // Skip if different issue type
    if (issue.issue_type !== issue_type) return;

    // Skip if resolved
    if (issue.status === "resolved") return;

    // Skip if too old
    const issueDate = new Date(issue.created_at);
    if (issueDate < thirtyDaysAgo) return;

    // Calculate distance
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      issue.location.latitude,
      issue.location.longitude
    );

    // Add to nearby list if within radius
    if (distance <= radius_meters) {
      nearby.push({
        issue_id: issue.id,
        distance_meters: Math.round(distance),
        title: issue.title,
        status: issue.status as any,
        created_at: issue.created_at,
        photo_url: issue.photo_url,
      });
    }
  });

  // Sort by distance
  nearby.sort((a, b) => a.distance_meters - b.distance_meters);

  // Generate warning and recommendation
  let warning_message: string | undefined;
  let recommendation: string | undefined;

  if (nearby.length > 0) {
    const closest = nearby[0];
    warning_message = `Similar issue found ${closest.distance_meters}m away`;
    
    if (nearby.length === 1) {
      recommendation = "You may want to view this existing report before submitting a new one.";
    } else {
      recommendation = `${nearby.length} similar issues found nearby. Consider viewing them before submitting.`;
    }
  }

  return {
    is_duplicate: nearby.length > 0,
    nearby_issues: nearby,
    warning_message,
    recommendation,
  };
}

// ============================================
// ISSUE CLUSTERING
// ============================================

interface ClusteringInput {
  issues: Array<{
    id: string;
    location: IssueLocation;
    issue_type: IssueType;
    category: IssueCategory;
    status: string;
    priority_score: number;
    created_at: string;
  }>;
  min_cluster_size?: number; // Minimum issues to form a cluster
  cluster_radius_meters?: number;
}

/**
 * Cluster nearby issues into hotspots
 * 
 * Uses a simple distance-based clustering algorithm:
 * 1. Group issues of same type within radius
 * 2. Only create cluster if >= min_cluster_size issues
 * 3. Calculate cluster priority based on constituent issues
 * 
 * NOTE: In production, consider using DBSCAN or similar
 * for more sophisticated clustering
 */
export function clusterIssues(input: ClusteringInput): IssueCluster[] {
  const {
    issues,
    min_cluster_size = 3,
    cluster_radius_meters = 200,
  } = input;

  const clusters: IssueCluster[] = [];
  const processed = new Set<string>();

  // Filter out resolved issues
  const activeIssues = issues.filter((i) => i.status !== "resolved");

  // Group by issue type for clustering
  const byType = new Map<IssueType, typeof activeIssues>();
  activeIssues.forEach((issue) => {
    if (!byType.has(issue.issue_type)) {
      byType.set(issue.issue_type, []);
    }
    byType.get(issue.issue_type)!.push(issue);
  });

  // Create clusters for each issue type
  byType.forEach((typeIssues, issueType) => {
    typeIssues.forEach((centerIssue) => {
      // Skip if already in a cluster
      if (processed.has(centerIssue.id)) return;

      // Find all issues within radius
      const clusterIssues = typeIssues.filter((issue) => {
        if (processed.has(issue.id)) return false;

        const distance = calculateDistance(
          centerIssue.location.latitude,
          centerIssue.location.longitude,
          issue.location.latitude,
          issue.location.longitude
        );

        return distance <= cluster_radius_meters;
      });

      // Only create cluster if meets minimum size
      if (clusterIssues.length >= min_cluster_size) {
        // Mark all as processed
        clusterIssues.forEach((issue) => processed.add(issue.id));

        // Calculate cluster center (average location)
        const avgLat =
          clusterIssues.reduce((sum, i) => sum + i.location.latitude, 0) /
          clusterIssues.length;
        const avgLon =
          clusterIssues.reduce((sum, i) => sum + i.location.longitude, 0) /
          clusterIssues.length;

        // Calculate cluster priority (average of constituent issues)
        const avgPriority =
          clusterIssues.reduce((sum, i) => sum + i.priority_score, 0) /
          clusterIssues.length;

        // Create cluster
        const cluster: IssueCluster = {
          cluster_id: generateClusterId(),
          issue_type: issueType,
          center_location: {
            latitude: avgLat,
            longitude: avgLon,
            area: centerIssue.location.area,
          },
          radius_meters: cluster_radius_meters,
          issue_ids: clusterIssues.map((i) => i.id),
          total_reports: clusterIssues.length,
          priority_score: Math.round(avgPriority),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        clusters.push(cluster);
      }
    });
  });

  return clusters;
}

/**
 * Generate unique cluster ID
 */
function generateClusterId(): string {
  return `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// HOTSPOT IDENTIFICATION
// ============================================

/**
 * Identify high-priority hotspots requiring immediate attention
 * 
 * A hotspot is defined as:
 * - Cluster with priority score >= 70
 * - OR cluster with >= 5 reports
 * - OR cluster with any critical severity issues
 */
export function identifyHotspots(
  clusters: IssueCluster[],
  issues: CivicIssue[]
): IssueCluster[] {
  const hotspots = clusters.filter((cluster) => {
    // Check priority score
    if (cluster.priority_score >= 70) return true;

    // Check report count
    if (cluster.total_reports >= 5) return true;

    // Check for critical issues in cluster
    const clusterIssues = issues.filter((issue) =>
      cluster.issue_ids.includes(issue.id)
    );
    const hasCritical = clusterIssues.some(
      (issue) => issue.severity === "critical"
    );
    if (hasCritical) return true;

    return false;
  });

  // Sort by priority score descending
  return hotspots.sort((a, b) => b.priority_score - a.priority_score);
}

// ============================================
// GEOGRAPHIC QUERIES
// ============================================

/**
 * Find all issues within a radius of a location
 */
export function findIssuesInRadius(
  center: { latitude: number; longitude: number },
  radius_meters: number,
  issues: Array<{
    id: string;
    location: IssueLocation;
    [key: string]: any;
  }>
): Array<{ issue: any; distance_meters: number }> {
  const results: Array<{ issue: any; distance_meters: number }> = [];

  issues.forEach((issue) => {
    const distance = calculateDistance(
      center.latitude,
      center.longitude,
      issue.location.latitude,
      issue.location.longitude
    );

    if (distance <= radius_meters) {
      results.push({
        issue,
        distance_meters: Math.round(distance),
      });
    }
  });

  // Sort by distance
  return results.sort((a, b) => a.distance_meters - b.distance_meters);
}

/**
 * Find the nearest issue to a location
 */
export function findNearestIssue(
  location: { latitude: number; longitude: number },
  issues: Array<{
    id: string;
    location: IssueLocation;
    [key: string]: any;
  }>
): { issue: any; distance_meters: number } | null {
  if (issues.length === 0) return null;

  let nearest = issues[0];
  let minDistance = calculateDistance(
    location.latitude,
    location.longitude,
    nearest.location.latitude,
    nearest.location.longitude
  );

  issues.slice(1).forEach((issue) => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      issue.location.latitude,
      issue.location.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = issue;
    }
  });

  return {
    issue: nearest,
    distance_meters: Math.round(minDistance),
  };
}

/**
 * Get formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

// ============================================
// CLUSTER UPDATES
// ============================================

/**
 * Update cluster when a new issue is added
 * Returns updated cluster or null if issue doesn't belong to cluster
 */
export function updateClusterWithNewIssue(
  cluster: IssueCluster,
  newIssue: {
    id: string;
    location: IssueLocation;
    issue_type: IssueType;
    priority_score: number;
  }
): IssueCluster | null {
  // Check if issue type matches
  if (newIssue.issue_type !== cluster.issue_type) return null;

  // Check if within cluster radius
  const distance = calculateDistance(
    cluster.center_location.latitude,
    cluster.center_location.longitude,
    newIssue.location.latitude,
    newIssue.location.longitude
  );

  if (distance > cluster.radius_meters) return null;

  // Add issue to cluster and recalculate
  const updatedIssueIds = [...cluster.issue_ids, newIssue.id];
  const updatedCount = cluster.total_reports + 1;

  // Recalculate average priority
  const oldTotalPriority = cluster.priority_score * cluster.total_reports;
  const newAvgPriority = Math.round(
    (oldTotalPriority + newIssue.priority_score) / updatedCount
  );

  return {
    ...cluster,
    issue_ids: updatedIssueIds,
    total_reports: updatedCount,
    priority_score: newAvgPriority,
    updated_at: new Date().toISOString(),
  };
}

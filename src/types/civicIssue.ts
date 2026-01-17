/**
 * Civic Issue Reporting & Tracking - Type Definitions
 * 
 * This file contains all TypeScript interfaces and enums for the civic issue module.
 * These types ensure type safety across the entire reporting system.
 */

// ============================================
// ISSUE CATEGORIES & TYPES
// ============================================

export type InfrastructureIssueType =
  | "pothole"
  | "broken_road"
  | "streetlight_failure"
  | "drainage_blockage"
  | "footpath_damage"
  | "open_manhole"
  | "broken_manhole"
  | "water_pipeline_leak";

export type CivicAmenityIssueType =
  | "missed_garbage_collection"
  | "overflowing_dustbin"
  | "dirty_public_toilet"
  | "park_maintenance"
  | "broken_playground_equipment";

export type SafetyIssueType =
  | "illegal_construction"
  | "tree_cutting"
  | "public_property_vandalism"
  | "stray_animal_problem";

export type IssueCategory = "infrastructure" | "civic_amenity" | "safety";

export type IssueType = InfrastructureIssueType | CivicAmenityIssueType | SafetyIssueType;

// ============================================
// SEVERITY & STATUS
// ============================================

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export type IssueStatus = "reported" | "acknowledged" | "in_progress" | "resolved";

// ============================================
// LOCATION
// ============================================

export interface IssueLocation {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  ward?: string;
  area?: string;
}

// ============================================
// PHOTO & MEDIA
// ============================================

export interface IssuePhoto {
  id: string;
  url: string;
  thumbnail_url?: string;
  uploaded_at: string;
  type: "before" | "after" | "evidence";
  caption?: string;
}

// ============================================
// STATUS HISTORY
// ============================================

export interface StatusChange {
  status: IssueStatus;
  changed_at: string;
  changed_by: string; // user_id or "system"
  changed_by_name?: string; // For display
  notes?: string;
  photos?: IssuePhoto[];
}

// ============================================
// DUPLICATE DETECTION
// ============================================

export interface NearbyIssue {
  issue_id: string;
  distance_meters: number;
  title: string;
  status: IssueStatus;
  created_at: string;
  photo_url?: string;
}

// ============================================
// PRIORITY SCORING
// ============================================

/**
 * Priority Score Calculation:
 * 
 * Priority = (severity_weight × 40) + (report_count_weight × 30) + (recency_weight × 30)
 * 
 * Where:
 * - severity_weight: 0.25 (low), 0.5 (medium), 0.75 (high), 1.0 (critical)
 * - report_count_weight: min(duplicate_count / 10, 1.0)
 * - recency_weight: 1.0 - (days_since_report / 30) [clamped to 0-1]
 * 
 * Result: 0-100 score
 */
export interface PriorityScore {
  score: number; // 0-100
  severity_component: number;
  report_count_component: number;
  recency_component: number;
  calculated_at: string;
}

// ============================================
// RESOLUTION & VERIFICATION
// ============================================

export interface IssueResolution {
  resolved_at: string;
  resolved_by: string;
  resolution_notes?: string;
  after_photos: IssuePhoto[];
  verification_required: boolean;
  verification_deadline?: string;
}

export interface CitizenVerification {
  verified_at: string;
  verified_by: string; // user_id
  is_resolved: boolean;
  feedback?: string;
  rating?: number; // 1-5
  photos?: IssuePhoto[];
}

// ============================================
// CLUSTER/HOTSPOT
// ============================================

export interface IssueCluster {
  cluster_id: string;
  issue_type: IssueType;
  center_location: IssueLocation;
  radius_meters: number;
  issue_ids: string[];
  total_reports: number;
  priority_score: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// ETA ESTIMATION
// ============================================

export interface EstimatedResolutionTime {
  eta_days: number;
  confidence: "high" | "medium" | "low";
  factors: {
    category_average_days: number;
    priority_adjustment: number;
    seasonal_factor?: number;
  };
  display_text: string; // e.g., "2-3 days", "1 week", "2-4 weeks"
}

// ============================================
// MAIN ISSUE INTERFACE
// ============================================

export interface CivicIssue {
  // Identity
  id: string;
  issue_number: string; // Human-readable like "CIV-2024-00123"
  
  // Classification
  category: IssueCategory;
  issue_type: IssueType;
  severity: IssueSeverity;
  
  // Content
  title: string;
  description?: string;
  
  // Location
  location: IssueLocation;
  
  // Media
  photos: IssuePhoto[];
  
  // Status & Lifecycle
  status: IssueStatus;
  status_history: StatusChange[];
  
  // Ownership
  reported_by: string; // user_id
  reported_by_name?: string;
  is_anonymous: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  
  // Priority & Scoring
  priority_score: PriorityScore;
  
  // Clustering
  cluster_id?: string;
  duplicate_count: number;
  nearby_issues: NearbyIssue[];
  
  // Resolution
  estimated_resolution: EstimatedResolutionTime;
  actual_resolution?: IssueResolution;
  citizen_verification?: CitizenVerification;
  
  // Reopening
  reopen_count: number;
  last_reopened_at?: string;
  
  // Metadata
  tags?: string[];
  department_assigned?: string;
  assignee_id?: string;
  internal_notes?: string; // Only visible to officials
}

// ============================================
// SUBMISSION & FORM DATA
// ============================================

export interface IssueSubmission {
  category: IssueCategory;
  issue_type: IssueType;
  severity: IssueSeverity;
  title: string;
  description?: string;
  location: IssueLocation;
  photos: File[] | string[]; // File objects or URLs
  is_anonymous: boolean;
  tags?: string[];
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

export interface IssueStatistics {
  total_issues: number;
  by_status: Record<IssueStatus, number>;
  by_category: Record<IssueCategory, number>;
  by_severity: Record<IssueSeverity, number>;
  avg_resolution_days: number;
  resolution_rate: number; // percentage
  citizen_satisfaction: number; // average rating
}

// ============================================
// FILTER & SEARCH
// ============================================

export interface IssueFilters {
  category?: IssueCategory;
  issue_type?: IssueType;
  severity?: IssueSeverity;
  status?: IssueStatus;
  date_from?: string;
  date_to?: string;
  location_radius_km?: number;
  center_location?: { latitude: number; longitude: number };
  reported_by_me?: boolean;
}

export interface IssueSortOptions {
  field: "created_at" | "priority_score" | "updated_at" | "severity";
  direction: "asc" | "desc";
}

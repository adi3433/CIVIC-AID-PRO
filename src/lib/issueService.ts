/**
 * Civic Issue Service - Main Data Layer
 * 
 * This service manages all CRUD operations for civic issues,
 * integrating with priority calculation, duplicate detection,
 * and clustering services.
 * 
 * NOTE: Currently uses in-memory storage for demo.
 * In production, integrate with Supabase or your preferred database.
 */

import type {
  CivicIssue,
  IssueSubmission,
  IssueStatus,
  IssueFilters,
  IssueSortOptions,
  StatusChange,
  CitizenVerification,
  IssueResolution,
  IssueStatistics,
} from "@/types/civicIssue";
import { calculatePriorityScore, calculateETA } from "./priorityService";
import { detectDuplicates, clusterIssues } from "./duplicateDetection";
import { uploadPhotos } from "./photoService";

// ============================================
// IN-MEMORY STORAGE (MOCK)
// ============================================

// MOCK: In production, replace with actual database
let issues: CivicIssue[] = [];
let issueCounter = 1;

// ============================================
// ISSUE SUBMISSION
// ============================================

/**
 * Submit a new civic issue
 * 
 * Process:
 * 1. Validate submission
 * 2. Upload photos
 * 3. Detect duplicates
 * 4. Calculate priority score
 * 5. Calculate ETA
 * 6. Generate issue number
 * 7. Save to database
 * 8. Trigger clustering update
 */
export async function submitIssue(
  submission: IssueSubmission,
  userId: string,
  userName?: string
): Promise<{
  success: boolean;
  issue?: CivicIssue;
  error?: string;
  warnings?: string[];
}> {
  try {
    // Validate submission
    const validation = validateSubmission(submission);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const warnings: string[] = [];

    // Generate unique issue ID
    const issueId = generateIssueId();
    const issueNumber = generateIssueNumber();

    // Upload photos
    const photoFiles = submission.photos as File[];
    const uploadedPhotos = await uploadPhotos(photoFiles, issueId, "evidence");

    // Detect duplicates
    const duplicateCheck = detectDuplicates({
      location: submission.location,
      issue_type: submission.issue_type,
      created_at: new Date().toISOString(),
      existing_issues: issues.map((i) => ({
        id: i.id,
        location: i.location,
        issue_type: i.issue_type,
        status: i.status,
        created_at: i.created_at,
        title: i.title,
        photo_url: i.photos[0]?.url,
      })),
    });

    if (duplicateCheck.is_duplicate) {
      warnings.push(
        duplicateCheck.warning_message || "Similar issues found nearby"
      );
      if (duplicateCheck.recommendation) {
        warnings.push(duplicateCheck.recommendation);
      }
    }

    // Calculate priority score
    const priorityScore = calculatePriorityScore({
      severity: submission.severity,
      duplicate_count: duplicateCheck.nearby_issues.length,
      created_at: new Date().toISOString(),
    });

    // Calculate ETA
    const estimatedResolution = calculateETA({
      issue_type: submission.issue_type,
      severity: submission.severity,
      priority_score: priorityScore.score,
      duplicate_count: duplicateCheck.nearby_issues.length,
      created_at: new Date().toISOString(),
    });

    // Create initial status change
    const initialStatus: StatusChange = {
      status: "reported",
      changed_at: new Date().toISOString(),
      changed_by: userId,
      changed_by_name: userName,
      notes: "Issue reported by citizen",
    };

    // Create issue object
    const issue: CivicIssue = {
      id: issueId,
      issue_number: issueNumber,
      category: submission.category,
      issue_type: submission.issue_type,
      severity: submission.severity,
      title: submission.title,
      description: submission.description,
      location: submission.location,
      photos: uploadedPhotos,
      status: "reported",
      status_history: [initialStatus],
      reported_by: userId,
      reported_by_name: submission.is_anonymous ? undefined : userName,
      is_anonymous: submission.is_anonymous,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      priority_score: priorityScore,
      duplicate_count: duplicateCheck.nearby_issues.length,
      nearby_issues: duplicateCheck.nearby_issues,
      estimated_resolution: estimatedResolution,
      reopen_count: 0,
      tags: submission.tags,
    };

    // Save to storage
    issues.push(issue);

    // Trigger clustering update (async, don't wait)
    updateClusters().catch(console.error);

    return {
      success: true,
      issue,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("Failed to submit issue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit issue",
    };
  }
}

// ============================================
// ISSUE RETRIEVAL
// ============================================

/**
 * Get issue by ID
 */
export async function getIssueById(issueId: string): Promise<CivicIssue | null> {
  return issues.find((i) => i.id === issueId) || null;
}

/**
 * Get all issues with optional filtering and sorting
 */
export async function getIssues(
  filters?: IssueFilters,
  sort?: IssueSortOptions,
  limit?: number,
  offset?: number
): Promise<CivicIssue[]> {
  let filtered = [...issues];

  // Apply filters
  if (filters) {
    if (filters.category) {
      filtered = filtered.filter((i) => i.category === filters.category);
    }
    if (filters.issue_type) {
      filtered = filtered.filter((i) => i.issue_type === filters.issue_type);
    }
    if (filters.severity) {
      filtered = filtered.filter((i) => i.severity === filters.severity);
    }
    if (filters.status) {
      filtered = filtered.filter((i) => i.status === filters.status);
    }
    if (filters.date_from) {
      filtered = filtered.filter(
        (i) => new Date(i.created_at) >= new Date(filters.date_from!)
      );
    }
    if (filters.date_to) {
      filtered = filtered.filter(
        (i) => new Date(i.created_at) <= new Date(filters.date_to!)
      );
    }
    if (filters.reported_by_me && filters.reported_by_me) {
      // Note: Would need userId passed in
      // filtered = filtered.filter((i) => i.reported_by === userId);
    }
  }

  // Apply sorting
  if (sort) {
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sort.field) {
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aVal = new Date(a.updated_at).getTime();
          bVal = new Date(b.updated_at).getTime();
          break;
        case "priority_score":
          aVal = a.priority_score.score;
          bVal = b.priority_score.score;
          break;
        case "severity":
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aVal = severityOrder[a.severity];
          bVal = severityOrder[b.severity];
          break;
      }

      return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  } else {
    // Default: sort by priority score descending
    filtered.sort((a, b) => b.priority_score.score - a.priority_score.score);
  }

  // Apply pagination
  if (offset !== undefined && limit !== undefined) {
    filtered = filtered.slice(offset, offset + limit);
  } else if (limit !== undefined) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
}

/**
 * Get issues reported by a specific user
 */
export async function getUserIssues(
  userId: string,
  status?: IssueStatus
): Promise<CivicIssue[]> {
  let userIssues = issues.filter((i) => i.reported_by === userId);

  if (status) {
    userIssues = userIssues.filter((i) => i.status === status);
  }

  // Sort by creation date descending (newest first)
  userIssues.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return userIssues;
}

// ============================================
// STATUS UPDATES
// ============================================

/**
 * Update issue status
 * 
 * Rules:
 * - Status must follow valid transitions
 * - Status changes are immutable (audit trail)
 * - Priority/ETA recalculated on status change
 */
export async function updateIssueStatus(
  issueId: string,
  newStatus: IssueStatus,
  changedBy: string,
  changedByName?: string,
  notes?: string,
  photos?: File[]
): Promise<{ success: boolean; error?: string }> {
  const issue = await getIssueById(issueId);

  if (!issue) {
    return { success: false, error: "Issue not found" };
  }

  // Validate status transition
  // Note: In production, enforce valid transitions based on user role
  if (issue.status === newStatus) {
    return { success: false, error: "Issue already has this status" };
  }

  // Upload photos if provided
  let uploadedPhotos;
  if (photos && photos.length > 0) {
    uploadedPhotos = await uploadPhotos(photos, issueId, "evidence");
  }

  // Create status change record
  const statusChange: StatusChange = {
    status: newStatus,
    changed_at: new Date().toISOString(),
    changed_by: changedBy,
    changed_by_name: changedByName,
    notes,
    photos: uploadedPhotos,
  };

  // Update issue
  issue.status = newStatus;
  issue.status_history.push(statusChange);
  issue.updated_at = new Date().toISOString();

  if (newStatus === "acknowledged") {
    issue.acknowledged_at = new Date().toISOString();
  } else if (newStatus === "resolved") {
    issue.resolved_at = new Date().toISOString();
  }

  // Recalculate priority (status change is a trigger)
  issue.priority_score = calculatePriorityScore({
    severity: issue.severity,
    duplicate_count: issue.duplicate_count,
    created_at: issue.created_at,
  });

  return { success: true };
}

// ============================================
// RESOLUTION & VERIFICATION
// ============================================

/**
 * Mark issue as resolved
 */
export async function resolveIssue(
  issueId: string,
  resolvedBy: string,
  resolutionNotes?: string,
  afterPhotos?: File[]
): Promise<{ success: boolean; error?: string }> {
  const issue = await getIssueById(issueId);

  if (!issue) {
    return { success: false, error: "Issue not found" };
  }

  if (issue.status === "resolved") {
    return { success: false, error: "Issue already resolved" };
  }

  // Upload after photos
  let uploadedPhotos = [];
  if (afterPhotos && afterPhotos.length > 0) {
    uploadedPhotos = await uploadPhotos(afterPhotos, issueId, "after");
  }

  // Create resolution record
  const resolution: IssueResolution = {
    resolved_at: new Date().toISOString(),
    resolved_by: resolvedBy,
    resolution_notes: resolutionNotes,
    after_photos: uploadedPhotos,
    verification_required: true,
    verification_deadline: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days
  };

  // Update status
  const statusResult = await updateIssueStatus(
    issueId,
    "resolved",
    resolvedBy,
    undefined,
    resolutionNotes,
    afterPhotos
  );

  if (!statusResult.success) {
    return statusResult;
  }

  issue.actual_resolution = resolution;

  return { success: true };
}

/**
 * Citizen verification of resolution
 */
export async function verifyResolution(
  issueId: string,
  verifiedBy: string,
  isResolved: boolean,
  feedback?: string,
  rating?: number,
  photos?: File[]
): Promise<{ success: boolean; error?: string }> {
  const issue = await getIssueById(issueId);

  if (!issue) {
    return { success: false, error: "Issue not found" };
  }

  if (issue.status !== "resolved") {
    return { success: false, error: "Issue not marked as resolved yet" };
  }

  // Upload verification photos if provided
  let uploadedPhotos;
  if (photos && photos.length > 0) {
    uploadedPhotos = await uploadPhotos(photos, issueId, "evidence");
  }

  // Create verification record
  const verification: CitizenVerification = {
    verified_at: new Date().toISOString(),
    verified_by: verifiedBy,
    is_resolved: isResolved,
    feedback,
    rating,
    photos: uploadedPhotos,
  };

  issue.citizen_verification = verification;
  issue.updated_at = new Date().toISOString();

  // If citizen says not resolved, reopen issue
  if (!isResolved) {
    await reopenIssue(issueId, verifiedBy, "Citizen verification: Issue not resolved");
  }

  return { success: true };
}

/**
 * Reopen a resolved issue
 */
export async function reopenIssue(
  issueId: string,
  reopenedBy: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const issue = await getIssueById(issueId);

  if (!issue) {
    return { success: false, error: "Issue not found" };
  }

  if (issue.status !== "resolved") {
    return { success: false, error: "Only resolved issues can be reopened" };
  }

  // Update status back to reported
  const statusResult = await updateIssueStatus(
    issueId,
    "reported",
    reopenedBy,
    undefined,
    `Issue reopened: ${reason || "Not resolved"}`
  );

  if (!statusResult.success) {
    return statusResult;
  }

  issue.reopen_count += 1;
  issue.last_reopened_at = new Date().toISOString();

  // Clear resolution data
  issue.actual_resolution = undefined;
  issue.citizen_verification = undefined;
  issue.resolved_at = undefined;

  return { success: true };
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get issue statistics
 */
export async function getIssueStatistics(
  filters?: IssueFilters
): Promise<IssueStatistics> {
  const filtered = await getIssues(filters);

  const stats: IssueStatistics = {
    total_issues: filtered.length,
    by_status: {
      reported: 0,
      acknowledged: 0,
      in_progress: 0,
      resolved: 0,
    },
    by_category: {
      infrastructure: 0,
      civic_amenity: 0,
      safety: 0,
    },
    by_severity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    avg_resolution_days: 0,
    resolution_rate: 0,
    citizen_satisfaction: 0,
  };

  let totalResolutionDays = 0;
  let resolvedCount = 0;
  let totalRating = 0;
  let ratingCount = 0;

  filtered.forEach((issue) => {
    // Count by status
    stats.by_status[issue.status]++;

    // Count by category
    stats.by_category[issue.category]++;

    // Count by severity
    stats.by_severity[issue.severity]++;

    // Calculate resolution time
    if (issue.resolved_at) {
      resolvedCount++;
      const createdDate = new Date(issue.created_at);
      const resolvedDate = new Date(issue.resolved_at);
      const days =
        (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      totalResolutionDays += days;
    }

    // Collect ratings
    if (issue.citizen_verification?.rating) {
      totalRating += issue.citizen_verification.rating;
      ratingCount++;
    }
  });

  // Calculate averages
  stats.avg_resolution_days =
    resolvedCount > 0 ? Math.round(totalResolutionDays / resolvedCount) : 0;
  stats.resolution_rate =
    filtered.length > 0 ? Math.round((resolvedCount / filtered.length) * 100) : 0;
  stats.citizen_satisfaction =
    ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;

  return stats;
}

// ============================================
// HELPERS
// ============================================

function validateSubmission(
  submission: IssueSubmission
): { valid: boolean; error?: string } {
  if (!submission.title || submission.title.length < 10) {
    return { valid: false, error: "Title must be at least 10 characters" };
  }

  if (!submission.location) {
    return { valid: false, error: "Location is required" };
  }

  if (!submission.photos || submission.photos.length === 0) {
    return { valid: false, error: "At least one photo is required" };
  }

  return { valid: true };
}

function generateIssueId(): string {
  return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateIssueNumber(): string {
  const year = new Date().getFullYear();
  const number = String(issueCounter++).padStart(5, "0");
  return `CIV-${year}-${number}`;
}

async function updateClusters(): Promise<void> {
  // TODO: Implement clustering update
  // This would recalculate clusters when new issues are added
  const clusters = clusterIssues({
    issues: issues.map(i => ({
      id: i.id,
      location: i.location,
      issue_type: i.issue_type,
      category: i.category,
      status: i.status,
      priority_score: i.priority_score.score,
      created_at: i.created_at,
    })),
  });
  console.log("Clusters updated:", clusters.length);
}

// ============================================
// SEED DATA (DEMO)
// ============================================

/**
 * Generate seed data for demo purposes
 */
export async function seedDemoData(): Promise<void> {
  // Only seed if empty
  if (issues.length > 0) return;

  const demoSubmissions: IssueSubmission[] = [
    {
      category: "infrastructure",
      issue_type: "pothole",
      severity: "high",
      title: "Large pothole on MG Road causing traffic issues",
      description: "Deep pothole approximately 2 feet wide near the intersection",
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "MG Road, Bangalore",
        area: "Central Business District",
      },
      photos: [], // Mock empty for now
      is_anonymous: false,
    },
    {
      category: "civic_amenity",
      issue_type: "overflowing_dustbin",
      severity: "medium",
      title: "Overflowing garbage bin near school",
      description: "Public dustbin has been overflowing for 3 days",
      location: {
        latitude: 12.9698,
        longitude: 77.5983,
        address: "Brigade Road, Bangalore",
        area: "Brigade Road",
      },
      photos: [],
      is_anonymous: false,
    },
  ];

  // Create mock issues
  // Note: In real implementation, this would properly upload photos
  console.log("Demo data seeding would happen here");
}

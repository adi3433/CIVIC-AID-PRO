/**
 * Priority Scoring & ETA Estimation Service
 * 
 * This service implements the smart issue handling logic for:
 * 1. Priority score calculation
 * 2. Estimated resolution time (ETA) calculation
 * 3. Dynamic adjustments based on multiple factors
 * 
 * PRIORITY SCORE FORMULA:
 * Priority = (severity_weight × 40) + (report_count_weight × 30) + (recency_weight × 30)
 * 
 * Where:
 * - severity_weight: 0.25 (low), 0.5 (medium), 0.75 (high), 1.0 (critical)
 * - report_count_weight: min(duplicate_count / 10, 1.0)
 * - recency_weight: 1.0 - (days_since_report / 30) [clamped to 0-1]
 * 
 * Result: 0-100 score
 */

import type {
  IssueSeverity,
  IssueType,
  PriorityScore,
  EstimatedResolutionTime,
} from "@/types/civicIssue";
import { SEVERITY_LEVELS, getIssueTypeConfig } from "./issueConfig";

// ============================================
// PRIORITY CALCULATION
// ============================================

interface PriorityCalculationInput {
  severity: IssueSeverity;
  duplicate_count: number;
  created_at: string;
}

/**
 * Calculate priority score for an issue
 * 
 * This is the core algorithm that determines issue urgency
 * based on severity, number of duplicate reports, and how recent the issue is.
 */
export function calculatePriorityScore(
  input: PriorityCalculationInput
): PriorityScore {
  const { severity, duplicate_count, created_at } = input;

  // Component 1: Severity weight (0-1)
  const severityWeight = SEVERITY_LEVELS[severity].weight;

  // Component 2: Report count weight (0-1)
  // More duplicate reports = higher priority
  // Caps at 10 reports (100% weight)
  const reportCountWeight = Math.min(duplicate_count / 10, 1.0);

  // Component 3: Recency weight (0-1)
  // Recent issues get higher priority
  // Weight decreases linearly over 30 days
  const createdDate = new Date(created_at);
  const now = new Date();
  const daysSinceReport =
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyWeight = Math.max(0, Math.min(1, 1.0 - daysSinceReport / 30));

  // Calculate weighted components
  const severityComponent = severityWeight * 40;
  const reportCountComponent = reportCountWeight * 30;
  const recencyComponent = recencyWeight * 30;

  // Total priority score (0-100)
  const score = Math.round(
    severityComponent + reportCountComponent + recencyComponent
  );

  return {
    score: Math.max(0, Math.min(100, score)), // Clamp to 0-100
    severity_component: Math.round(severityComponent),
    report_count_component: Math.round(reportCountComponent),
    recency_component: Math.round(recencyComponent),
    calculated_at: new Date().toISOString(),
  };
}

// ============================================
// ETA CALCULATION
// ============================================

interface ETACalculationInput {
  issue_type: IssueType;
  severity: IssueSeverity;
  priority_score: number;
  duplicate_count: number;
  created_at: string;
}

/**
 * Calculate estimated resolution time for an issue
 * 
 * ETA is based on:
 * 1. Historical average for this issue type
 * 2. Severity-based response time multiplier
 * 3. Priority score adjustment
 * 4. Seasonal factors (optional, mocked for now)
 * 
 * NOTE: In production, this should use actual historical data
 * from resolved issues in the database.
 */
export function calculateETA(input: ETACalculationInput): EstimatedResolutionTime {
  const { issue_type, severity, priority_score, duplicate_count, created_at } =
    input;

  // Get base resolution time from issue type configuration
  const issueConfig = getIssueTypeConfig(issue_type);
  const baseResolutionDays = issueConfig.typical_resolution_days;

  // Apply severity-based response time multiplier
  const severityMultiplier = SEVERITY_LEVELS[severity].response_time_multiplier;

  // Apply priority-based adjustment
  // Higher priority = faster resolution
  // Priority score of 80+ reduces time by 30%
  // Priority score of 60-79 reduces time by 15%
  // Priority score below 60 has no reduction
  let priorityAdjustment = 0;
  if (priority_score >= 80) {
    priorityAdjustment = -0.3;
  } else if (priority_score >= 60) {
    priorityAdjustment = -0.15;
  }

  // Apply duplicate count factor
  // Multiple reports can speed up response (attention factor)
  const duplicateFactor = duplicate_count >= 5 ? -0.1 : 0;

  // Calculate adjusted ETA
  const adjustedDays = Math.max(
    1, // Minimum 1 day
    Math.round(
      baseResolutionDays *
        severityMultiplier *
        (1 + priorityAdjustment) *
        (1 + duplicateFactor)
    )
  );

  // Determine confidence level
  // NOTE: In production, confidence should be based on
  // historical accuracy of ETA predictions
  let confidence: "high" | "medium" | "low";
  if (duplicate_count >= 3 || priority_score >= 70) {
    confidence = "high";
  } else if (duplicate_count >= 1 || priority_score >= 40) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  // Generate display text
  const displayText = generateETADisplayText(adjustedDays, confidence);

  return {
    eta_days: adjustedDays,
    confidence,
    factors: {
      category_average_days: baseResolutionDays,
      priority_adjustment: priorityAdjustment,
      seasonal_factor: 1.0, // TODO: Implement seasonal adjustments
    },
    display_text: displayText,
  };
}

/**
 * Generate human-friendly ETA display text
 */
function generateETADisplayText(days: number, confidence: "high" | "medium" | "low"): string {
  let text = "";

  if (days === 1) {
    text = "1 day";
  } else if (days <= 3) {
    text = `${days} days`;
  } else if (days <= 7) {
    text = "3-7 days";
  } else if (days <= 14) {
    text = "1-2 weeks";
  } else if (days <= 30) {
    text = "2-4 weeks";
  } else {
    text = "1+ month";
  }

  // Add confidence qualifier for lower confidence predictions
  if (confidence === "low") {
    text = `~${text} (estimated)`;
  }

  return text;
}

// ============================================
// RECALCULATION TRIGGERS
// ============================================

/**
 * Determine if priority score should be recalculated
 * 
 * Recalculation is triggered by:
 * - New duplicate reports
 * - Status changes
 * - Passage of time (daily recalculation)
 * - Manual override by officials
 */
export function shouldRecalculatePriority(
  lastCalculatedAt: string,
  duplicateCountChanged: boolean,
  statusChanged: boolean
): boolean {
  const lastCalc = new Date(lastCalculatedAt);
  const now = new Date();
  const hoursSinceCalc = (now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60);

  // Recalculate if:
  // 1. Duplicate count changed (immediate)
  // 2. Status changed (immediate)
  // 3. More than 24 hours since last calculation
  return duplicateCountChanged || statusChanged || hoursSinceCalc >= 24;
}

// ============================================
// BATCH RECALCULATION
// ============================================

/**
 * Batch recalculate priorities for multiple issues
 * Used for periodic updates or after system changes
 */
export function batchRecalculatePriorities(
  issues: Array<{
    id: string;
    severity: IssueSeverity;
    duplicate_count: number;
    created_at: string;
  }>
): Map<string, PriorityScore> {
  const results = new Map<string, PriorityScore>();

  issues.forEach((issue) => {
    const priority = calculatePriorityScore({
      severity: issue.severity,
      duplicate_count: issue.duplicate_count,
      created_at: issue.created_at,
    });
    results.set(issue.id, priority);
  });

  return results;
}

// ============================================
// PRIORITY THRESHOLDS
// ============================================

/**
 * Categorize priority score into actionable levels
 */
export function getPriorityLevel(score: number): "urgent" | "high" | "normal" | "low" {
  if (score >= 80) return "urgent";
  if (score >= 60) return "high";
  if (score >= 40) return "normal";
  return "low";
}

/**
 * Get recommended action timeframe based on priority
 */
export function getRecommendedActionTimeframe(score: number): string {
  const level = getPriorityLevel(score);
  switch (level) {
    case "urgent":
      return "Action required within 24 hours";
    case "high":
      return "Action required within 3 days";
    case "normal":
      return "Action required within 1 week";
    case "low":
      return "Action required within 2 weeks";
  }
}

// ============================================
// HISTORICAL TRACKING (MOCK)
// ============================================

/**
 * MOCK: Get historical average resolution time for issue type
 * 
 * In production, this should query the database for:
 * - Resolved issues of this type
 * - Average time from creation to resolution
 * - Grouped by severity level
 * - Filtered by last 6 months for relevance
 */
export async function getHistoricalAverageResolutionTime(
  issueType: IssueType,
  severity: IssueSeverity
): Promise<number> {
  // MOCK IMPLEMENTATION
  // In production: Query database for actual historical data
  
  const issueConfig = getIssueTypeConfig(issueType);
  const severityMultiplier = SEVERITY_LEVELS[severity].response_time_multiplier;
  
  // Simulate slight variation from typical time
  const variation = Math.random() * 0.2 - 0.1; // ±10%
  return Math.round(
    issueConfig.typical_resolution_days * severityMultiplier * (1 + variation)
  );
}

/**
 * Civic Issue Configuration
 * 
 * Centralized configuration for all issue types, categories, severity levels,
 * and display information. This provides the single source of truth for
 * issue categorization and metadata.
 */

import {
  Construction,
  Lightbulb,
  Droplets,
  CloudRain,
  Trash2,
  TreeDeciduous,
  AlertTriangle,
  Home,
  Shield,
  ParkingCircle,
  type LucideIcon,
} from "lucide-react";
import type {
  IssueCategory,
  IssueType,
  IssueSeverity,
  IssueStatus,
  InfrastructureIssueType,
  CivicAmenityIssueType,
  SafetyIssueType,
} from "@/types/civicIssue";

// ============================================
// ISSUE TYPE METADATA
// ============================================

interface IssueTypeMetadata {
  id: IssueType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: IssueCategory;
  typical_resolution_days: number;
  priority_multiplier: number; // Affects ETA calculation
  requires_photo: boolean;
  keywords: string[]; // For auto-categorization
}

// Infrastructure Issues
const infrastructureIssues: Record<InfrastructureIssueType, IssueTypeMetadata> = {
  pothole: {
    id: "pothole",
    label: "Pothole",
    description: "Road surface holes causing vehicle damage",
    icon: Construction,
    color: "orange",
    category: "infrastructure",
    typical_resolution_days: 5,
    priority_multiplier: 1.2,
    requires_photo: true,
    keywords: ["pothole", "hole", "road", "damage", "crater", "pit"],
  },
  broken_road: {
    id: "broken_road",
    label: "Broken Road",
    description: "Damaged or deteriorated road surface",
    icon: Construction,
    color: "orange",
    category: "infrastructure",
    typical_resolution_days: 10,
    priority_multiplier: 1.0,
    requires_photo: true,
    keywords: ["broken", "road", "cracked", "damaged", "surface"],
  },
  streetlight_failure: {
    id: "streetlight_failure",
    label: "Streetlight Failure",
    description: "Non-functioning street lights",
    icon: Lightbulb,
    color: "yellow",
    category: "infrastructure",
    typical_resolution_days: 3,
    priority_multiplier: 1.3,
    requires_photo: false,
    keywords: ["streetlight", "light", "lamp", "dark", "not working"],
  },
  drainage_blockage: {
    id: "drainage_blockage",
    label: "Drainage Blockage",
    description: "Clogged drains causing water accumulation",
    icon: CloudRain,
    color: "blue",
    category: "infrastructure",
    typical_resolution_days: 4,
    priority_multiplier: 1.4,
    requires_photo: true,
    keywords: ["drain", "blocked", "water", "flooding", "clogged"],
  },
  footpath_damage: {
    id: "footpath_damage",
    label: "Footpath Damage",
    description: "Broken or uneven sidewalks",
    icon: Construction,
    color: "gray",
    category: "infrastructure",
    typical_resolution_days: 7,
    priority_multiplier: 0.9,
    requires_photo: true,
    keywords: ["footpath", "sidewalk", "pavement", "broken", "uneven"],
  },
  open_manhole: {
    id: "open_manhole",
    label: "Open Manhole",
    description: "Uncovered manhole posing safety risk",
    icon: AlertTriangle,
    color: "red",
    category: "infrastructure",
    typical_resolution_days: 1,
    priority_multiplier: 2.0,
    requires_photo: true,
    keywords: ["manhole", "open", "uncovered", "dangerous", "hole"],
  },
  broken_manhole: {
    id: "broken_manhole",
    label: "Broken Manhole",
    description: "Damaged manhole cover",
    icon: AlertTriangle,
    color: "red",
    category: "infrastructure",
    typical_resolution_days: 3,
    priority_multiplier: 1.5,
    requires_photo: true,
    keywords: ["manhole", "broken", "damaged", "cover"],
  },
  water_pipeline_leak: {
    id: "water_pipeline_leak",
    label: "Water Pipeline Leak",
    description: "Leaking water supply pipes",
    icon: Droplets,
    color: "blue",
    category: "infrastructure",
    typical_resolution_days: 2,
    priority_multiplier: 1.6,
    requires_photo: true,
    keywords: ["water", "leak", "pipe", "burst", "flowing"],
  },
};

// Civic Amenity Issues
const civicAmenityIssues: Record<CivicAmenityIssueType, IssueTypeMetadata> = {
  missed_garbage_collection: {
    id: "missed_garbage_collection",
    label: "Missed Garbage Collection",
    description: "Scheduled waste collection not completed",
    icon: Trash2,
    color: "green",
    category: "civic_amenity",
    typical_resolution_days: 2,
    priority_multiplier: 1.2,
    requires_photo: true,
    keywords: ["garbage", "trash", "waste", "collection", "missed"],
  },
  overflowing_dustbin: {
    id: "overflowing_dustbin",
    label: "Overflowing Dustbin",
    description: "Public waste bins at full capacity",
    icon: Trash2,
    color: "green",
    category: "civic_amenity",
    typical_resolution_days: 1,
    priority_multiplier: 1.3,
    requires_photo: true,
    keywords: ["dustbin", "overflow", "full", "garbage", "bin"],
  },
  dirty_public_toilet: {
    id: "dirty_public_toilet",
    label: "Dirty Public Toilet",
    description: "Unhygienic public restroom facilities",
    icon: Home,
    color: "purple",
    category: "civic_amenity",
    typical_resolution_days: 1,
    priority_multiplier: 1.1,
    requires_photo: true,
    keywords: ["toilet", "bathroom", "dirty", "unhygienic", "restroom"],
  },
  park_maintenance: {
    id: "park_maintenance",
    label: "Park Maintenance",
    description: "Public park requiring upkeep",
    icon: TreeDeciduous,
    color: "green",
    category: "civic_amenity",
    typical_resolution_days: 7,
    priority_multiplier: 0.8,
    requires_photo: true,
    keywords: ["park", "garden", "maintenance", "overgrown", "unmaintained"],
  },
  broken_playground_equipment: {
    id: "broken_playground_equipment",
    label: "Broken Playground Equipment",
    description: "Damaged equipment in children's play areas",
    icon: ParkingCircle,
    color: "orange",
    category: "civic_amenity",
    typical_resolution_days: 5,
    priority_multiplier: 1.4,
    requires_photo: true,
    keywords: ["playground", "equipment", "broken", "swing", "slide"],
  },
};

// Safety Issues
const safetyIssues: Record<SafetyIssueType, IssueTypeMetadata> = {
  illegal_construction: {
    id: "illegal_construction",
    label: "Illegal Construction",
    description: "Unauthorized building or construction activity",
    icon: Shield,
    color: "red",
    category: "safety",
    typical_resolution_days: 15,
    priority_multiplier: 1.2,
    requires_photo: true,
    keywords: ["illegal", "construction", "unauthorized", "building"],
  },
  tree_cutting: {
    id: "tree_cutting",
    label: "Unauthorized Tree Cutting",
    description: "Illegal removal of trees",
    icon: TreeDeciduous,
    color: "green",
    category: "safety",
    typical_resolution_days: 3,
    priority_multiplier: 1.5,
    requires_photo: true,
    keywords: ["tree", "cutting", "removal", "illegal", "deforestation"],
  },
  public_property_vandalism: {
    id: "public_property_vandalism",
    label: "Public Property Vandalism",
    description: "Damage to public property or infrastructure",
    icon: Shield,
    color: "red",
    category: "safety",
    typical_resolution_days: 5,
    priority_multiplier: 1.0,
    requires_photo: true,
    keywords: ["vandalism", "damage", "graffiti", "destruction", "public property"],
  },
  stray_animal_problem: {
    id: "stray_animal_problem",
    label: "Stray Animal Problem",
    description: "Issues with stray animals in public areas",
    icon: AlertTriangle,
    color: "yellow",
    category: "safety",
    typical_resolution_days: 3,
    priority_multiplier: 1.1,
    requires_photo: false,
    keywords: ["stray", "animal", "dog", "cat", "menace"],
  },
};

// Combined issue types
export const ISSUE_TYPES: Record<IssueType, IssueTypeMetadata> = {
  ...infrastructureIssues,
  ...civicAmenityIssues,
  ...safetyIssues,
};

// ============================================
// CATEGORY METADATA
// ============================================

interface CategoryMetadata {
  id: IssueCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  issue_types: IssueType[];
}

export const ISSUE_CATEGORIES: Record<IssueCategory, CategoryMetadata> = {
  infrastructure: {
    id: "infrastructure",
    label: "Infrastructure",
    description: "Roads, utilities, and public infrastructure",
    icon: Construction,
    color: "orange",
    issue_types: Object.keys(infrastructureIssues) as IssueType[],
  },
  civic_amenity: {
    id: "civic_amenity",
    label: "Civic Amenities",
    description: "Public services and facilities",
    icon: Trash2,
    color: "green",
    issue_types: Object.keys(civicAmenityIssues) as IssueType[],
  },
  safety: {
    id: "safety",
    label: "Safety",
    description: "Public safety and security concerns",
    icon: Shield,
    color: "red",
    issue_types: Object.keys(safetyIssues) as IssueType[],
  },
};

// ============================================
// SEVERITY CONFIGURATION
// ============================================

interface SeverityConfig {
  id: IssueSeverity;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  weight: number; // 0.25 to 1.0 for priority calculation
  response_time_multiplier: number;
}

export const SEVERITY_LEVELS: Record<IssueSeverity, SeverityConfig> = {
  low: {
    id: "low",
    label: "Low",
    description: "Minor issue, no immediate risk",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    weight: 0.25,
    response_time_multiplier: 1.0,
  },
  medium: {
    id: "medium",
    label: "Medium",
    description: "Moderate issue requiring attention",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    weight: 0.5,
    response_time_multiplier: 0.8,
  },
  high: {
    id: "high",
    label: "High",
    description: "Serious issue needing quick resolution",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    weight: 0.75,
    response_time_multiplier: 0.5,
  },
  critical: {
    id: "critical",
    label: "Critical",
    description: "Urgent safety risk requiring immediate action",
    color: "bg-red-100 text-red-800 border-red-300",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    weight: 1.0,
    response_time_multiplier: 0.3,
  },
};

// ============================================
// STATUS CONFIGURATION
// ============================================

interface StatusConfig {
  id: IssueStatus;
  label: string;
  description: string;
  color: string;
  icon: LucideIcon;
  next_statuses: IssueStatus[];
}

export const STATUS_CONFIG: Record<IssueStatus, StatusConfig> = {
  reported: {
    id: "reported",
    label: "Reported",
    description: "Issue has been submitted and is pending review",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: AlertTriangle,
    next_statuses: ["acknowledged"],
  },
  acknowledged: {
    id: "acknowledged",
    label: "Acknowledged",
    description: "Issue has been reviewed and accepted",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Shield,
    next_statuses: ["in_progress"],
  },
  in_progress: {
    id: "in_progress",
    label: "In Progress",
    description: "Work is underway to resolve the issue",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Construction,
    next_statuses: ["resolved"],
  },
  resolved: {
    id: "resolved",
    label: "Resolved",
    description: "Issue has been fixed",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: AlertTriangle,
    next_statuses: [],
  },
};

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION_RULES = {
  title: {
    minLength: 10,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  photos: {
    minRequired: 1,
    maxAllowed: 5,
    maxSizeMB: 5,
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
  },
  location: {
    coordinatesPrecision: 6, // decimal places
    nearbyDuplicateRadiusMeters: 100, // for duplicate detection
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get issue type metadata by ID
 */
export function getIssueTypeConfig(issueType: IssueType): IssueTypeMetadata {
  return ISSUE_TYPES[issueType];
}

/**
 * Get category metadata by ID
 */
export function getCategoryConfig(category: IssueCategory): CategoryMetadata {
  return ISSUE_CATEGORIES[category];
}

/**
 * Get severity configuration by level
 */
export function getSeverityConfig(severity: IssueSeverity): SeverityConfig {
  return SEVERITY_LEVELS[severity];
}

/**
 * Get status configuration by status
 */
export function getStatusConfig(status: IssueStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

/**
 * Get all issue types for a specific category
 */
export function getIssueTypesByCategory(category: IssueCategory): IssueTypeMetadata[] {
  return ISSUE_CATEGORIES[category].issue_types.map(
    (typeId) => ISSUE_TYPES[typeId]
  );
}

/**
 * Auto-detect issue type from text (basic keyword matching)
 * Returns suggested issue types ranked by relevance
 */
export function suggestIssueType(text: string): IssueTypeMetadata[] {
  const lowerText = text.toLowerCase();
  const matches: Array<{ type: IssueTypeMetadata; score: number }> = [];

  Object.values(ISSUE_TYPES).forEach((issueType) => {
    let score = 0;
    issueType.keywords.forEach((keyword) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    if (score > 0) {
      matches.push({ type: issueType, score });
    }
  });

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((m) => m.type);
}

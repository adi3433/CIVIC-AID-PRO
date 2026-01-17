/**
 * Issue Card Component
 * 
 * Reusable card for displaying civic issue in lists
 */

import { Camera, MapPin, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CivicIssue } from "@/types/civicIssue";
import { ISSUE_TYPES, SEVERITY_LEVELS, STATUS_CONFIG } from "@/lib/issueConfig";
import { formatLocation } from "@/lib/locationService";
import { formatDistance } from "@/lib/duplicateDetection";

interface IssueCardProps {
  issue: CivicIssue;
  onClick?: () => void;
  showDistance?: number; // distance in meters
}

export function IssueCard({ issue, onClick, showDistance }: IssueCardProps) {
  const issueConfig = ISSUE_TYPES[issue.issue_type];
  const StatusIcon = STATUS_CONFIG[issue.status].icon;
  const severityConfig = SEVERITY_LEVELS[issue.severity];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      variant="interactive"
      size="sm"
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Photo Thumbnail */}
        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
          {issue.photos[0] ? (
            <img
              src={issue.photos[0].thumbnail_url || issue.photos[0].url}
              alt={issue.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-medium text-foreground text-sm line-clamp-2">
            {issue.title}
          </h3>

          {/* Issue Type & Date */}
          <p className="text-xs text-muted-foreground mt-1">
            {issueConfig.label} • {formatDate(issue.created_at)}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">
              {formatLocation(issue.location)}
            </p>
            {showDistance !== undefined && (
              <span className="text-xs text-muted-foreground ml-1">
                • {formatDistance(showDistance)}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Status Badge */}
            <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[issue.status].color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {STATUS_CONFIG[issue.status].label}
            </Badge>

            {/* Severity Badge */}
            <Badge variant="outline" className={`text-xs ${severityConfig.color}`}>
              {severityConfig.label}
            </Badge>

            {/* ETA */}
            {issue.estimated_resolution && issue.status !== "resolved" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{issue.estimated_resolution.display_text}</span>
              </div>
            )}

            {/* Duplicate Count */}
            {issue.duplicate_count > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {issue.duplicate_count + 1} reports
              </Badge>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}

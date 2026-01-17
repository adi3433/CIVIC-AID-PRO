/**
 * Issue Detail View Component
 * 
 * Full details of a civic issue including timeline, photos, and actions
 */

import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Share2,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CivicIssue } from "@/types/civicIssue";
import { ISSUE_TYPES, SEVERITY_LEVELS, STATUS_CONFIG } from "@/lib/issueConfig";
import { formatLocation, getMapsLink } from "@/lib/locationService";

interface IssueDetailViewProps {
  issue: CivicIssue;
  onBack: () => void;
}

export function IssueDetailView({ issue, onBack }: IssueDetailViewProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  const issueConfig = ISSUE_TYPES[issue.issue_type];
  const severityConfig = SEVERITY_LEVELS[issue.severity];
  const IssueIcon = issueConfig.icon;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: issue.title,
          text: `Civic Issue #${issue.issue_number}: ${issue.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Issue #{issue.issue_number}</p>
            <h1 className="text-lg font-bold text-foreground line-clamp-1">
              {issue.title}
            </h1>
          </div>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Status & Priority */}
        <Card variant="default" size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className={`mt-1 ${STATUS_CONFIG[issue.status].color}`}>
                {STATUS_CONFIG[issue.status].label}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Priority Score</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {issue.priority_score.score}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
          </div>

          {issue.estimated_resolution && issue.status !== "resolved" && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Resolution</p>
                  <p className="text-sm font-medium text-foreground">
                    {issue.estimated_resolution.display_text}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Photos */}
        {issue.photos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Photos</h2>
            
            {/* Main Photo */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={issue.photos[selectedPhotoIndex].url}
                alt={`Issue photo ${selectedPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {issue.photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {issue.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedPhotoIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <Card variant="default" size="sm" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <IssueIcon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground">{issueConfig.label}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <Badge variant="outline" className={`mt-1 ${severityConfig.color}`}>
                    {severityConfig.label}
                  </Badge>
                </div>
              </div>

              {issue.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{issue.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Location</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{formatLocation(issue.location)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => {
                window.open(
                  getMapsLink(issue.location.latitude, issue.location.longitude),
                  "_blank"
                );
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Reported By</h3>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {issue.is_anonymous ? "Anonymous" : issue.reported_by_name || "Citizen"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(issue.created_at)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Nearby Issues */}
        {issue.nearby_issues.length > 0 && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <p className="font-medium">Similar Issues Nearby</p>
              <p className="text-xs mt-1">
                {issue.nearby_issues.length} similar {issue.nearby_issues.length === 1 ? "report" : "reports"} found within 100m
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Timeline</h2>
          <Card variant="default" size="sm">
            <div className="space-y-4">
              {issue.status_history.map((change, index) => {
                const StatusIcon = STATUS_CONFIG[change.status].icon;
                const isLatest = index === issue.status_history.length - 1;

                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`p-2 rounded-full ${
                          isLatest ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <StatusIcon
                          className={`w-4 h-4 ${
                            isLatest ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      {index < issue.status_history.length - 1 && (
                        <div className="w-0.5 h-full bg-muted mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {STATUS_CONFIG[change.status].label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(change.changed_at)}
                          </p>
                        </div>
                        {isLatest && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      {change.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {change.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Resolution */}
        {issue.actual_resolution && (
          <Card variant="default" size="sm" className="bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Issue Resolved</p>
                <p className="text-sm text-green-800 mt-1">
                  {issue.actual_resolution.resolution_notes || "This issue has been fixed."}
                </p>
                {issue.actual_resolution.after_photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {issue.actual_resolution.after_photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.thumbnail_url || photo.url}
                        alt="After resolution"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Citizen Verification */}
        {issue.citizen_verification && (
          <Card variant="default" size="sm">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Citizen Feedback</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {issue.citizen_verification.is_resolved
                    ? "✓ Verified as resolved"
                    : "✗ Reported as not resolved"}
                </p>
                {issue.citizen_verification.feedback && (
                  <p className="text-sm text-foreground mt-2">
                    "{issue.citizen_verification.feedback}"
                  </p>
                )}
                {issue.citizen_verification.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">
                      {issue.citizen_verification.rating}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

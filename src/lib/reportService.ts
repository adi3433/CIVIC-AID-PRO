/**
 * Report Service
 * Handles report submission with image upload to Supabase
 */

import { supabase } from "./supabase";

export interface SubmitReportData {
  userId: string;
  title: string;
  description: string;
  category: "pothole" | "garbage" | "streetlight" | "drainage" | "water" | "noise";
  imageBase64?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface SubmitReportResult {
  success: boolean;
  reportId?: string;
  error?: string;
}

/**
 * Upload image to Supabase Storage
 */
async function uploadReportImage(
  imageBase64: string,
  reportId: string,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("Starting image upload to report-images bucket...");
    
    // Convert base64 to blob
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data) {
      console.error("Invalid base64 data");
      return { success: false, error: "Invalid image data" };
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    console.log("Blob created, size:", blob.size);

    // Upload to Supabase Storage - must be in 'public' folder per RLS policy
    const fileName = `${reportId}_${Date.now()}.jpg`;
    console.log("Uploading to bucket 'report-images' with filename:", fileName);
    
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
        cacheControl: '3600'
      });

    if (error) {
      console.error("Storage upload error details:", {
        message: error.message,
        error: error
      });
      return { success: false, error: `Storage error: ${error?.message || 'Unknown error'}` };
    }

    console.log("Upload successful, data:", data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);

    console.log("Public URL generated:", urlData.publicUrl);

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error("Image upload exception:", error);
    return { success: false, error: error?.message || "Failed to upload image" };
  }
}

/**
 * Submit a new report to the database
 */
export async function submitReport(
  reportData: SubmitReportData
): Promise<SubmitReportResult> {
  try {
    const reportId = crypto.randomUUID();
    let photoUrls: string[] = [];

    // Upload image if provided (optional for manual reports)
    if (reportData.imageBase64) {
      console.log("Image base64 provided, starting upload...");
      const uploadResult = await uploadReportImage(
        reportData.imageBase64,
        reportId,
        reportData.userId
      );

      if (uploadResult.success && uploadResult.url) {
        console.log("Image uploaded successfully:", uploadResult.url);
        photoUrls.push(uploadResult.url);
      } else {
        console.error("Image upload failed:", uploadResult.error);
        // Return error to user instead of silently continuing
        return { 
          success: false, 
          error: `Failed to upload image: ${uploadResult.error}. Please check if the 'report-images' bucket exists and is public.` 
        };
      }
    } else {
      console.log("No image provided, creating manual report without photo");
    }

    // Insert report into database
    const { data, error } = await supabase
      .from("reports")
      .insert({
        id: reportId,
        user_id: reportData.userId,
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        status: "reported",
        latitude: reportData.latitude || null,
        longitude: reportData.longitude || null,
        location_name: reportData.locationName || null,
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
        eta_days: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return { success: false, error: "Failed to submit report" };
    }

    return { success: true, reportId: data.id };
  } catch (error) {
    console.error("Submit report error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch user's reports from the database
 */
export async function getUserReports(userId: string) {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch reports error:", error);
      return { success: false, error: "Failed to fetch reports" };
    }

    return { success: true, reports: data };
  } catch (error) {
    console.error("Get user reports error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Verify that a resolved report has been fixed (only by original reporter)
 */
export async function verifyReport(reportId: string, userId: string) {
  try {
    console.log("Starting verification for report:", reportId, "by user:", userId);
    
    // First, check if the user is the original reporter
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("user_id, status")
      .eq("id", reportId)
      .single();

    if (fetchError) {
      console.error("Fetch report error:", fetchError);
      return { success: false, error: "Failed to fetch report" };
    }

    console.log("Report fetched:", report);

    if (report.user_id !== userId) {
      console.error("User not authorized:", report.user_id, "!=", userId);
      return { success: false, error: "Only the original reporter can verify this report" };
    }

    if (report.status !== "resolved") {
      console.error("Report not resolved:", report.status);
      return { success: false, error: "Only resolved reports can be verified" };
    }

    console.log("Updating report status to verified...");

    // Update status to verified
    const { data: updateData, error: updateError } = await supabase
      .from("reports")
      .update({ 
        status: "verified",
        updated_at: new Date().toISOString()
      })
      .eq("id", reportId)
      .select();

    if (updateError) {
      console.error("Update report status error:", updateError);
      return { success: false, error: `Failed to verify report: ${updateError.message}` };
    }

    console.log("Report verified successfully:", updateData);
    return { success: true };
  } catch (error) {
    console.error("Verify report error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Get reports within a specified radius from user's location
 */
export async function getNearbyReports(
  userLat: number,
  userLng: number,
  radiusKm: number = 5,
  currentUserId?: string
) {
  try {
    // Fetch only unresolved reports (exclude "resolved" status)
    // For production, consider using PostGIS for server-side distance calculation
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        upvotes:report_interactions!report_interactions_report_id_fkey(count),
        downvotes:report_interactions!report_interactions_report_id_fkey(count)
      `)
      .neq("status", "resolved")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch nearby reports error:", error);
      return { success: false, error: "Failed to fetch nearby reports" };
    }

    // Filter by distance and add distance field
    const reportsWithDistance = data
      .map((report) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          report.latitude!,
          report.longitude!
        );
        return { ...report, distance };
      })
      .filter((report) => report.distance <= radiusKm)
      .filter((report) => report.user_id !== currentUserId); // Exclude current user's reports

    // Get vote counts for each report
    const { data: interactions } = await supabase
      .from("report_interactions")
      .select("report_id, interaction_type")
      .in(
        "report_id",
        reportsWithDistance.map((r) => r.id)
      );

    // Calculate vote counts
    const reportsWithVotes = reportsWithDistance.map((report) => {
      const reportInteractions = interactions?.filter(
        (i) => i.report_id === report.id
      ) || [];
      const upvotes = reportInteractions.filter(
        (i) => i.interaction_type === "upvote"
      ).length;
      const downvotes = reportInteractions.filter(
        (i) => i.interaction_type === "downvote"
      ).length;

      return {
        ...report,
        upvotes,
        downvotes,
      };
    });

    // Sort by distance (nearest first)
    reportsWithVotes.sort((a, b) => a.distance - b.distance);

    return { success: true, reports: reportsWithVotes };
  } catch (error) {
    console.error("Get nearby reports error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get user's current vote on a specific report
 */
export async function getUserVote(reportId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("report_interactions")
      .select("interaction_type")
      .eq("report_id", reportId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Get user vote error:", error);
      return { success: false, error: "Failed to get user vote" };
    }

    return { success: true, vote: data?.interaction_type || null };
  } catch (error) {
    console.error("Get user vote error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Upvote a report
 */
export async function upvoteReport(reportId: string, userId: string) {
  try {
    // Check if user already has an interaction
    const { data: existing } = await supabase
      .from("report_interactions")
      .select("interaction_type")
      .eq("report_id", reportId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.interaction_type === "upvote") {
      // Remove upvote if already upvoted
      const { error: deleteError } = await supabase
        .from("report_interactions")
        .delete()
        .eq("report_id", reportId)
        .eq("user_id", userId)
        .eq("interaction_type", "upvote");

      if (deleteError) {
        console.error("Remove upvote error:", deleteError);
        return { success: false, error: "Failed to remove upvote" };
      }

      return { success: true, action: "removed" };
    } else {
      // Remove downvote if exists
      if (existing?.interaction_type === "downvote") {
        await supabase
          .from("report_interactions")
          .delete()
          .eq("report_id", reportId)
          .eq("user_id", userId)
          .eq("interaction_type", "downvote");
      }

      // Add upvote
      const { error: insertError } = await supabase
        .from("report_interactions")
        .insert({
          report_id: reportId,
          user_id: userId,
          interaction_type: "upvote",
        });

      if (insertError) {
        console.error("Add upvote error:", insertError);
        return { success: false, error: "Failed to add upvote" };
      }

      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Upvote report error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Downvote a report
 */
export async function downvoteReport(reportId: string, userId: string) {
  try {
    // Check if user already has an interaction
    const { data: existing } = await supabase
      .from("report_interactions")
      .select("interaction_type")
      .eq("report_id", reportId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.interaction_type === "downvote") {
      // Remove downvote if already downvoted
      const { error: deleteError } = await supabase
        .from("report_interactions")
        .delete()
        .eq("report_id", reportId)
        .eq("user_id", userId)
        .eq("interaction_type", "downvote");

      if (deleteError) {
        console.error("Remove downvote error:", deleteError);
        return { success: false, error: "Failed to remove downvote" };
      }

      return { success: true, action: "removed" };
    } else {
      // Remove upvote if exists
      if (existing?.interaction_type === "upvote") {
        await supabase
          .from("report_interactions")
          .delete()
          .eq("report_id", reportId)
          .eq("user_id", userId)
          .eq("interaction_type", "upvote");
      }

      // Add downvote
      const { error: insertError } = await supabase
        .from("report_interactions")
        .insert({
          report_id: reportId,
          user_id: userId,
          interaction_type: "downvote",
        });

      if (insertError) {
        console.error("Add downvote error:", insertError);
        return { success: false, error: "Failed to add downvote" };
      }

      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Downvote report error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Check for duplicate reports within a small radius (10 meters)
 * Used for duplicate detection before submission
 */
export async function checkDuplicateReports(
  latitude: number,
  longitude: number,
  category: string,
  radiusMeters: number = 10,
  daysBack: number = 7
) {
  try {
    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setDate(timeThreshold.getDate() - daysBack);

    // Fetch reports in the same category that are not resolved
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("category", category)
      .neq("status", "resolved")
      .gte("created_at", timeThreshold.toISOString())
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) {
      console.error("Check duplicates error:", error);
      return { success: false, error: "Failed to check for duplicates" };
    }

    // Filter by precise distance (10 meters)
    const radiusKm = radiusMeters / 1000; // Convert to kilometers
    const duplicates = data
      .map((report) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          report.latitude!,
          report.longitude!
        );
        return { ...report, distance: distance * 1000 }; // Convert to meters
      })
      .filter((report) => report.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance); // Closest first

    return { success: true, duplicates };
  } catch (error) {
    console.error("Check duplicates error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}


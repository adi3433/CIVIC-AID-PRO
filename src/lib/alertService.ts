import { supabase } from "./supabase";

export interface Alert {
  id: string;
  detection_id: string | null;
  type: "fall" | "violent_movement" | "abnormal_motion";
  confidence: number;
  timestamp: number;
  alert_triggered_at: string;
  device_info: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  location_accuracy: number | null;
}

export async function getLatestAlert(): Promise<{
  success: boolean;
  alert?: Alert;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("alert_triggered_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching latest alert:", error);
      return { success: false, error: error.message };
    }

    console.log("Raw data from Supabase:", data);
    console.log("Data length:", data?.length);
    console.log(
      "First alert:",
      data && data.length > 0 ? data[0] : "No alerts",
    );

    // Return the first alert if it exists, otherwise return success with no alert
    return {
      success: true,
      alert: data && data.length > 0 ? data[0] : undefined,
    };
  } catch (error) {
    console.error("Error in getLatestAlert:", error);
    return { success: false, error: "Failed to fetch alert" };
  }
}

export async function getRecentAlerts(limit: number = 10): Promise<{
  success: boolean;
  alerts?: Alert[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent alerts:", error);
      return { success: false, error: error.message };
    }

    return { success: true, alerts: data || [] };
  } catch (error) {
    console.error("Error in getRecentAlerts:", error);
    return { success: false, error: "Failed to fetch alerts" };
  }
}

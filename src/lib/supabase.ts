import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rlvgephkagtejlogudqo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmdlcGhrYWd0ZWpsb2d1ZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MzI0MzgsImV4cCI6MjA4NDIwODQzOH0.mZs84-tEUKc73j0HqCXwaD1FDB-8C6fvvnPRuhPy2oM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category:
    | "pothole"
    | "garbage"
    | "streetlight"
    | "drainage"
    | "water"
    | "noise";
  status: "reported" | "in_progress" | "resolved";
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  photo_urls: string[] | null;
  eta_days: number | null;
  created_at: string;
  updated_at: string;
}

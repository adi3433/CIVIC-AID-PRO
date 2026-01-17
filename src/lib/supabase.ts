import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

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

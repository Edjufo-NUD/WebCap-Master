import { createClient } from "@supabase/supabase-js";

// Replace with your own Supabase URL and anon key
const SUPABASE_URL = "https://vydfizldgyaxheceslzy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGZpemxkZ3lheGhlY2VzbHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODQ2MjQsImV4cCI6MjA2MzQ2MDYyNH0._BKPiyRefCfuCE4aqE3M1EeaZkGTkVl-Y6z-f15Y-IY";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

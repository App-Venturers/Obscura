// File: src/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Check your .env file and ensure they begin with REACT_APP_."
  );
}

// Optional: Add supabase options explicitly (auth/session handling)
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

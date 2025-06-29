// File: src/supabaseClient.js

import { createClient } from "@supabase/supabase-js";
console.log("ENV CHECK:", process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are not set. Check your .env file and ensure you're using the REACT_APP_ prefix."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

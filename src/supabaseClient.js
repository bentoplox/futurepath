import { createClient } from '@supabase/supabase-js';

// 1. Go to Supabase Dashboard -> Project Settings -> API
// 2. Paste your "Project URL" and "anon public" key here
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
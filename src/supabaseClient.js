import { createClient } from '@supabase/supabase-js';

// 1. Go to Supabase Dashboard -> Project Settings -> API
// 2. Paste your "Project URL" and "anon public" key here
const supabaseUrl = 'https://smgjboifsheewiyeupbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZ2pib2lmc2hlZXdpeWV1cGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDA3NzksImV4cCI6MjA4MjYxNjc3OX0.I-uxcI0VeMaw3tcuQeFabcpBzmh1TvUJ3C1TG4ASu8I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
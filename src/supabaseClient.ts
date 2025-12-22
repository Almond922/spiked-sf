import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://cuwovkkbrudybxuyndqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d292a2ticnVkeWJ4dXluZHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTU4MzYsImV4cCI6MjA3MTE5MTgzNn0.mxwCdbOSpV6qn9cd2oVjxeqaDSz7fLW5qfokuULLWSU';

// Store credentials in environment variables for production
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
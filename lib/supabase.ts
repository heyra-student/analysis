import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efudkjvulfyikswsxxjy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdWRranZ1bGZ5aWtzd3N4eGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjA1MzEsImV4cCI6MjEwNjgzNjUzMX0.6S1oN7ftG4kI63nriK-mTK9DjxDMol_pVsNzCp2W-fk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SUPABASE_URL = 'https://aastenbsntpdxknonyyr.supabase.co';

const SUPABASE_ANON_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc3RlbmJzbnRwZHhrbm9ueXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjk4MTEsImV4cCI6MjA5NzgwNTgxMX0.C0lfo9Xawq5jvDetw1V-fozdr2jkfwB2Ulk3JMyBhps';

const defaultSupabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Backward compatibility
const supabaseClient = defaultSupabaseClient;

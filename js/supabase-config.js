// Ensure window.currentConfig is available, falling back safely if needed
const config = window.currentConfig || {
    url: 'https://aastenbsntpdxknonyyr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc3RlbmJzbnRwZHhrbm9ueXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjk4MTEsImV4cCI6MjA5NzgwNTgxMX0.C0lfo9Xawq5jvDetw1V-fozdr2jkfwB2Ulk3JMyBhps'
};

// Initialize the Supabase client dynamically using the active environment configuration
const supabaseClient = supabase.createClient(config.url, config.anonKey);

// Optional: Log it once so you can visually verify in the console which DB it loaded
console.log("Supabase Initialized with URL:", config.url);
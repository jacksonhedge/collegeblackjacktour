import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cferwghhtstkxdiqhfqj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZXJ3Z2hodHN0a3hkaXFoZnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTM5NTUsImV4cCI6MjAyOTQ2OTk1NX0.LdRCCpAn0Yb0WTgFxUq3GBQO3-Bp74hQVIlMfhTjHfE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://plkgpohcqgeqzrbggfio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsa2dwb2hjcWdlcXpyYmdnZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjczODQsImV4cCI6MjA2NDY0MzM4NH0.F0daVircdefz5vSmIvvPZno_QKpQL6KQ1lVXv1gFehE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
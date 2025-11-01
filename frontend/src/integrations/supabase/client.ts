import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tcdhabmttwopjpobppmh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZGhhYm10dHdvcGpwb2JwcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjE2MzEsImV4cCI6MjA3Njk5NzYzMX0.zgqDXNYzHC2bdXiT-1Ue2s26hQAfFilR7IKGImMXWwk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

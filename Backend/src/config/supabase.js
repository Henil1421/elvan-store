import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISH_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] ❌ Missing SUPABASE_URL or SUPABASE_PUBLISH_KEY in environment variables.');
  console.error('[Supabase] Copy .env.example to .env and fill in your Supabase credentials.');
  console.error('[Supabase] Get credentials at: https://app.supabase.com/project/_/settings/api');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] ✅ Client created successfully.');
  } catch (err) {
    console.error('[Supabase] ❌ Failed to create client:', err.message);
    console.error('[Supabase] Check that SUPABASE_URL is a valid https://xxx.supabase.co URL.');
  }
}

export { supabase };

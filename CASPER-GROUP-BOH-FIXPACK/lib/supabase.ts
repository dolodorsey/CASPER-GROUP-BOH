import { createClient } from '@supabase/supabase-js';

// NOTE:
// For production, ALWAYS pull both URL + anon key from environment variables.
// This keeps the app portable across staging/prod and prevents hard-coded infra.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qhgmukwoennurwuvmbhy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Expo + RN OAuth works best with PKCE
    flowType: 'pkce',
    // We handle redirects manually via expo-web-browser
    detectSessionInUrl: false,
  },
});

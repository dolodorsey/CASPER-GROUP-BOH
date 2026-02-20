import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qhgmukwoennurwuvmbhy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZ211a3dvZW5udXJ3dXZtYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODI1NDksImV4cCI6MjA4MjU1ODU0OX0.DhNcV9_h8_wdvKHfGyK9kdxKTlT6ZJ1t-JbCKBGD-Kw';

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 10);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey.trim(), {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (err) {
    console.error('[Supabase] Failed to create client:', err);
    supabaseInstance = null;
  }
}

const createMockClient = (): SupabaseClient => {
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ data: { url: null }, error: { message: 'Supabase not configured' } }),
    exchangeCodeForSession: async () => ({ data: { session: null }, error: { message: 'Supabase not configured' } }),
  };
  
  const mockFrom = () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }), order: async () => ({ data: [], error: null }) }),
    insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    delete: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
  });
  
  return { auth: mockAuth, from: mockFrom } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = supabaseInstance || createMockClient();

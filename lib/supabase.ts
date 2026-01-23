import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qhgmukwoennurwuvmbhy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  console.warn('[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY is not set - auth features disabled');
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

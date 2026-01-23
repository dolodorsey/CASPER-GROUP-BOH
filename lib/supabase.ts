import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qhgmukwoennurwuvmbhy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 10);

console.log('[Supabase] Config check:', { 
  hasKey: Boolean(supabaseAnonKey), 
  keyLength: supabaseAnonKey?.length ?? 0,
  isConfigured: isSupabaseConfigured 
});

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
    console.log('[Supabase] Client initialized successfully');
  } catch (err) {
    console.error('[Supabase] Failed to create client:', err);
    supabaseInstance = null;
  }
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

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// The public client key is safe to ship, but authorization must always be
// enforced by verified sessions and database row-level security.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabasePublishableKey.length > 0;

let supabaseInstance: SupabaseClient | null = null;

// Lazy-load AsyncStorage only when window is available (not during SSR/static export)
const getStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

try {
  if (!isSupabaseConfigured) throw new Error('Supabase environment is incomplete');
  const storage = getStorage();
  supabaseInstance = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      ...(storage ? { storage } : {}),
      autoRefreshToken: true,
      persistSession: typeof window !== 'undefined',
      detectSessionInUrl: false,
    },
  });
} catch (err) {
  console.error('[Supabase] Failed to create client:', err);
  supabaseInstance = null;
}

const createUnavailableClient = (): SupabaseClient => {
  const error = { message: 'CASPER BOH is not configured. Set the Supabase URL and publishable key.' };
  const unavailableAuth = {
    getSession: async () => ({ data: { session: null }, error }),
    getUser: async () => ({ data: { user: null }, error }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error }),
    signInWithPassword: async () => ({ data: { session: null }, error }),
    signInWithOAuth: async () => ({ data: { url: null }, error }),
  };

  const unavailableQuery: any = {
    select: () => unavailableQuery,
    eq: () => unavailableQuery,
    in: () => unavailableQuery,
    gte: () => unavailableQuery,
    lte: () => unavailableQuery,
    order: () => unavailableQuery,
    limit: () => unavailableQuery,
    single: async () => ({ data: null, error }),
    then: (resolve: (value: { data: null; error: typeof error }) => void) => resolve({ data: null, error }),
  };
  const unavailableFrom = () => ({
    select: () => unavailableQuery,
    insert: () => unavailableQuery,
    update: () => unavailableQuery,
    upsert: () => unavailableQuery,
    delete: () => unavailableQuery,
  });

  return { auth: unavailableAuth, from: unavailableFrom } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = supabaseInstance || createUnavailableClient();

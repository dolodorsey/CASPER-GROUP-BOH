import { useCallback, useEffect, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'employee' | 'partner';

type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role: UserRole;
};

type AuthContextType = {
  loading: boolean;
  sessionReady: boolean;
  userId: string | null;
  profile: Profile | null;

  allowedLocations: string[];
  allowedBrands: string[];

  activeLocationId: string | null;
  setActiveLocationId: (id: string | null) => void;

  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ACTIVE_LOCATION_KEY = 'cg.activeLocationId';

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [allowedLocations, setAllowedLocations] = useState<string[]>([]);
  const [allowedBrands, setAllowedBrands] = useState<string[]>([]);

  const [activeLocationId, _setActiveLocationId] = useState<string | null>(null);

  const setActiveLocationId = useCallback((id: string | null) => {
    _setActiveLocationId(id);
    AsyncStorage.setItem(ACTIVE_LOCATION_KEY, id ?? '').catch(() => {});
  }, []);

  const loadActiveLocation = useCallback(async () => {
    try {
      const v = await AsyncStorage.getItem(ACTIVE_LOCATION_KEY);
      if (v) _setActiveLocationId(v);
    } catch {}
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id ?? null;
    setUserId(uid);

    if (!uid) {
      setProfile(null);
      setAllowedLocations([]);
      setAllowedBrands([]);
      return;
    }

    const { data: prof, error: pErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', uid)
      .single();

    if (pErr || !prof) {
      setProfile(null);
    } else {
      setProfile(prof as Profile);
    }

    // Access lists
    const [{ data: locs }, { data: brands }] = await Promise.all([
      supabase.from('user_location_access').select('location_id').eq('user_id', uid),
      supabase.from('user_brand_access').select('brand_id').eq('user_id', uid),
    ]);

    const locIds = (locs ?? []).map((r: any) => r.location_id).filter(Boolean);
    const brandIds = (brands ?? []).map((r: any) => r.brand_id).filter(Boolean);

    setAllowedLocations(locIds);
    setAllowedBrands(brandIds);

    // Default active location
    if (!activeLocationId && locIds.length > 0) {
      _setActiveLocationId(locIds[0]);
      AsyncStorage.setItem(ACTIVE_LOCATION_KEY, locIds[0]).catch(() => {});
    }
  }, [activeLocationId]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await loadActiveLocation();
      await refreshProfile();
      if (!mounted) return;
      setSessionReady(true);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      setLoading(true);
      await refreshProfile();
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadActiveLocation, refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    await refreshProfile();
    setLoading(false);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setProfile(null);
    setAllowedLocations([]);
    setAllowedBrands([]);
    setActiveLocationId(null);
  }, [setActiveLocationId]);

  return useMemo(() => ({
    loading,
    sessionReady,
    userId,
    profile,
    allowedLocations,
    allowedBrands,
    activeLocationId,
    setActiveLocationId,
    signIn,
    signOut,
    refreshProfile,
  }), [loading, sessionReady, userId, profile, allowedLocations, allowedBrands, activeLocationId, setActiveLocationId, signIn, signOut, refreshProfile]);
});

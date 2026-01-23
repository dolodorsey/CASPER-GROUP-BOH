import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type Role = "admin" | "employee" | "partner";

export type Profile = {
  id: string;
  role: Role;
  location_id: string | null;
  brand_id: string | null;
};

export type LocationSummary = { id: string; name: string; address: string; };
export type BrandSummary = { id: string; name: string; };


type AuthContextType = {
  userId: string | null;
  profile: Profile | null;
  isBooting: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;

  allowedLocations: LocationSummary[];
  activeLocationId: string | null;
  setActiveLocationId: (locationId: string | null) => Promise<void>;

  allowedBrands: BrandSummary[];
  activeBrandId: string | null;
  setActiveBrandId: (brandId: string | null) => Promise<void>;

};

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const mountedRef = useRef(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [allowedLocations, setAllowedLocations] = useState<LocationSummary[]>([]);
  const [activeLocationId, _setActiveLocationId] = useState<string | null>(null);
  const [allowedBrands, setAllowedBrands] = useState<BrandSummary[]>([]);
  const [activeBrandId, _setActiveBrandId] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, location_id, brand_id")
      .eq("id", uid)
      .single();

    if (error) {
      console.warn("[Supabase] profile fetch error:", error.message);
      return null;
    }
    return data as Profile;
  };

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id ?? null;
    setUserId(uid);

    if (!uid) {
      setProfile(null);
      return;
    }

    const p = await fetchProfile(uid);
    setProfile(p);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!isSupabaseConfigured) {
        console.log('[Auth] Supabase not configured, skipping auth boot');
        setIsBooting(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user.id ?? null;

        if (cancelled) return;
        setUserId(uid);

        if (uid) {
          const p = await fetchProfile(uid);
          if (cancelled) return;
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('[Auth] Boot error:', err);
      } finally {
        if (!cancelled) setIsBooting(false);
      }
    };

    boot();

    let subscription: { unsubscribe: () => void } | null = null;
    
    if (isSupabaseConfigured) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (cancelled) return;
        const uid = session?.user.id ?? null;
        setUserId(uid);

        if (uid) {
          const p = await fetchProfile(uid);
          if (!cancelled) setProfile(p);
        } else {
          setProfile(null);
        }
      });
      subscription = sub.subscription;
    }

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const setActiveLocationId = useCallback(async (locationId: string | null) => {
    _setActiveLocationId(locationId);
    try {
      if (locationId) await AsyncStorage.setItem('active_location_id', locationId);
      else await AsyncStorage.removeItem('active_location_id');
    } catch {
    }
  }, []);

  const setActiveBrandId = useCallback(async (brandId: string | null) => {
    _setActiveBrandId(brandId);
    try {
      if (brandId) await AsyncStorage.setItem('active_brand_id', brandId);
      else await AsyncStorage.removeItem('active_brand_id');
    } catch {
    }
  }, []);
  
  useEffect(() => {
    let cancelled = false;
    const loadAccess = async () => {
      if (!userId || !profile) {
        if (cancelled) return;
        setAllowedLocations([]);
        setAllowedBrands([]);
        _setActiveLocationId(null);
        _setActiveBrandId(null);
        return;
      }

      try {
        const storedLoc = await AsyncStorage.getItem('active_location_id');
        const storedBrand = await AsyncStorage.getItem('active_brand_id');

        let locs: LocationSummary[] = [];
        if (profile.role === 'admin') {
          const { data, error } = await supabase.from('cg_locations').select('id,name,address').order('name');
          if (error) throw error;
          locs = (data ?? []) as LocationSummary[];
        } else {
          const { data, error } = await supabase
            .from('user_location_access')
            .select('location_id, cg_locations ( id, name, address )')
            .eq('user_id', userId);
          if (error) throw error;
          locs = (data ?? [])
            .map((r: any) => r.cg_locations)
            .filter(Boolean) as LocationSummary[];
        }

        let brs: BrandSummary[] = [];
        if (profile.role === 'admin') {
          const { data, error } = await supabase.from('cg_brands').select('id,name').order('name');
          if (error) throw error;
          brs = (data ?? []) as BrandSummary[];
        } else {
          const { data, error } = await supabase
            .from('user_brand_access')
            .select('brand_id, cg_brands ( id, name )')
            .eq('user_id', userId);
          if (error) throw error;
          brs = (data ?? [])
            .map((r: any) => r.cg_brands)
            .filter(Boolean) as BrandSummary[];
        }

        if (cancelled) return;
        setAllowedLocations(locs);
        setAllowedBrands(brs);

        const locIds = new Set(locs.map(l => l.id));
        const brandIds = new Set(brs.map(b => b.id));

        const resolvedLoc = (storedLoc && locIds.has(storedLoc))
          ? storedLoc
          : (profile.location_id && locIds.has(profile.location_id))
            ? profile.location_id
            : (locs[0]?.id ?? null);

        const resolvedBrand = (storedBrand && brandIds.has(storedBrand))
          ? storedBrand
          : (profile.brand_id && brandIds.has(profile.brand_id))
            ? profile.brand_id
            : (brs[0]?.id ?? null);

        _setActiveLocationId(resolvedLoc);
        _setActiveBrandId(resolvedBrand);

        if (resolvedLoc) await AsyncStorage.setItem('active_location_id', resolvedLoc);
        else await AsyncStorage.removeItem('active_location_id');
        if (resolvedBrand) await AsyncStorage.setItem('active_brand_id', resolvedBrand);
        else await AsyncStorage.removeItem('active_brand_id');
      } catch {
        if (cancelled) return;
        setAllowedLocations([]);
        setAllowedBrands([]);
        _setActiveLocationId(profile.location_id ?? null);
        _setActiveBrandId(profile.brand_id ?? null);
      }
    };
    loadAccess();
    return () => { cancelled = true; };
  }, [userId, profile]);
  
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return useMemo(
    () => ({ userId, profile, isBooting, refreshProfile, signOut, allowedLocations, activeLocationId, setActiveLocationId, allowedBrands, activeBrandId, setActiveBrandId }),
    [userId, profile, isBooting, refreshProfile, signOut, allowedLocations, activeLocationId, setActiveLocationId, allowedBrands, activeBrandId, setActiveBrandId]
  );
});

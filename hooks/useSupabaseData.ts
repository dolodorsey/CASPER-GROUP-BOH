/**
 * Casper Group BOH — Supabase Data Hooks
 * Replaces all hardcoded constants with live Supabase queries.
 * Falls back to seed data shape if Supabase is not configured.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── BRANDS ─────────────────────────────────────────────
export interface CgBrand {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  mascot: string | null;
  icon: string | null;
  color_primary: string;
  color_secondary: string;
  status: string;
}

export function useBrands() {
  return useQuery({
    queryKey: ['cg_brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_brands')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return (data ?? []) as CgBrand[];
    },
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  });
}

/** Map Supabase brand to the shape BrandCard expects */
export function toBrandCardData(b: CgBrand) {
  return {
    id: b.slug,
    name: b.name,
    tagline: b.tagline ?? '',
    mascot: b.mascot ?? '',
    colors: [b.color_primary, b.color_secondary],
    revenue: '—',
    growth: 0,
    topSeller: '—',
    icon: b.icon ?? '🍽️',
  };
}

// ─── LOCATIONS ──────────────────────────────────────────
export interface CgLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
}

export function useLocations() {
  return useQuery({
    queryKey: ['cg_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_locations')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data ?? []) as CgLocation[];
    },
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  });
}

// ─── KPIs ───────────────────────────────────────────────
export interface CgKpi {
  id: string;
  name: string;
  value: string;
  unit: string | null;
  trend: 'up' | 'down' | 'stable';
  trend_value: number;
  target: number | null;
  status: string;
}

export function useKpis() {
  return useQuery({
    queryKey: ['cg_kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_kpis')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data ?? []) as CgKpi[];
    },
    enabled: isSupabaseConfigured,
    staleTime: 10_000,
  });
}

// ─── ALERTS ─────────────────────────────────────────────
export interface CgAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string | null;
  status: string;
  actionable: boolean;
  created_at: string;
}

export function useAlerts(status: string = 'active') {
  return useQuery({
    queryKey: ['cg_alerts', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_alerts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CgAlert[];
    },
    enabled: isSupabaseConfigured,
    refetchInterval: 30_000,
  });
}

// ─── TICKETS ────────────────────────────────────────────
export interface CgTicket {
  id: string;
  provider: string;
  items: any[];
  status: string;
  priority: string;
  total: number;
  brand_id: string | null;
  location_id: string | null;
  created_at: string;
}

export function useTickets() {
  return useQuery({
    queryKey: ['cg_tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_tickets')
        .select('*')
        .in('status', ['new', 'in_progress', 'ready'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CgTicket[];
    },
    enabled: isSupabaseConfigured,
    refetchInterval: 5_000,
  });
}

// ─── INVENTORY ──────────────────────────────────────────
export interface CgInventoryItem {
  id: string;
  sku: string | null;
  name: string;
  category: string | null;
  par: number;
  on_hand: number;
  unit: string;
  cost: number;
  location_id: string | null;
  brand_id: string | null;
}

export function useInventory(locationId?: string) {
  return useQuery({
    queryKey: ['cg_inventory', locationId],
    queryFn: async () => {
      let q = supabase.from('cg_inventory').select('*').order('name');
      if (locationId) q = q.eq('location_id', locationId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CgInventoryItem[];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── EQUIPMENT ──────────────────────────────────────────
export function useEquipment(locationId?: string) {
  return useQuery({
    queryKey: ['cg_equipment', locationId],
    queryFn: async () => {
      let q = supabase.from('cg_equipment').select('*').order('name');
      if (locationId) q = q.eq('location_id', locationId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── MENU ITEMS ─────────────────────────────────────────
export function useMenuItems(brandId?: string) {
  return useQuery({
    queryKey: ['cg_menu_items', brandId],
    queryFn: async () => {
      let q = supabase.from('cg_menu_items').select('*').eq('is_available', true).order('category').order('name');
      if (brandId) q = q.eq('brand_id', brandId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── VENDORS ────────────────────────────────────────────
export function useVendors() {
  return useQuery({
    queryKey: ['cg_vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_vendors')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

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
  location_id: string | null;
  source: string | null;
  description: string | null;
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

// ─── SHIFTS (for employee portal) ───────────────────────
export interface CgShift {
  id: string;
  user_id: string;
  location_id: string;
  role: string | null;
  station: string | null;
  start_time: string;
  end_time: string;
  status: string;
}

export function useMyShifts(userId?: string | null) {
  return useQuery({
    queryKey: ['cg_shifts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('cg_shifts')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 7 * 86400000).toISOString())
        .order('start_time', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CgShift[];
    },
    enabled: isSupabaseConfigured && !!userId,
  });
}

// ─── MESSAGES (for employee portal) ─────────────────────
export interface CgMessage {
  id: string;
  channel_id: string;
  actor_id: string;
  body: string;
  priority: string;
  created_at: string;
}

export function useMessages(channelId?: string) {
  return useQuery({
    queryKey: ['cg_messages', channelId],
    queryFn: async () => {
      let q = supabase.from('cg_messages').select('*').order('created_at', { ascending: false }).limit(20);
      if (channelId) q = q.eq('channel_id', channelId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CgMessage[];
    },
    enabled: isSupabaseConfigured,
    refetchInterval: 15_000,
  });
}

// ─── TRAINING ASSIGNMENTS ───────────────────────────────
export interface CgTrainingAssignment {
  id: string;
  module_id: string;
  user_id: string;
  status: string;
  score: number | null;
  due_at: string | null;
  completed_at: string | null;
}

export function useMyTraining(userId?: string | null) {
  return useQuery({
    queryKey: ['cg_training_assignments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('cg_training_assignments')
        .select('*, cg_training_modules(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseConfigured && !!userId,
  });
}

// ─── CHANNELS ───────────────────────────────────────────
export function useChannels() {
  return useQuery({
    queryKey: ['cg_channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_channels')
        .select('*')
        .eq('is_archived', false)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── SOPs ───
export function useSops(category?: string) {
  return useQuery({
    queryKey: ['cgsops', category],
    queryFn: async () => {
      let q = supabase.from('cgsops').select('*').order('created_at', { ascending: false });
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (error) { console.warn('[useSops]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── Tasks ───
export function useTasks(locationId?: string) {
  return useQuery({
    queryKey: ['cgtasks', locationId],
    queryFn: async () => {
      let q = supabase.from('cgtasks').select('*').order('created_at', { ascending: false });
      if (locationId) q = q.eq('location_id', locationId);
      const { data, error } = await q;
      if (error) { console.warn('[useTasks]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── Training Modules ───
export function useTrainingModules() {
  return useQuery({
    queryKey: ['cg_training_modules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cg_training_modules').select('*').order('title');
      if (error) { console.warn('[useTrainingModules]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── Chat Messages ───
export function useChatMessages(channelId?: string) {
  return useQuery({
    queryKey: ['cg_messages', channelId],
    queryFn: async () => {
      let q = supabase.from('cg_messages').select('*').order('created_at', { ascending: true });
      if (channelId) q = q.eq('channel_id', channelId);
      const { data, error } = await q;
      if (error) { console.warn('[useChatMessages]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
    refetchInterval: 5000,
  });
}

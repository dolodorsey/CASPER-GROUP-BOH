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
    queryKey: ['cg_sops', category],
    queryFn: async () => {
      let q = supabase.from('cg_sops').select('*').order('created_at', { ascending: false });
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
    queryKey: ['cg_tasks', locationId],
    queryFn: async () => {
      let q = supabase.from('cg_tasks').select('*').order('created_at', { ascending: false });
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

// ─── SCHEDULES ──────────────────────────────────────────
export function useSchedules(locationId?: string) {
  return useQuery({
    queryKey: ['cg_schedules', locationId],
    queryFn: async () => {
      let q = supabase.from('cg_schedules').select('*').order('week_of', { ascending: false });
      if (locationId) q = q.eq('location_id', locationId);
      const { data, error } = await q;
      if (error) { console.warn('[useSchedules]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
  });
}

export function useShiftsForSchedule(scheduleId?: string) {
  return useQuery({
    queryKey: ['cg_shifts_schedule', scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];
      const { data, error } = await supabase
        .from('cg_shifts')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('start_time', { ascending: true });
      if (error) { console.warn('[useShiftsForSchedule]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured && !!scheduleId,
  });
}

export function useShiftsByLocation(locationId?: string, weekOf?: string) {
  return useQuery({
    queryKey: ['cg_shifts_location', locationId, weekOf],
    queryFn: async () => {
      if (!locationId) return [];
      let q = supabase.from('cg_shifts').select('*').eq('location_id', locationId).order('start_time', { ascending: true });
      if (weekOf) {
        const start = new Date(weekOf);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        q = q.gte('start_time', start.toISOString()).lt('start_time', end.toISOString());
      }
      const { data, error } = await q;
      if (error) { console.warn('[useShiftsByLocation]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured && !!locationId,
  });
}

// ─── REPORTS DAILY ──────────────────────────────────────
export function useReportsDaily(filters: {
  locationId?: string; brandId?: string;
  startDate?: string; endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['cg_reports_daily', filters],
    queryFn: async () => {
      let q = supabase.from('cg_reports_daily').select('*').order('report_date', { ascending: false });
      if (filters.locationId) q = q.eq('location_id', filters.locationId);
      if (filters.brandId) q = q.eq('brand_id', filters.brandId);
      if (filters.startDate) q = q.gte('report_date', filters.startDate);
      if (filters.endDate) q = q.lte('report_date', filters.endDate);
      const { data, error } = await q;
      if (error) { console.warn('[useReportsDaily]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── TRAINING PROGRESS ──────────────────────────────────
export function useTrainingProgress(userId?: string | null) {
  return useQuery({
    queryKey: ['cg_training_progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('cg_training_progress')
        .select('*, cg_training_modules(*)')
        .eq('user_id', userId);
      if (error) { console.warn('[useTrainingProgress]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured && !!userId,
  });
}

// ─── SOP ACKNOWLEDGEMENTS ───────────────────────────────
export function useSopAcknowledgements(sopId?: string) {
  return useQuery({
    queryKey: ['cg_sop_acks', sopId],
    queryFn: async () => {
      if (!sopId) return [];
      const { data, error } = await supabase
        .from('cg_sop_acknowledgements')
        .select('*')
        .eq('sop_id', sopId);
      if (error) return [];
      return data as any[];
    },
    enabled: isSupabaseConfigured && !!sopId,
  });
}

// ─── CHANNEL MEMBERS ────────────────────────────────────
export function useChannelMembers(channelId?: string) {
  return useQuery({
    queryKey: ['cg_channel_members', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const { data, error } = await supabase
        .from('cg_channel_members')
        .select('*')
        .eq('channel_id', channelId);
      if (error) return [];
      return data as any[];
    },
    enabled: isSupabaseConfigured && !!channelId,
  });
}

// ─── ALL PROFILES (for admin user management) ───────────
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) { console.warn('[useProfiles]', error.message); return []; }
      return data as any[];
    },
    enabled: isSupabaseConfigured,
  });
}

// ─── FINANCIALS (Admin only — Partner sees scoped to their location) ──
export interface CgFinancialKpi {
  brand_id: string | null;
  location_id: string | null;
  days_with_data: number;
  revenue_30d: number | null;
  food_cost_30d: number | null;
  labor_cost_30d: number | null;
  food_cost_pct: number | null;
  labor_cost_pct: number | null;
  net_margin_pct: number | null;
  gross_margin_pct: number | null;
  orders_30d: number | null;
  avg_ticket_30d: number | null;
  customer_rating_30d: number | null;
  sla_pct_30d: number | null;
  labor_hours_30d: number | null;
  revenue_per_labor_hour: number | null;
}

/** 30-day rolling KPIs. Pass scope to filter; omit for enterprise total. */
export function useFinancialKpis30d(scope?: { brandId?: string; locationId?: string }) {
  return useQuery({
    queryKey: ['v_cg_financial_kpis_30d', scope],
    queryFn: async () => {
      // If filtered, query the per-row view; otherwise the totals view.
      if (scope?.brandId || scope?.locationId) {
        let q = supabase.from('v_cg_financial_kpis_30d').select('*');
        if (scope.brandId) q = q.eq('brand_id', scope.brandId);
        if (scope.locationId) q = q.eq('location_id', scope.locationId);
        const { data, error } = await q;
        if (error) { console.warn('[useFinancialKpis30d]', error.message); return null; }
        // Aggregate filtered rows in-memory
        if (!data || data.length === 0) return null;
        const sumRev = data.reduce((s, r) => s + Number(r.revenue_30d || 0), 0);
        const sumFood = data.reduce((s, r) => s + Number(r.food_cost_30d || 0), 0);
        const sumLab = data.reduce((s, r) => s + Number(r.labor_cost_30d || 0), 0);
        const sumOrders = data.reduce((s, r) => s + Number(r.orders_30d || 0), 0);
        const sumLabHrs = data.reduce((s, r) => s + Number(r.labor_hours_30d || 0), 0);
        return {
          brand_id: scope.brandId ?? null, location_id: scope.locationId ?? null,
          days_with_data: Math.max(...data.map(r => Number(r.days_with_data || 0))),
          revenue_30d: sumRev, food_cost_30d: sumFood, labor_cost_30d: sumLab,
          food_cost_pct: sumRev > 0 ? Number(((sumFood / sumRev) * 100).toFixed(2)) : 0,
          labor_cost_pct: sumRev > 0 ? Number(((sumLab / sumRev) * 100).toFixed(2)) : 0,
          net_margin_pct: sumRev > 0 ? Number((((sumRev - sumFood - sumLab) / sumRev) * 100).toFixed(2)) : 0,
          gross_margin_pct: sumRev > 0 ? Number((((sumRev - sumFood) / sumRev) * 100).toFixed(2)) : 0,
          orders_30d: sumOrders,
          avg_ticket_30d: sumOrders > 0 ? Number((sumRev / sumOrders).toFixed(2)) : 0,
          customer_rating_30d: data.reduce((s, r) => s + Number(r.customer_rating_30d || 0), 0) / data.length,
          sla_pct_30d: data.reduce((s, r) => s + Number(r.sla_pct_30d || 0), 0) / data.length,
          labor_hours_30d: sumLabHrs,
          revenue_per_labor_hour: sumLabHrs > 0 ? Number((sumRev / sumLabHrs).toFixed(2)) : 0,
        } as CgFinancialKpi;
      }
      const { data, error } = await supabase.from('v_cg_financial_kpis_30d_total').select('*').single();
      if (error) { console.warn('[useFinancialKpis30d total]', error.message); return null; }
      return data as CgFinancialKpi;
    },
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  });
}

export interface CgFinancialMonthly {
  id: string; month: string; brand_id: string | null; location_id: string | null;
  revenue: number; cogs: number; food_cost: number; labor_cost: number;
  rent: number; utilities: number; marketing: number; delivery_fees: number; other_expenses: number;
  gross_profit: number; ebitda: number;
  cash_on_hand: number; ar: number; ap: number;
  orders_count: number; avg_ticket: number; customer_rating: number | null; sla_pct: number | null;
}

export function useFinancialsMonthly(scope?: { brandId?: string; locationId?: string; monthsBack?: number }) {
  return useQuery({
    queryKey: ['cg_financials_monthly', scope],
    queryFn: async () => {
      let q = supabase.from('cg_financials_monthly').select('*').order('month', { ascending: false });
      if (scope?.brandId) q = q.eq('brand_id', scope.brandId);
      if (scope?.locationId) q = q.eq('location_id', scope.locationId);
      if (scope?.monthsBack) q = q.limit(scope.monthsBack);
      const { data, error } = await q;
      if (error) { console.warn('[useFinancialsMonthly]', error.message); return []; }
      return (data ?? []) as CgFinancialMonthly[];
    },
    enabled: isSupabaseConfigured,
    staleTime: 5 * 60_000,
  });
}

// ─── SOPs grouped by section, for an entity (brand) ─────
export interface CgSop {
  id: string; brand_id: string | null; location_id: string | null;
  title: string; category: string | null; section: string | null;
  content: string | null; file_url: string | null; file_type: string | null;
  version: string; status: string; requires_ack: boolean;
  effective_date: string | null; created_at: string; updated_at: string;
}

export function useSopsByBrand(brandId?: string) {
  return useQuery({
    queryKey: ['cg_sops_by_brand', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from('cg_sops')
        .select('*')
        .eq('brand_id', brandId)
        .order('section')
        .order('title');
      if (error) { console.warn('[useSopsByBrand]', error.message); return []; }
      return (data ?? []) as CgSop[];
    },
    enabled: isSupabaseConfigured && !!brandId,
    staleTime: 60_000,
  });
}

export interface CgSopCount {
  brand_id: string; brand_name: string; brand_slug: string;
  section: string; sop_count: number; last_updated: string | null;
}

export function useSopCountsByBrand() {
  return useQuery({
    queryKey: ['v_cg_sop_counts_by_brand_section'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_cg_sop_counts_by_brand_section')
        .select('*');
      if (error) { console.warn('[useSopCountsByBrand]', error.message); return []; }
      return (data ?? []) as CgSopCount[];
    },
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  });
}

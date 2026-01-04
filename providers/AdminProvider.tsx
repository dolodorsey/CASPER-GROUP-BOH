import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminState, Alert, KPIMetric, Location, Brand, Incident, Ticket } from '@/types/admin';
import { supabase } from '@/lib/supabase';

interface AdminContextType extends AdminState {
  setActiveTab: (tab: string) => void;
  setSelectedLocation: (location: Location | null) => void;
  setSelectedBrand: (brand: Brand | null) => void;
  acknowledgeAlert: (alertId: string) => void;
  applyPlaybook: (alertId: string) => Promise<void>;
  refreshData: () => void;
  alerts: Alert[];
  kpis: KPIMetric[];
  locations: Location[];
  brands: Brand[];
  incidents: Incident[];
  tickets: Ticket[];
  isLoadingAlerts: boolean;
  isLoadingKPIs: boolean;
  isApplyingPlaybook: boolean;
}

export const [AdminProvider, useAdmin] = createContextHook<AdminContextType>(() => {
  const queryClient = useQueryClient();
  const [adminState, setAdminState] = useState<AdminState>({
    currentUser: null,
    selectedLocation: null,
    selectedBrand: null,
    activeTab: 'dashboard',
    notifications: [],
    isLoading: false,
    lastSync: new Date().toISOString(),
  });

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const stored = await AsyncStorage.getItem('admin_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAdminState(prev => ({
            ...prev,
            selectedLocation: parsed.selectedLocation,
            selectedBrand: parsed.selectedBrand,
            activeTab: parsed.activeTab || 'dashboard',
          }));
        }
        
        // Load current user from Supabase
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setAdminState(prev => ({
            ...prev,
            currentUser: {
              id: userData.user.id,
              email: userData.user.email || '',
              name: userData.user.user_metadata?.name || 'Admin User',
              role: 'admin',
            },
          }));
        }
      } catch (error) {
        console.error('Failed to load admin state:', error);
      }
    };
    
    loadPersistedState();
  }, []);

  const persistState = useCallback(async (newState: Partial<AdminState>) => {
    try {
      const stateToPersist = {
        selectedLocation: newState.selectedLocation,
        selectedBrand: newState.selectedBrand,
        activeTab: newState.activeTab,
      };
      await AsyncStorage.setItem('admin_state', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error('Failed to persist admin state:', error);
    }
  }, []);

  // Fetch alerts from Supabase
  const alertsQuery = useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch KPIs from Supabase
  const kpisQuery = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_kpis')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });

  // Fetch locations from Supabase
  const locationsQuery = useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_locations')
        .select('*')
        .eq('access_enabled', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch brands from Supabase
  const brandsQuery = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch incidents from Supabase
  const incidentsQuery = useQuery({
    queryKey: ['admin', 'incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch tickets from Supabase
  const ticketsQuery = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cg_tickets')
        .select('*')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('cg_alerts')
        .update({ status: 'acknowledged' })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });

  const applyPlaybookMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('cg_alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`Playbook applied for alert ${alertId} - syncing to Employee & Partner portals`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const setActiveTab = useCallback((tab: string) => {
    const newState = { ...adminState, activeTab: tab };
    setAdminState(newState);
    persistState(newState);
  }, [adminState, persistState]);

  const setSelectedLocation = useCallback((location: Location | null) => {
    const newState = { ...adminState, selectedLocation: location };
    setAdminState(newState);
    persistState(newState);
  }, [adminState, persistState]);

  const setSelectedBrand = useCallback((brand: Brand | null) => {
    const newState = { ...adminState, selectedBrand: brand };
    setAdminState(newState);
    persistState(newState);
  }, [adminState, persistState]);

  const { mutate: acknowledgeAlertMutate } = acknowledgeAlertMutation;
  const { mutateAsync: applyPlaybookMutateAsync } = applyPlaybookMutation;

  const acknowledgeAlert = useCallback((alertId: string) => {
    acknowledgeAlertMutate(alertId);
  }, [acknowledgeAlertMutate]);

  const applyPlaybook = useCallback(async (alertId: string) => {
    await applyPlaybookMutateAsync(alertId);
  }, [applyPlaybookMutateAsync]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
    setAdminState(prev => ({ ...prev, lastSync: new Date().toISOString() }));
  }, [queryClient]);

  return useMemo(() => ({
    ...adminState,
    setActiveTab,
    setSelectedLocation,
    setSelectedBrand,
    acknowledgeAlert,
    applyPlaybook,
    refreshData,
    alerts: alertsQuery.data || [],
    kpis: kpisQuery.data || [],
    locations: locationsQuery.data || [],
    brands: brandsQuery.data || [],
    incidents: incidentsQuery.data || [],
    tickets: ticketsQuery.data || [],
    isLoadingAlerts: alertsQuery.isLoading,
    isLoadingKPIs: kpisQuery.isLoading,
    isApplyingPlaybook: applyPlaybookMutation.isPending,
  }), [
    adminState,
    setActiveTab,
    setSelectedLocation,
    setSelectedBrand,
    acknowledgeAlert,
    applyPlaybook,
    refreshData,
    alertsQuery.data,
    alertsQuery.isLoading,
    kpisQuery.data,
    kpisQuery.isLoading,
    locationsQuery.data,
    brandsQuery.data,
    incidentsQuery.data,
    ticketsQuery.data,
    applyPlaybookMutation.isPending,
  ]);
});

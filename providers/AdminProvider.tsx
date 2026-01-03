import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminState, Alert, KPIMetric, Location, Brand, Incident, Ticket } from '@/types/admin';
import { 
  WASHINGTON_PARQ_LOCATION, 
  ADMIN_BRANDS, 
  LIVE_ALERTS, 
  DASHBOARD_KPIS, 
  RECENT_INCIDENTS,
  ACTIVE_TICKETS,
  MOCK_USERS 
} from '@/mocks/washingtonParq';

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

const simulateApiCall = <T,>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

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
        
        setAdminState(prev => ({
          ...prev,
          currentUser: MOCK_USERS[0],
        }));
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

  const alertsQuery = useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => simulateApiCall(LIVE_ALERTS),
    refetchInterval: 30000,
  });

  const kpisQuery = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: () => simulateApiCall(DASHBOARD_KPIS),
    refetchInterval: 10000,
  });

  const locationsQuery = useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: () => simulateApiCall([WASHINGTON_PARQ_LOCATION]),
  });

  const brandsQuery = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => simulateApiCall(ADMIN_BRANDS),
  });

  const incidentsQuery = useQuery({
    queryKey: ['admin', 'incidents'],
    queryFn: () => simulateApiCall(RECENT_INCIDENTS),
  });

  const ticketsQuery = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: () => simulateApiCall(ACTIVE_TICKETS),
    refetchInterval: 5000,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await simulateApiCall({ success: true }, 300);
      return alertId;
    },
    onSuccess: (alertId) => {
      queryClient.setQueryData(['admin', 'alerts'], (old: Alert[] | undefined) => {
        if (!old) return old;
        return old.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' as const }
            : alert
        );
      });
    },
  });

  const applyPlaybookMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await simulateApiCall({ success: true }, 2000);
      return alertId;
    },
    onSuccess: (alertId) => {
      queryClient.setQueryData(['admin', 'alerts'], (old: Alert[] | undefined) => {
        if (!old) return old;
        return old.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved' as const }
            : alert
        );
      });
      
      console.log(`Playbook applied for alert ${alertId} - syncing to Employee & Partner portals`);
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
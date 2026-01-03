import React, { useCallback, useMemo, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Alert, KPIMetric } from "@/types/admin";
import { useAuth } from "@/providers/AuthProvider";

type AdminTab = "overview" | "kpis" | "alerts" | "settings";

type AdminContextType = {
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;

  alerts: Alert[];
  isLoadingAlerts: boolean;

  kpis: KPIMetric[];
  isLoadingKPIs: boolean;

  acknowledgeAlert: (alertId: string) => Promise<void>;
  applyPlaybook: (alertId: string, playbookId: string) => Promise<void>;

  refreshData: () => Promise<void>;
  isApplyingPlaybook: boolean;
};

async function fetchAlerts(locationId: string | null) {
  // If your alerts table has location_id, this will scope. If not, it will return all alerts allowed by RLS.
  let q = supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (locationId) {
    // Safe: if column doesn't exist, Supabase returns an error; we catch and retry without the filter.
    try {
      const scoped = await q.eq("location_id", locationId);
      if (!scoped.error) return (scoped.data ?? []) as any[];
    } catch (_) {}
  }

  const res = await q;
  if (res.error) throw res.error;
  return (res.data ?? []) as any[];
}

function mapAlert(row: any): Alert {
  return {
    id: row.id,
    type: row.type ?? row.severity ?? "info",
    title: row.title ?? "Alert",
    message: row.message ?? "",
    timestamp: row.created_at ? new Date(row.created_at).toLocaleString() : "",
    location: row.location_name ?? row.location_id ?? "All Locations",
    priority: row.priority ?? row.severity ?? "medium",
    status: row.acknowledged ? "acknowledged" : "active",
    category: row.category ?? "general",
    playbookId: row.playbook_id ?? "default",
  };
}

function stubKPIs(): KPIMetric[] {
  // Placeholder KPIs; replace with computed metrics once you add shift/ticket/sales tables.
  return [
    { id: "kpi-revenue", title: "Revenue", value: "$0", change: 0, trend: "neutral", status: "good", timeframe: "Today", category: "sales" },
    { id: "kpi-orders", title: "Orders", value: "0", change: 0, trend: "neutral", status: "good", timeframe: "Today", category: "ops" },
    { id: "kpi-staff", title: "Staffing", value: "—", change: 0, trend: "neutral", status: "good", timeframe: "Now", category: "people" },
  ] as any;
}

export const [AdminProvider, useAdmin] = createContextHook<AdminContextType>(() => {
  const queryClient = useQueryClient();
  const { activeLocationId, userId } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isApplyingPlaybook, setIsApplyingPlaybook] = useState(false);

  const alertsQuery = useQuery({
    queryKey: ["alerts", activeLocationId],
    queryFn: () => fetchAlerts(activeLocationId),
    staleTime: 10_000,
  });

  const alerts = useMemo(() => (alertsQuery.data ?? []).map(mapAlert), [alertsQuery.data]);
  const kpis = useMemo(() => stubKPIs(), []);

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      // RLS must allow: admin/employee can update acknowledged fields
      const res = await supabase
        .from("alerts")
        .update({ acknowledged: true, acknowledged_by: userId, acknowledged_at: new Date().toISOString() })
        .eq("id", alertId);

      if (res.error) throw res.error;
      await queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    [queryClient, userId]
  );

  const applyPlaybook = useCallback(
    async (alertId: string, playbookId: string) => {
      setIsApplyingPlaybook(true);
      try {
        // Optional: create a ticket/task record tied to the alert
        const attempt = await supabase.from("tickets").insert({
          title: `Playbook: ${playbookId}`,
          description: `Applied playbook ${playbookId} to alert ${alertId}`,
          status: "open",
          created_by: userId,
          location_id: activeLocationId,
          source_alert_id: alertId,
        } as any);

        // If tickets table doesn't have these columns yet, ignore and just acknowledge.
        if (attempt.error) {
          // no-op
        }
        await acknowledgeAlert(alertId);
      } finally {
        setIsApplyingPlaybook(false);
      }
    },
    [acknowledgeAlert, activeLocationId, userId]
  );

  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["alerts"] }),
    ]);
  }, [queryClient]);

  return {
    activeTab,
    setActiveTab,
    alerts,
    isLoadingAlerts: alertsQuery.isLoading,
    kpis,
    isLoadingKPIs: false,
    acknowledgeAlert,
    applyPlaybook,
    refreshData,
    isApplyingPlaybook,
  };
});

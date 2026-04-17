import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { COLORS } from '@/constants/colors';
import { useBrands, useLocations, useAlerts, useKpis, useTickets } from '@/hooks/useSupabaseData';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  low: '#6B7280',
};

export default function ActiveSystemsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: locations = [], isLoading: locsLoading } = useLocations();
  const { data: alerts = [], refetch: refetchAlerts } = useAlerts();
  const { data: kpis = [], refetch: refetchKpis } = useKpis();
  const { data: tickets = [], refetch: refetchTickets } = useTickets();

  const loading = brandsLoading || locsLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAlerts(), refetchKpis(), refetchTickets()]);
    setRefreshing(false);
  };

  const activeAlerts = useMemo(
    () => alerts.filter((a: any) => a.status === 'active'),
    [alerts],
  );

  const activeTickets = useMemo(
    () => tickets.filter((t: any) => ['new', 'in_progress', 'ready'].includes(t.status)),
    [tickets],
  );

  const slaKpi = kpis.find((k: any) => k.name.toLowerCase().includes('sla'));
  const revenueKpi = kpis.find((k: any) => k.name.toLowerCase().includes('revenue'));

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.moltenGold} />
        <Text style={s.loadingText}>LOADING COMMAND CENTER...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.moltenGold} />
      }
    >
      <View style={s.content}>
        <Text style={s.greeting}>Command Center</Text>
        <Text style={s.subtitle}>
          {activeAlerts.length === 0 ? 'All systems operational' : `${activeAlerts.length} active alert${activeAlerts.length === 1 ? '' : 's'}`}
        </Text>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{brands.length}</Text>
            <Text style={s.statLabel}>BRANDS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{locations.length}</Text>
            <Text style={s.statLabel}>LOCATIONS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNumber, { color: activeTickets.length > 0 ? COLORS.electricBlue : COLORS.emeraldGreen }]}>
              {activeTickets.length}
            </Text>
            <Text style={s.statLabel}>LIVE TICKETS</Text>
          </View>
        </View>

        {(slaKpi || revenueKpi) && (
          <View style={s.statsRow}>
            {revenueKpi && (
              <View style={[s.statCard, { flex: 1.2 }]}>
                <Text style={[s.statNumber, { fontSize: 22, color: COLORS.moltenGold }]}>
                  ${Number(revenueKpi.value).toLocaleString()}
                </Text>
                <Text style={s.statLabel}>REVENUE L30D</Text>
              </View>
            )}
            {slaKpi && (
              <View style={[s.statCard, { flex: 1 }]}>
                <Text style={[s.statNumber, { color: Number(slaKpi.value) >= 95 ? COLORS.emeraldGreen : COLORS.warning }]}>
                  {slaKpi.value}%
                </Text>
                <Text style={s.statLabel}>SLA COMPLIANCE</Text>
              </View>
            )}
          </View>
        )}

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Active Locations</Text>
          <TouchableOpacity onPress={() => router.push('/admin')}>
            <Text style={s.sectionAction}>Manage →</Text>
          </TouchableOpacity>
        </View>
        {locations.length === 0 ? (
          <Text style={s.emptyText}>No locations configured yet.</Text>
        ) : (
          locations.map((loc: any) => {
            const locTickets = activeTickets.filter((t: any) => t.location_id === loc.id).length;
            return (
              <TouchableOpacity
                key={loc.id}
                style={s.locationCard}
                onPress={() => router.push('/admin')}
              >
                <View style={s.locationIcon}>
                  <Ionicons name="storefront" size={20} color={COLORS.moltenGold} />
                </View>
                <View style={s.locationMeta}>
                  <Text style={s.locationName}>{loc.name}</Text>
                  <Text style={s.locationAddress}>
                    {loc.city ? `${loc.city}, ${loc.state ?? 'GA'}` : loc.address ?? '—'}
                  </Text>
                </View>
                <View style={s.locationRight}>
                  <Text style={s.locationBadge}>{locTickets}</Text>
                  <Text style={s.locationBadgeLabel}>tickets</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Alerts</Text>
        {activeAlerts.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.emeraldGreen} />
            <Text style={s.emptyCardText}>No active alerts. All systems nominal.</Text>
          </View>
        ) : (
          activeAlerts.map((alert: any) => (
            <View key={alert.id} style={s.alertRow}>
              <View style={[s.alertDot, { backgroundColor: SEVERITY_COLOR[alert.severity] ?? COLORS.lightGray }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertText}>{alert.title}</Text>
                {alert.message ? <Text style={s.alertSubtext}>{alert.message}</Text> : null}
              </View>
              <Text style={s.alertTime}>
                {new Date(alert.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  loadingContainer: { flex: 1, backgroundColor: COLORS.deepBlack, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.moltenGold, marginTop: 12, letterSpacing: 2, fontSize: 12 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  greeting: { color: COLORS.pureWhite, fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: COLORS.lightGray, fontSize: 14, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray },
  statNumber: { color: COLORS.moltenGold, fontSize: 28, fontWeight: '700' },
  statLabel: { color: COLORS.lightGray, fontSize: 10, letterSpacing: 1.5, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: COLORS.pureWhite, fontSize: 18, fontWeight: '600' },
  sectionAction: { color: COLORS.moltenGold, fontSize: 13 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderGray },
  locationIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  locationMeta: { flex: 1 },
  locationName: { color: COLORS.pureWhite, fontSize: 15, fontWeight: '600' },
  locationAddress: { color: COLORS.lightGray, fontSize: 12, marginTop: 2 },
  locationRight: { alignItems: 'flex-end' },
  locationBadge: { color: COLORS.electricBlue, fontSize: 18, fontWeight: '700' },
  locationBadgeLabel: { color: COLORS.lightGray, fontSize: 10, letterSpacing: 1 },
  emptyText: { color: COLORS.lightGray, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray },
  emptyCardText: { color: COLORS.lightGray, fontSize: 13, flex: 1 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderGray },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertText: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '500' },
  alertSubtext: { color: COLORS.lightGray, fontSize: 12, marginTop: 2 },
  alertTime: { color: COLORS.lightGray, fontSize: 11 },
});

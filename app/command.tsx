import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, Activity, DollarSign, Users, Clock, TrendingUp, Zap, X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useBrands, useKpis, useAlerts, useTickets } from '@/hooks/useSupabaseData';

export default function CommandScreen() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: kpis = [], isLoading: kpisLoading, refetch: refetchKpis } = useKpis();
  const { data: alerts = [], refetch: refetchAlerts } = useAlerts();
  const { data: tickets = [], refetch: refetchTickets } = useTickets();
  const [refreshing, setRefreshing] = useState(false);

  const loading = brandsLoading || kpisLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchKpis(), refetchAlerts(), refetchTickets()]);
    setRefreshing(false);
  };

  const getKpi = (name: string) => kpis.find(k => k.name === name);
  const activeAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'error');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color={COLORS.moltenGold} />
        <Text style={styles.loadingText}>INITIALIZING COMMAND CENTER...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={[COLORS.electricBlue, COLORS.deepBlue]} style={styles.logoContainer}>
              <Zap color={COLORS.pureWhite} size={28} />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.title}>COMMAND CENTER</Text>
              <Text style={styles.subtitle}>LIVE OPERATIONS DASHBOARD</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X color={COLORS.pureWhite} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.moltenGold} />}
        >
          <View style={styles.content}>
            {/* Brand Filter */}
            <View style={styles.brandFilter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.brandButton, !selectedBrand && styles.brandButtonActive]}
                  onPress={() => setSelectedBrand(null)}
                >
                  {!selectedBrand ? (
                    <LinearGradient colors={[COLORS.moltenGold, COLORS.darkGold]} style={styles.brandButtonGradient}>
                      <Text style={styles.brandButtonTextActive}>All Brands</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.brandButtonText}>All Brands</Text>
                  )}
                </TouchableOpacity>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={[styles.brandButton, selectedBrand === brand.id && styles.brandButtonActive]}
                    onPress={() => setSelectedBrand(brand.id)}
                  >
                    {selectedBrand === brand.id ? (
                      <LinearGradient colors={[COLORS.moltenGold, COLORS.darkGold]} style={styles.brandButtonGradient}>
                        <Text style={styles.brandButtonTextActive}>{brand.name}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.brandButtonText}>{brand.name}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Critical Alerts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <AlertTriangle color={COLORS.alertRed} size={20} />
                </View>
                <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeAlerts.length}</Text>
                </View>
              </View>
              <View style={styles.alertCard}>
                {alerts.length === 0 ? (
                  <Text style={styles.alertText}>No active alerts</Text>
                ) : (
                  alerts.slice(0, 4).map((alert) => (
                    <View key={alert.id} style={styles.alertRow}>
                      <View style={[styles.alertDot, {
                        backgroundColor: alert.severity === 'critical' ? COLORS.alertRed
                          : alert.severity === 'error' ? COLORS.alertRed
                          : alert.severity === 'warning' ? COLORS.warning
                          : COLORS.info
                      }]} />
                      <Text style={styles.alertText}>{alert.title}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* KPIs */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(0, 191, 255, 0.2)' }]}>
                  <Activity color={COLORS.electricBlue} size={20} />
                </View>
                <Text style={styles.sectionTitle}>KEY METRICS</Text>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricCard}>
                  <LinearGradient colors={['rgba(80, 200, 120, 0.15)', 'rgba(0, 107, 60, 0.1)']} style={styles.metricGradient}>
                    <DollarSign color={COLORS.emeraldGreen} size={24} />
                    <Text style={styles.metricValue}>${getKpi('Total Revenue (30d)')?.value ?? '—'}</Text>
                    <Text style={styles.metricLabel}>Revenue (30d)</Text>
                  </LinearGradient>
                </View>
                <View style={styles.metricCard}>
                  <LinearGradient colors={['rgba(0, 191, 255, 0.15)', 'rgba(0, 63, 127, 0.1)']} style={styles.metricGradient}>
                    <TrendingUp color={COLORS.electricBlue} size={24} />
                    <Text style={styles.metricValue}>{getKpi('Active Orders')?.value ?? '0'}</Text>
                    <Text style={styles.metricLabel}>Active Orders</Text>
                  </LinearGradient>
                </View>
              </View>
              <View style={[styles.metricRow, { marginTop: 12 }]}>
                <View style={styles.metricCard}>
                  <LinearGradient colors={['rgba(255, 215, 0, 0.15)', 'rgba(184, 134, 11, 0.1)']} style={styles.metricGradient}>
                    <Text style={styles.metricValueLarge}>{getKpi('SLA Compliance')?.value ?? '—'}%</Text>
                    <Text style={styles.metricLabel}>SLA Compliance</Text>
                  </LinearGradient>
                </View>
                <View style={styles.metricCard}>
                  <LinearGradient colors={['rgba(229, 228, 226, 0.15)', 'rgba(229, 228, 226, 0.05)']} style={styles.metricGradient}>
                    <Text style={styles.metricValueLarge}>{getKpi('Customer Rating')?.value ?? '—'}</Text>
                    <Text style={styles.metricLabel}>Customer Rating</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Live Tickets */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                  <Clock color={COLORS.moltenGold} size={20} />
                </View>
                <Text style={styles.sectionTitle}>LIVE TICKETS</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tickets.length}</Text>
                </View>
              </View>
              <View style={styles.alertCard}>
                {tickets.length === 0 ? (
                  <Text style={styles.alertText}>No active tickets</Text>
                ) : (
                  tickets.slice(0, 5).map((ticket) => (
                    <View key={ticket.id} style={styles.alertRow}>
                      <View style={[styles.alertDot, {
                        backgroundColor: ticket.priority === 'vip' ? COLORS.moltenGold
                          : ticket.priority === 'high' ? COLORS.alertRed
                          : COLORS.electricBlue
                      }]} />
                      <Text style={styles.alertText}>
                        {ticket.provider.toUpperCase()} — ${ticket.total.toFixed(2)} — {ticket.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Live Status Footer */}
            <View style={styles.statusFooter}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>LIVE • Auto-refresh every 5s</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.deepBlack },
  loadingText: { marginTop: 16, fontSize: 12, color: COLORS.platinum, letterSpacing: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerText: { marginLeft: 16 },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 2 },
  subtitle: { fontSize: 11, color: COLORS.platinum, letterSpacing: 2, marginTop: 4 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.darkCharcoal, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 40 },
  brandFilter: { paddingHorizontal: 20, paddingBottom: 20 },
  brandButton: { marginRight: 10, borderRadius: 20, overflow: 'hidden' },
  brandButtonActive: { borderRadius: 20 },
  brandButtonGradient: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  brandButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.lightGray, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.darkCharcoal, borderRadius: 20, overflow: 'hidden' },
  brandButtonTextActive: { fontSize: 13, fontWeight: '700', color: COLORS.deepBlack },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.platinum, letterSpacing: 2, flex: 1 },
  badge: { backgroundColor: COLORS.alertRed, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: COLORS.pureWhite, fontSize: 12, fontWeight: '800' },
  alertCard: { backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.alertRed, marginRight: 12 },
  alertText: { flex: 1, fontSize: 13, color: COLORS.lightGray, lineHeight: 18 },
  metricRow: { flexDirection: 'row', gap: 12 },
  metricCard: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  metricGradient: { padding: 20, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGray },
  metricValue: { fontSize: 28, fontWeight: '800', color: COLORS.pureWhite, marginTop: 12 },
  metricValueLarge: { fontSize: 32, fontWeight: '800', color: COLORS.pureWhite },
  metricLabel: { fontSize: 11, color: COLORS.lightGray, marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  statusFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emeraldGreen, marginRight: 8 },
  statusText: { fontSize: 11, color: COLORS.lightGray, letterSpacing: 1 },
  warning: '#F59E0B',
  info: '#3B82F6',
});

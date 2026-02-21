import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, AlertTriangle, BarChart3, Settings, Users, MapPin, ChefHat, Activity } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useBrands, useLocations, useKpis, useAlerts } from '@/hooks/useSupabaseData';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: brands } = useBrands();
  const { data: locations } = useLocations();
  const { data: kpis } = useKpis();
  const { data: alerts } = useAlerts();

  const activeAlerts = alerts?.filter(a => a.status === 'active') ?? [];
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'error');
  const revenueKpi = kpis?.find(k => k.name.includes('Revenue'));
  const ordersKpi = kpis?.find(k => k.name.includes('Orders'));
  const ratingKpi = kpis?.find(k => k.name.includes('Rating'));
  const slaKpi = kpis?.find(k => k.name.includes('SLA'));

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={[COLORS.moltenGold, COLORS.darkGold]} style={styles.headerIcon}>
              <Shield color={COLORS.deepBlack} size={20} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>ADMIN COMMAND</Text>
              <Text style={styles.subtitle}>Welcome back, {profile?.full_name || 'Admin'}</Text>
            </View>
          </View>

          {/* Live Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{brands?.length ?? '—'}</Text>
              <Text style={styles.statLabel}>BRANDS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{locations?.length ?? '—'}</Text>
              <Text style={styles.statLabel}>LOCATIONS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, criticalAlerts.length > 0 && { color: COLORS.alertRed }]}>
                {activeAlerts.length}
              </Text>
              <Text style={styles.statLabel}>ALERTS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{ratingKpi?.value ?? '—'}</Text>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
          </View>

          {/* KPI Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>KEY METRICS</Text>
            <View style={styles.kpiGrid}>
              {[
                { label: 'Revenue (30d)', value: revenueKpi ? `$${Number(revenueKpi.value).toLocaleString()}` : '—', icon: BarChart3, color: COLORS.moltenGold },
                { label: 'Active Orders', value: ordersKpi?.value ?? '—', icon: Activity, color: COLORS.electricBlue },
                { label: 'SLA Compliance', value: slaKpi ? `${slaKpi.value}%` : '—', icon: Shield, color: slaKpi?.status === 'good' ? COLORS.emeraldGreen : COLORS.warning },
                { label: 'Customer Rating', value: ratingKpi ? `${ratingKpi.value}/5` : '—', icon: Users, color: COLORS.emeraldGreen },
              ].map((kpi, i) => (
                <View key={i} style={styles.kpiCard}>
                  <kpi.icon color={kpi.color} size={20} />
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                  <Text style={styles.kpiLabel}>{kpi.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE ALERTS</Text>
              {activeAlerts.slice(0, 4).map((alert, i) => (
                <View key={i} style={[styles.alertRow, { borderLeftColor: alert.severity === 'critical' ? COLORS.alertRed : alert.severity === 'error' ? COLORS.alertRed : alert.severity === 'warning' ? COLORS.warning : COLORS.info }]}>
                  <AlertTriangle color={alert.severity === 'critical' || alert.severity === 'error' ? COLORS.alertRed : COLORS.warning} size={16} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMeta}>{alert.severity.toUpperCase()} • {alert.source || 'System'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionGrid}>
              {[
                { title: 'Command Center', desc: 'Live ops dashboard', icon: Activity, route: '/command', color: COLORS.electricBlue },
                { title: 'Alerts & Incidents', desc: `${activeAlerts.length} active`, icon: AlertTriangle, route: '/admin/alerts', color: COLORS.alertRed },
                { title: 'Reports & KPIs', desc: `${kpis?.length ?? 0} metrics tracked`, icon: BarChart3, route: '/admin/reports', color: COLORS.moltenGold },
                { title: 'Settings & Access', desc: 'Brands, roles, locations', icon: Settings, route: '/admin/settings', color: COLORS.platinum },
              ].map((action, i) => (
                <TouchableOpacity key={i} style={styles.actionCard} onPress={() => router.push(action.route as any)}>
                  <action.icon color={action.color} size={22} />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 2 },
  subtitle: { fontSize: 13, color: COLORS.lightGray, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderGray },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.moltenGold },
  statLabel: { fontSize: 9, color: COLORS.lightGray, letterSpacing: 1.5, marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 2, marginBottom: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: { width: '48%', backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray, gap: 6 },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiLabel: { fontSize: 11, color: COLORS.lightGray },
  alertRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, marginBottom: 8, borderLeftWidth: 3 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: COLORS.pureWhite },
  alertMeta: { fontSize: 11, color: COLORS.lightGray, marginTop: 2 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: { width: '48%', backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray, gap: 8 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.pureWhite },
  actionDesc: { fontSize: 11, color: COLORS.lightGray },
});

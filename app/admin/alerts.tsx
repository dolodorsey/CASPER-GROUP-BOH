import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ShieldAlert, Info, AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useAlerts } from '@/hooks/useSupabaseData';

const severityConfig: Record<string, { color: string; icon: any }> = {
  critical: { color: COLORS.alertRed, icon: ShieldAlert },
  error: { color: COLORS.alertRed, icon: AlertCircle },
  warning: { color: COLORS.warning, icon: AlertTriangle },
  info: { color: COLORS.info, icon: Info },
};

export default function AdminAlerts() {
  const { data: alerts, isLoading, refetch } = useAlerts();
  const active = alerts?.filter(a => a.status === 'active') ?? [];
  const resolved = alerts?.filter(a => a.status !== 'active') ?? [];

  const renderAlert = (alert: any, i: number) => {
    const config = severityConfig[alert.severity] || severityConfig.info;
    const Icon = config.icon;
    return (
      <View key={i} style={[styles.alertCard, { borderLeftColor: config.color }]}>
        <Icon color={config.color} size={18} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <View style={styles.alertMeta}>
            <Text style={[styles.badge, { backgroundColor: config.color }]}>{alert.severity.toUpperCase()}</Text>
            <Text style={styles.metaText}>{alert.source || 'System'}</Text>
          </View>
          {alert.description && <Text style={styles.alertDesc}>{alert.description}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.moltenGold} />}>
          <View style={styles.header}>
            <Text style={styles.title}>ALERTS & INCIDENTS</Text>
            <Text style={styles.subtitle}>{active.length} active • {resolved.length} resolved</Text>
          </View>

          {active.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE ({active.length})</Text>
              {active.map(renderAlert)}
            </View>
          )}

          {resolved.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RESOLVED ({resolved.length})</Text>
              {resolved.map(renderAlert)}
            </View>
          )}

          {(!alerts || alerts.length === 0) && !isLoading && (
            <View style={styles.emptyState}>
              <AlertTriangle color={COLORS.lightGray} size={40} />
              <Text style={styles.emptyText}>No alerts at this time</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 2 },
  subtitle: { fontSize: 13, color: COLORS.lightGray, marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 2, marginBottom: 12 },
  alertCard: { flexDirection: 'row', backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, marginBottom: 10, borderLeftWidth: 3, borderWidth: 1, borderColor: COLORS.borderGray },
  alertTitle: { fontSize: 15, fontWeight: '700', color: COLORS.pureWhite },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  badge: { fontSize: 9, fontWeight: '800', color: COLORS.deepBlack, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', letterSpacing: 1 },
  metaText: { fontSize: 11, color: COLORS.lightGray },
  alertDesc: { fontSize: 12, color: COLORS.lightGray, marginTop: 6, lineHeight: 18 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.lightGray },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useKpis, useBrands, useLocations } from '@/hooks/useSupabaseData';

export default function AdminReports() {
  const { data: kpis, isLoading, refetch } = useKpis();
  const { data: brands } = useBrands();
  const { data: locations } = useLocations();

  const formatValue = (k: any) => {
    if (k.unit === 'USD') return `$${Number(k.value).toLocaleString()}`;
    if (k.unit === 'percent') return `${k.value}%`;
    return k.value;
  };

  const statusColor = (status: string) => {
    if (status === 'good') return COLORS.emeraldGreen;
    if (status === 'warning') return COLORS.warning;
    return COLORS.alertRed;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.moltenGold} />}>
          <View style={styles.header}>
            <Text style={styles.title}>REPORTS & KPIs</Text>
            <Text style={styles.subtitle}>{kpis?.length ?? 0} metrics • {brands?.length ?? 0} brands • {locations?.length ?? 0} locations</Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            {kpis?.slice(0, 4).map((k, i) => (
              <View key={i} style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: statusColor(k.status) }]}>{formatValue(k)}</Text>
                <Text style={styles.summaryLabel}>{k.name}</Text>
                <View style={styles.trendRow}>
                  {k.trend_direction === 'up' ? <TrendingUp color={COLORS.emeraldGreen} size={12} /> 
                   : k.trend_direction === 'down' ? <TrendingDown color={COLORS.alertRed} size={12} />
                   : <Minus color={COLORS.lightGray} size={12} />}
                  <Text style={[styles.trendText, { color: k.trend_direction === 'up' ? COLORS.emeraldGreen : k.trend_direction === 'down' ? COLORS.alertRed : COLORS.lightGray }]}>
                    {k.trend_value !== 0 ? `${k.trend_value > 0 ? '+' : ''}${k.trend_value}%` : 'Steady'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Full KPI Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ALL METRICS</Text>
            {kpis?.map((k, i) => (
              <View key={i} style={styles.kpiRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(k.status) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.kpiName}>{k.name}</Text>
                  <Text style={styles.kpiCategory}>{k.category || 'General'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.kpiValue, { color: statusColor(k.status) }]}>{formatValue(k)}</Text>
                  {k.trend_value !== 0 && (
                    <Text style={[styles.kpiTrend, { color: k.trend_direction === 'up' ? COLORS.emeraldGreen : COLORS.alertRed }]}>
                      {k.trend_value > 0 ? '↑' : '↓'} {Math.abs(k.trend_value)}%
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

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
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  summaryCard: { width: '48%', backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { fontSize: 11, color: COLORS.lightGray, marginTop: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  trendText: { fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 2, marginBottom: 12 },
  kpiRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.borderGray, gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  kpiName: { fontSize: 14, fontWeight: '600', color: COLORS.pureWhite },
  kpiCategory: { fontSize: 11, color: COLORS.lightGray, marginTop: 2 },
  kpiValue: { fontSize: 16, fontWeight: '800' },
  kpiTrend: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});

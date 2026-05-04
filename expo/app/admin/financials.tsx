import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Percent, Package, Star,
  Clock, Users, Wallet, FileText, ChevronRight, Filter, Download, X, Check,
} from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import {
  useFinancialKpis30d, useFinancialsMonthly, useBrands, useLocations,
} from '@/hooks/useSupabaseData';

type KpiKey =
  | 'revenue' | 'foodCostPct' | 'laborCostPct' | 'netMarginPct'
  | 'orders' | 'avgTicket' | 'slaPct' | 'rating'
  | 'cashOnHand' | 'ebitda' | 'grossMargin' | 'revPerLaborHr';

const KPI_DEFS: { key: KpiKey; label: string; icon: any; format: (v: any) => string; color: string }[] = [
  { key: 'revenue',       label: 'Revenue (L30D)',     icon: DollarSign,  color: COLORS.moltenGold,    format: v => v ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—' },
  { key: 'foodCostPct',   label: 'Food Cost %',        icon: Package,     color: COLORS.alertRed,      format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
  { key: 'laborCostPct',  label: 'Labor Cost %',       icon: Users,       color: COLORS.electricBlue,  format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
  { key: 'netMarginPct',  label: 'Net Margin %',       icon: TrendingUp,  color: COLORS.emeraldGreen,  format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
  { key: 'orders',        label: 'Orders (L30D)',      icon: Package,     color: COLORS.platinum,      format: v => v ? Number(v).toLocaleString() : '—' },
  { key: 'avgTicket',     label: 'Avg Ticket',         icon: DollarSign,  color: COLORS.moltenGold,    format: v => v ? `$${Number(v).toFixed(2)}` : '—' },
  { key: 'slaPct',        label: 'SLA %',              icon: Clock,       color: COLORS.emeraldGreen,  format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
  { key: 'rating',        label: 'Customer Rating',    icon: Star,        color: COLORS.moltenGold,    format: v => v ? `${Number(v).toFixed(2)} ★` : '—' },
  { key: 'cashOnHand',    label: 'Cash on Hand',       icon: Wallet,      color: COLORS.emeraldGreen,  format: v => v ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—' },
  { key: 'ebitda',        label: 'EBITDA (L30D)',      icon: TrendingUp,  color: COLORS.emeraldGreen,  format: v => v != null ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—' },
  { key: 'grossMargin',   label: 'Gross Margin %',     icon: Percent,     color: COLORS.electricBlue,  format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
  { key: 'revPerLaborHr', label: 'Revenue / Labor Hr', icon: TrendingUp,  color: COLORS.platinum,      format: v => v ? `$${Number(v).toFixed(2)}` : '—' },
];

const DEFAULT_KPIS: KpiKey[] = ['revenue','foodCostPct','laborCostPct','netMarginPct','orders','avgTicket','slaPct','rating'];

const REPORTS = [
  { key: 'pnl_monthly',     icon: FileText,  title: 'Monthly P&L',         description: 'Revenue, COGS, OpEx, EBITDA by month', period: 'Last 12 months' },
  { key: 'food_cost',       icon: Package,   title: 'Food Cost Analysis',  description: 'COGS breakdown by brand & location',   period: 'L30D' },
  { key: 'labor_cost',      icon: Users,     title: 'Labor Efficiency',    description: 'Labor cost %, hours, revenue/hour',    period: 'L30D' },
  { key: 'cash_flow',       icon: Wallet,    title: 'Cash Flow Statement', description: 'Operating, investing, financing',      period: 'Last 90 days' },
  { key: 'brand_pnl',       icon: TrendingUp,title: 'Brand P&L',           description: 'Revenue & profit by brand',            period: 'L30D' },
  { key: 'location_pnl',    icon: TrendingUp,title: 'Location P&L',        description: 'Revenue & profit by location',         period: 'L30D' },
  { key: 'delivery_fees',   icon: TrendingDown,title: 'Delivery Fee Drag', description: 'DoorDash / UE / GH commissions',       period: 'L30D' },
  { key: 'tax_summary',     icon: FileText,  title: 'Tax Summary',         description: 'Sales tax collected, due, paid',       period: 'YTD' },
];

const fmtMoney = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtMonth = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export default function AdminFinancialsScreen() {
  const router = useRouter();
  const [selectedKpis, setSelectedKpis] = useState<KpiKey[]>(DEFAULT_KPIS);
  const [showKpiPicker, setShowKpiPicker] = useState(false);
  const [scopeBrand, setScopeBrand] = useState<string | null>(null);
  const [scopeLocation, setScopeLocation] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: brands = [] } = useBrands();
  const { data: locations = [] } = useLocations();
  const { data: kpis, refetch: refetchKpis, isLoading: kpisLoading } = useFinancialKpis30d({
    brandId: scopeBrand ?? undefined,
    locationId: scopeLocation ?? undefined,
  });
  const { data: monthly = [], refetch: refetchMonthly } = useFinancialsMonthly({
    brandId: scopeBrand ?? undefined,
    locationId: scopeLocation ?? undefined,
    monthsBack: 12,
  });

  const kpiValueMap: Record<KpiKey, any> = useMemo(() => {
    if (!kpis) return {} as any;
    const ebitdaTotal = monthly.reduce((s, m) => s + Number(m.ebitda || 0), 0);
    const cashTotal   = monthly[0]?.cash_on_hand ?? 0;
    return {
      revenue:       kpis.revenue_30d,
      foodCostPct:   kpis.food_cost_pct,
      laborCostPct:  kpis.labor_cost_pct,
      netMarginPct:  kpis.net_margin_pct,
      orders:        kpis.orders_30d,
      avgTicket:     kpis.avg_ticket_30d,
      slaPct:        kpis.sla_pct_30d,
      rating:        kpis.customer_rating_30d,
      cashOnHand:    cashTotal,
      ebitda:        ebitdaTotal,
      grossMargin:   kpis.gross_margin_pct,
      revPerLaborHr: kpis.revenue_per_labor_hour,
    } as Record<KpiKey, any>;
  }, [kpis, monthly]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchKpis(), refetchMonthly()]);
    setRefreshing(false);
  };

  const toggleKpi = (k: KpiKey) => {
    setSelectedKpis(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k].slice(0, 12));
  };

  const visibleKpiDefs = KPI_DEFS.filter(d => selectedKpis.includes(d.key));

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft color={COLORS.pureWhite} size={22} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>FINANCIALS</Text>
            <Text style={styles.subtitle}>P&L · KPIs · Reports</Text>
          </View>
          <TouchableOpacity onPress={() => setShowKpiPicker(s => !s)} style={styles.iconBtn}>
            <Filter color={showKpiPicker ? COLORS.moltenGold : COLORS.pureWhite} size={20} />
          </TouchableOpacity>
        </View>

        {/* KPI Picker */}
        {showKpiPicker && (
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>SHOW KPIs ({selectedKpis.length}/12)</Text>
              <TouchableOpacity onPress={() => setShowKpiPicker(false)}><X color={COLORS.lightGray} size={18} /></TouchableOpacity>
            </View>
            <View style={styles.pickerGrid}>
              {KPI_DEFS.map(k => {
                const active = selectedKpis.includes(k.key);
                return (
                  <TouchableOpacity key={k.key} onPress={() => toggleKpi(k.key)} style={[styles.pickerChip, active && styles.pickerChipActive]}>
                    {active && <Check color={COLORS.deepBlack} size={12} />}
                    <Text style={[styles.pickerChipText, active && styles.pickerChipTextActive]}>{k.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Scope chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scopeRow} contentContainerStyle={styles.scopeRowContent}>
          <TouchableOpacity style={[styles.scopeChip, !scopeBrand && !scopeLocation && styles.scopeChipActive]} onPress={() => { setScopeBrand(null); setScopeLocation(null); }}>
            <Text style={[styles.scopeChipText, !scopeBrand && !scopeLocation && styles.scopeChipTextActive]}>All Casper</Text>
          </TouchableOpacity>
          <Text style={styles.scopeDivider}>BRANDS</Text>
          {brands.map(b => (
            <TouchableOpacity key={b.id} style={[styles.scopeChip, scopeBrand === b.id && styles.scopeChipActive]} onPress={() => { setScopeBrand(scopeBrand === b.id ? null : b.id); setScopeLocation(null); }}>
              <Text style={[styles.scopeChipText, scopeBrand === b.id && styles.scopeChipTextActive]}>{b.name}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.scopeDivider}>LOCATIONS</Text>
          {locations.map(l => (
            <TouchableOpacity key={l.id} style={[styles.scopeChip, scopeLocation === l.id && styles.scopeChipActive]} onPress={() => { setScopeLocation(scopeLocation === l.id ? null : l.id); setScopeBrand(null); }}>
              <Text style={[styles.scopeChipText, scopeLocation === l.id && styles.scopeChipTextActive]}>{l.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.moltenGold} />}
        >
          {/* KPI Grid */}
          <View style={styles.kpiSection}>
            <Text style={styles.sectionTitle}>KEY METRICS · LAST 30 DAYS</Text>
            {kpisLoading ? (
              <ActivityIndicator color={COLORS.moltenGold} style={{ marginVertical: 40 }} />
            ) : (
              <View style={styles.kpiGrid}>
                {visibleKpiDefs.map(def => {
                  const Icon = def.icon;
                  const value = kpiValueMap[def.key];
                  return (
                    <View key={def.key} style={styles.kpiCard}>
                      <View style={[styles.kpiIcon, { backgroundColor: `${def.color}22` }]}>
                        <Icon color={def.color} size={18} />
                      </View>
                      <Text style={styles.kpiValue}>{def.format(value)}</Text>
                      <Text style={styles.kpiLabel}>{def.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Monthly P&L */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MONTHLY P&L</Text>
              <Text style={styles.sectionSubtitle}>{monthly.length} mo</Text>
            </View>
            {monthly.length === 0 ? (
              <Text style={styles.emptyText}>No financial data for this scope yet.</Text>
            ) : (
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>Month</Text>
                  <Text style={styles.tableHeaderCell}>Revenue</Text>
                  <Text style={styles.tableHeaderCell}>COGS</Text>
                  <Text style={styles.tableHeaderCell}>EBITDA</Text>
                  <Text style={styles.tableHeaderCell}>Margin</Text>
                </View>
                {monthly.map(m => {
                  const margin = m.revenue > 0 ? (Number(m.ebitda) / Number(m.revenue)) * 100 : 0;
                  const positive = margin >= 15;
                  return (
                    <View key={m.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableCellLabel, { flex: 1.4 }]}>{fmtMonth(m.month)}</Text>
                      <Text style={styles.tableCell}>{fmtMoney(m.revenue)}</Text>
                      <Text style={styles.tableCell}>{fmtMoney(m.cogs)}</Text>
                      <Text style={[styles.tableCell, { color: m.ebitda >= 0 ? COLORS.emeraldGreen : COLORS.alertRed }]}>{fmtMoney(m.ebitda)}</Text>
                      <Text style={[styles.tableCell, { color: positive ? COLORS.emeraldGreen : COLORS.alertRed }]}>{margin.toFixed(1)}%</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Reports */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>REPORTS</Text>
              <Text style={styles.sectionSubtitle}>{REPORTS.length} available</Text>
            </View>
            {REPORTS.map(r => {
              const Icon = r.icon;
              return (
                <TouchableOpacity key={r.key} style={styles.reportCard} activeOpacity={0.7}>
                  <View style={[styles.reportIcon, { backgroundColor: `${COLORS.moltenGold}15` }]}>
                    <Icon color={COLORS.moltenGold} size={20} />
                  </View>
                  <View style={styles.reportContent}>
                    <Text style={styles.reportTitle}>{r.title}</Text>
                    <Text style={styles.reportDesc}>{r.description}</Text>
                    <Text style={styles.reportPeriod}>{r.period}</Text>
                  </View>
                  <View style={styles.reportActions}>
                    <Download color={COLORS.lightGray} size={16} />
                    <ChevronRight color={COLORS.lightGray} size={16} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderWidth: 1, borderColor: COLORS.borderGray },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 3 },
  subtitle: { fontSize: 10, color: COLORS.platinum, letterSpacing: 2, marginTop: 3 },

  pickerCard: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.darkCharcoal, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGray },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pickerTitle: { color: COLORS.platinum, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pickerChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.borderGray },
  pickerChipActive: { backgroundColor: COLORS.moltenGold, borderColor: COLORS.moltenGold },
  pickerChipText: { fontSize: 11, color: COLORS.lightGray, fontWeight: '600' },
  pickerChipTextActive: { color: COLORS.deepBlack, fontWeight: '800' },

  scopeRow: { maxHeight: 50, marginTop: 12 },
  scopeRowContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  scopeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.darkCharcoal, borderWidth: 1, borderColor: COLORS.borderGray },
  scopeChipActive: { backgroundColor: COLORS.moltenGold, borderColor: COLORS.moltenGold },
  scopeChipText: { fontSize: 12, color: COLORS.lightGray, fontWeight: '600' },
  scopeChipTextActive: { color: COLORS.deepBlack, fontWeight: '800' },
  scopeDivider: { fontSize: 9, color: COLORS.mutedGray, letterSpacing: 2, fontWeight: '700', marginHorizontal: 6 },

  section: { paddingHorizontal: 16, marginTop: 24 },
  kpiSection: { paddingHorizontal: 16, marginTop: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: COLORS.platinum, letterSpacing: 2.5 },
  sectionSubtitle: { fontSize: 10, color: COLORS.lightGray, letterSpacing: 1 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: { width: '48%', backgroundColor: COLORS.darkCharcoal, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGray },
  kpiIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: '800', color: COLORS.pureWhite, marginBottom: 4 },
  kpiLabel: { fontSize: 10, color: COLORS.lightGray, letterSpacing: 0.5, textTransform: 'uppercase' },

  tableCard: { backgroundColor: COLORS.darkCharcoal, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGray, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: COLORS.midnightBlack, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  tableHeaderCell: { flex: 1, fontSize: 10, color: COLORS.platinum, letterSpacing: 1.5, fontWeight: '700', textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  tableCell: { flex: 1, fontSize: 12, color: COLORS.pureWhite, textAlign: 'right', fontWeight: '600' },
  tableCellLabel: { textAlign: 'left', color: COLORS.platinum, fontWeight: '700' },

  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGray, marginBottom: 8 },
  reportIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reportContent: { flex: 1 },
  reportTitle: { fontSize: 14, fontWeight: '700', color: COLORS.pureWhite },
  reportDesc: { fontSize: 11, color: COLORS.lightGray, marginTop: 2 },
  reportPeriod: { fontSize: 9, color: COLORS.mutedGray, letterSpacing: 1, marginTop: 4, fontWeight: '700' },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  emptyText: { color: COLORS.lightGray, fontSize: 12, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },
});

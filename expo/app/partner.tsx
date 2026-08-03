import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  X, 
  TrendingUp, 
  DollarSign, 
  Target, 
  PieChart,
  Users,
  MapPin,
  AlertCircle,
  Activity,
  BarChart3,
  ShieldAlert
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";
import { useFinancialKpis30d, useFinancialsMonthly } from "@/hooks/useSupabaseData";

interface TabButtonProps {
  title: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  onPress: () => void;
  badge?: number;
}

function TabButton({ title, icon: Icon, isActive, onPress, badge }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <View style={styles.tabContent}>
        <Icon 
          color={isActive ? COLORS.emeraldGreen : COLORS.lightGray} 
          size={20} 
        />
        <Text style={[
          styles.tabText,
          { color: isActive ? COLORS.emeraldGreen : COLORS.lightGray }
        ]}>
          {title}
        </Text>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function PartnerPortal() {
  const router = useRouter();
  const { profile, isBooting, allowedLocations } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Never substitute an unrelated location. The portal only uses the
  // locations assigned to this verified partner profile.
  const partnerLocationId: string | null = (profile as any)?.location_id ?? null;
  const scopedLocationId = partnerLocationId || allowedLocations[0]?.id || null;
  const scopedLocationName = allowedLocations.find(l => l.id === scopedLocationId)?.name || 'Assigned location';
  const { data: scopedKpis } = useFinancialKpis30d(scopedLocationId ? { locationId: scopedLocationId } : undefined);
  const { data: scopedMonthly = [] } = useFinancialsMonthly(scopedLocationId ? { locationId: scopedLocationId, monthsBack: 6 } : undefined);
  const currentMonth = scopedMonthly[0];
  const previousMonth = scopedMonthly[1];
  const monthChange = currentMonth && previousMonth && Number(previousMonth.revenue) !== 0
    ? ((Number(currentMonth.revenue) - Number(previousMonth.revenue)) / Number(previousMonth.revenue)) * 100
    : null;
  const decisionBrief = useMemo(() => {
    if (!scopedKpis) return [];
    const notes: Array<{ title: string; body: string; tone: string }> = [];
    const food = Number(scopedKpis.food_cost_pct || 0);
    const labor = Number(scopedKpis.labor_cost_pct || 0);
    const sla = Number(scopedKpis.sla_pct_30d || 0);
    const rating = Number(scopedKpis.customer_rating_30d || 0);
    if (food >= 30) notes.push({ title: 'Food-cost review', body: `Food cost is ${food.toFixed(1)}% for the current 30-day window. Review purchasing, waste, and menu mix before setting a target.`, tone: COLORS.moltenGold });
    if (labor >= 30) notes.push({ title: 'Labor productivity review', body: `Labor cost is ${labor.toFixed(1)}%. Compare schedules with order volume and revenue per labor hour.`, tone: COLORS.electricBlue });
    if (sla > 0 && sla < 95) notes.push({ title: 'Service-time review', body: `SLA performance is ${sla.toFixed(1)}%. Trace the longest ticket windows before changing staffing or production flow.`, tone: COLORS.alertRed });
    if (rating > 0 && rating < 4.5) notes.push({ title: 'Guest-experience review', body: `Customer rating is ${rating.toFixed(2)}. Pair review themes with daypart and order data before selecting a corrective action.`, tone: COLORS.alertRed });
    if (notes.length === 0) notes.push({ title: 'Hold the operating standard', body: 'No threshold exception is visible in the current reporting window. Continue monitoring costs, service time, and guest feedback.', tone: COLORS.emeraldGreen });
    return notes;
  }, [scopedKpis]);

  if (isBooting) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.deepBlack, COLORS.darkCharcoal]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.gateContainer}>
          <ActivityIndicator size="large" color={COLORS.emeraldGreen} />
          <Text style={styles.gateText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const allowedRoles = ['partner', 'admin'];
  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.deepBlack, COLORS.darkCharcoal]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.gateContainer}>
            <ShieldAlert color={COLORS.alertRed} size={64} />
            <Text style={styles.gateTitle}>ACCESS DENIED</Text>
            <Text style={styles.gateText}>
              You do not have permission to access the Partner Portal.
            </Text>
            <Text style={styles.gateSubtext}>
              Required role: Partner or Admin
            </Text>
            <TouchableOpacity style={styles.gateButton} onPress={() => router.back()}>
              <Text style={styles.gateButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ScrollView 
            style={styles.tabContentContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.emeraldGreen}
              />
            }
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{scopedLocationName.toUpperCase()} · VERIFIED 30-DAY VIEW</Text>
              {!scopedKpis ? (
                <Text style={styles.emptyText}>No verified financial rollup is available for this assigned location yet.</Text>
              ) : (
              <View style={styles.revenueGrid}>
                <View style={styles.revenueCard}>
                  <DollarSign color={COLORS.moltenGold} size={24} />
                  <Text style={styles.revenueValue}>${Number(scopedKpis.revenue_30d || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                  <Text style={styles.revenueLabel}>Revenue</Text>
                  <Text style={styles.revenueChange}>{scopedKpis.days_with_data || 0} reporting days</Text>
                </View>
                <View style={styles.revenueCard}>
                  <TrendingUp color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.revenueValue}>{Number(scopedKpis.net_margin_pct || 0).toFixed(1)}%</Text>
                  <Text style={styles.revenueLabel}>Operating Margin</Text>
                  <Text style={styles.revenueChange}>After food + labor</Text>
                </View>
                <View style={styles.revenueCard}>
                  <Target color={COLORS.electricBlue} size={24} />
                  <Text style={styles.revenueValue}>{Number(scopedKpis.sla_pct_30d || 0).toFixed(1)}%</Text>
                  <Text style={styles.revenueLabel}>SLA Performance</Text>
                  <Text style={styles.revenueChange}>{Number(scopedKpis.orders_30d || 0).toLocaleString()} orders</Text>
                </View>
              </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MONTHLY OPERATING RECORD</Text>
              {scopedMonthly.length === 0 ? <Text style={styles.emptyText}>Monthly statements have not been published for this location.</Text> : scopedMonthly.slice(0, 3).map((month) => (
                <View key={month.id} style={styles.brandCard}>
                  <View style={styles.brandHeader}>
                    <Text style={styles.brandName}>{new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                    <Text style={styles.brandRevenue}>${Number(month.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                  </View>
                  <View style={styles.brandMetrics}>
                    <Text style={styles.brandMetric}>{Number(month.orders_count || 0).toLocaleString()} orders</Text>
                    <Text style={styles.brandMetric}>Avg ${Number(month.avg_ticket || 0).toFixed(2)}</Text>
                    <Text style={styles.brandMetric}>EBITDA ${Number(month.ebitda || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('financials')}>
                  <BarChart3 color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.quickActionText}>Open Financials</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('statements')}>
                  <Users color={COLORS.electricBlue} size={24} />
                  <Text style={styles.quickActionText}>Review Statements</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('decisions')}>
                  <AlertCircle color={COLORS.moltenGold} size={24} />
                  <Text style={styles.quickActionText}>Decision Brief</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'locations':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>LOCATION PERFORMANCE</Text>
            
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <MapPin color={COLORS.moltenGold} size={20} />
                <Text style={styles.locationName}>{scopedLocationName}</Text>
                <View style={[styles.statusDot, { backgroundColor: scopedLocationId ? COLORS.emeraldGreen : COLORS.alertRed }]} />
              </View>
              
              <View style={styles.locationStats}>
                <View style={styles.locationStat}>
                  <Text style={styles.locationStatValue}>${Number(scopedKpis?.revenue_30d || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                  <Text style={styles.locationStatLabel}>Revenue (L30D)</Text>
                </View>
                <View style={styles.locationStat}>
                  <Text style={styles.locationStatValue}>{Number(scopedKpis?.orders_30d || 0).toLocaleString()}</Text>
                  <Text style={styles.locationStatLabel}>Orders</Text>
                </View>
                <View style={styles.locationStat}>
                  <Text style={styles.locationStatValue}>{scopedKpis?.days_with_data || 0}</Text>
                  <Text style={styles.locationStatLabel}>Reporting Days</Text>
                </View>
              </View>

              <View style={styles.locationMetrics}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>On-Time Rate</Text>
                  <Text style={styles.metricValue}>{Number(scopedKpis?.sla_pct_30d || 0).toFixed(1)}%</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Customer Rating</Text>
                  <Text style={styles.metricValue}>{Number(scopedKpis?.customer_rating_30d || 0).toFixed(2)}/5</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Revenue / Labor Hour</Text>
                  <Text style={styles.metricValue}>${Number(scopedKpis?.revenue_per_labor_hour || 0).toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewDetailsButton} onPress={() => setActiveTab('financials')}>
              <Text style={styles.viewDetailsButtonText}>View Detailed Analytics</Text>
            </TouchableOpacity>
          </View>
        );

      case 'statements':
        return (
          <ScrollView style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>PUBLISHED MONTHLY STATEMENTS</Text>
            <Text style={styles.contextText}>These are operating statements from the connected reporting ledger. This screen does not label revenue as a payout or settlement.</Text>
            {scopedMonthly.length === 0 ? <Text style={styles.emptyText}>No statements have been published for this assigned location.</Text> : scopedMonthly.map((month) => (
              <View key={month.id} style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <Text style={styles.payoutDate}>{new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                  <Text style={styles.payoutPeriod}>{Number(month.orders_count || 0).toLocaleString()} orders · Avg ticket ${Number(month.avg_ticket || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.payoutItemRight}>
                  <Text style={styles.payoutItemAmount}>${Number(month.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                  <Text style={styles.payoutPeriod}>EBITDA ${Number(month.ebitda || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'decisions':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>DECISION BRIEF</Text>
            <Text style={styles.contextText}>Signals are generated from the assigned location’s current reporting window. They are review prompts, not forecasts or guaranteed outcomes.</Text>
            <View style={styles.opportunityList}>
              {decisionBrief.map((note) => (
                <View key={note.title} style={[styles.opportunityCard, { borderLeftWidth: 3, borderLeftColor: note.tone }]}>
                  <View style={styles.opportunityHeader}>
                    <Target color={note.tone} size={20} />
                    <Text style={styles.opportunityTitle}>{note.title}</Text>
                  </View>
                  <Text style={styles.opportunityDescription}>{note.body}</Text>
                </View>
              ))}
              {monthChange !== null && (
                <View style={styles.opportunityCard}>
                  <View style={styles.opportunityHeader}>
                    <TrendingUp color={monthChange >= 0 ? COLORS.emeraldGreen : COLORS.alertRed} size={20} />
                    <Text style={styles.opportunityTitle}>Month-over-month context</Text>
                  </View>
                  <Text style={styles.opportunityDescription}>Published revenue changed {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(1)}% from the prior monthly statement. Review the underlying daypart, channel, and cost data before taking action.</Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'financials':
        return (
          <ScrollView
            style={styles.tabContentContainer}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.emeraldGreen} />}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{scopedLocationName.toUpperCase()} · LAST 30 DAYS</Text>
              {!scopedKpis ? (
                <Text style={{ color: COLORS.lightGray, fontStyle: 'italic', paddingVertical: 16 }}>No financial data for your location yet.</Text>
              ) : (
                <View style={styles.revenueGrid}>
                  <View style={styles.revenueCard}>
                    <DollarSign color={COLORS.moltenGold} size={24} />
                    <Text style={styles.revenueValue}>${Number(scopedKpis.revenue_30d || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                    <Text style={styles.revenueLabel}>Revenue</Text>
                  </View>
                  <View style={styles.revenueCard}>
                    <PieChart color={COLORS.alertRed} size={24} />
                    <Text style={styles.revenueValue}>{Number(scopedKpis.food_cost_pct || 0).toFixed(1)}%</Text>
                    <Text style={styles.revenueLabel}>Food Cost</Text>
                  </View>
                  <View style={styles.revenueCard}>
                    <Users color={COLORS.electricBlue} size={24} />
                    <Text style={styles.revenueValue}>{Number(scopedKpis.labor_cost_pct || 0).toFixed(1)}%</Text>
                    <Text style={styles.revenueLabel}>Labor Cost</Text>
                  </View>
                  <View style={styles.revenueCard}>
                    <TrendingUp color={COLORS.emeraldGreen} size={24} />
                    <Text style={styles.revenueValue}>{Number(scopedKpis.net_margin_pct || 0).toFixed(1)}%</Text>
                    <Text style={styles.revenueLabel}>Net Margin</Text>
                  </View>
                  <View style={styles.revenueCard}>
                    <BarChart3 color={COLORS.platinum} size={24} />
                    <Text style={styles.revenueValue}>{Number(scopedKpis.orders_30d || 0).toLocaleString()}</Text>
                    <Text style={styles.revenueLabel}>Orders</Text>
                  </View>
                  <View style={styles.revenueCard}>
                    <DollarSign color={COLORS.moltenGold} size={24} />
                    <Text style={styles.revenueValue}>${Number(scopedKpis.avg_ticket_30d || 0).toFixed(2)}</Text>
                    <Text style={styles.revenueLabel}>Avg Ticket</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT MONTHLY P&L</Text>
              {scopedMonthly.length === 0 ? (
                <Text style={{ color: COLORS.lightGray, fontStyle: 'italic', paddingVertical: 16 }}>No monthly rollups yet.</Text>
              ) : (
                scopedMonthly.map(m => {
                  const margin = m.revenue > 0 ? (Number(m.ebitda) / Number(m.revenue)) * 100 : 0;
                  return (
                    <View key={m.id} style={[styles.revenueCard, { width: '100%', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                      <View>
                        <Text style={[styles.revenueValue, { fontSize: 14 }]}>{new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                        <Text style={styles.revenueLabel}>{Number(m.orders_count || 0).toLocaleString()} orders</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.revenueValue, { fontSize: 16, color: COLORS.moltenGold }]}>${Number(m.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                        <Text style={[styles.revenueLabel, { color: m.ebitda >= 0 ? COLORS.emeraldGreen : COLORS.alertRed }]}>EBITDA ${Number(m.ebitda).toLocaleString(undefined, { maximumFractionDigits: 0 })} · {margin.toFixed(1)}%</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepBlack, COLORS.darkCharcoal]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TrendingUp color={COLORS.emeraldGreen} size={28} />
            <View>
              <Text style={styles.title}>PARTNER INTELLIGENCE</Text>
              <Text style={styles.subtitle}>Executive Lounge</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X color={COLORS.pureWhite} size={24} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          <TabButton
            title="Dashboard"
            icon={Activity}
            isActive={activeTab === 'dashboard'}
            onPress={() => setActiveTab('dashboard')}
          />
          <TabButton
            title="Locations"
            icon={MapPin}
            isActive={activeTab === 'locations'}
            onPress={() => setActiveTab('locations')}
          />
          <TabButton
            title="My Financials"
            icon={BarChart3}
            isActive={activeTab === 'financials'}
            onPress={() => setActiveTab('financials')}
          />
          <TabButton
            title="Statements"
            icon={DollarSign}
            isActive={activeTab === 'statements'}
            onPress={() => setActiveTab('statements')}
          />
          <TabButton
            title="Decision Brief"
            icon={Target}
            isActive={activeTab === 'decisions'}
            onPress={() => setActiveTab('decisions')}
          />
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.pureWhite,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.platinum,
    letterSpacing: 2,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkCharcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  tabBarContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabButton: {
    marginRight: 24,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.emeraldGreen,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.alertRed,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
  content: {
    flex: 1,
  },
  tabContentContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.platinum,
    letterSpacing: 2,
    marginBottom: 16,
  },
  contextText: {
    fontSize: 13,
    color: COLORS.lightGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.lightGray,
    fontStyle: 'italic',
    lineHeight: 20,
    paddingVertical: 16,
  },
  revenueGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    alignItems: 'center',
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.pureWhite,
    marginTop: 8,
  },
  revenueLabel: {
    fontSize: 11,
    color: COLORS.lightGray,
    marginTop: 4,
    textAlign: 'center',
  },
  revenueChange: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emeraldGreen,
    marginTop: 4,
  },
  brandList: {
    gap: 16,
  },
  brandCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
  brandRevenue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.moltenGold,
  },
  brandMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandMetric: {
    fontSize: 11,
    color: COLORS.lightGray,
  },
  brandProgress: {
    height: 4,
    backgroundColor: COLORS.deepBlack,
    borderRadius: 2,
  },
  brandProgressFill: {
    height: '100%',
    backgroundColor: COLORS.emeraldGreen,
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.platinum,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginLeft: 12,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationStat: {
    alignItems: 'center',
  },
  locationStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
  locationStatLabel: {
    fontSize: 10,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  locationMetrics: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.emeraldGreen,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
  payoutSummary: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  payoutCard: {
    flex: 1,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.pureWhite,
    marginBottom: 8,
  },
  payoutStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.emeraldGreen,
  },
  payoutHistory: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.platinum,
    letterSpacing: 2,
    marginBottom: 16,
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  payoutItemLeft: {
    flex: 1,
  },
  payoutDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  payoutPeriod: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  payoutItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payoutItemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.moltenGold,
  },
  exportButton: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
  opportunityList: {
    gap: 20,
  },
  opportunityCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginLeft: 12,
  },
  opportunityDescription: {
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  opportunityImpact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactLabel: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  impactValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emeraldGreen,
  },
  opportunityButton: {
    backgroundColor: COLORS.emeraldGreen,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  opportunityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  gateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  gateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.alertRed,
    marginTop: 24,
    letterSpacing: 2,
  },
  gateText: {
    fontSize: 16,
    color: COLORS.platinum,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  gateSubtext: {
    fontSize: 13,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: 8,
  },
  gateButton: {
    marginTop: 32,
    backgroundColor: COLORS.emeraldGreen,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  gateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
});

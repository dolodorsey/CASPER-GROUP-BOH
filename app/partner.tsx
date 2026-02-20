import React, { useState } from "react";
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
  CheckCircle,
  Activity,
  BarChart3,
  ShieldAlert
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";

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
  const { profile, isBooting } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isBooting) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.deepBlack, COLORS.darkCharcoal]}
          style={StyleSheet.absoluteFillObject}
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
          style={StyleSheet.absoluteFillObject}
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
            {/* Revenue Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REVENUE OVERVIEW</Text>
              <View style={styles.revenueGrid}>
                <View style={styles.revenueCard}>
                  <DollarSign color={COLORS.moltenGold} size={24} />
                  <Text style={styles.revenueValue}>$678,400</Text>
                  <Text style={styles.revenueLabel}>Last 30 Days</Text>
                  <Text style={styles.revenueChange}>+12.5%</Text>
                </View>
                <View style={styles.revenueCard}>
                  <TrendingUp color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.revenueValue}>$116,200</Text>
                  <Text style={styles.revenueLabel}>This Week</Text>
                  <Text style={styles.revenueChange}>+8.3%</Text>
                </View>
                <View style={styles.revenueCard}>
                  <Target color={COLORS.electricBlue} size={24} />
                  <Text style={styles.revenueValue}>94.2%</Text>
                  <Text style={styles.revenueLabel}>Target Achievement</Text>
                  <Text style={styles.revenueChange}>-1.8%</Text>
                </View>
              </View>
            </View>

            {/* Brand Performance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BRAND PERFORMANCE</Text>
              <View style={styles.brandList}>
                <View style={styles.brandCard}>
                  <View style={styles.brandHeader}>
                    <Text style={styles.brandName}>Patty Daddy</Text>
                    <Text style={styles.brandRevenue}>$97,300</Text>
                  </View>
                  <View style={styles.brandMetrics}>
                    <Text style={styles.brandMetric}>AOV: $22.75</Text>
                    <Text style={styles.brandMetric}>Orders: 3,156</Text>
                    <Text style={styles.brandMetric}>Margin: 28.9%</Text>
                  </View>
                  <View style={styles.brandProgress}>
                    <View style={[styles.brandProgressFill, { width: '89%' }]} />
                  </View>
                </View>

                <View style={styles.brandCard}>
                  <View style={styles.brandHeader}>
                    <Text style={styles.brandName}>Angel Wings</Text>
                    <Text style={styles.brandRevenue}>$122,400</Text>
                  </View>
                  <View style={styles.brandMetrics}>
                    <Text style={styles.brandMetric}>AOV: $18.50</Text>
                    <Text style={styles.brandMetric}>Orders: 2,847</Text>
                    <Text style={styles.brandMetric}>Margin: 32.1%</Text>
                  </View>
                  <View style={styles.brandProgress}>
                    <View style={[styles.brandProgressFill, { width: '95%' }]} />
                  </View>
                </View>

                <View style={styles.brandCard}>
                  <View style={styles.brandHeader}>
                    <Text style={styles.brandName}>Taco Yaki</Text>
                    <Text style={styles.brandRevenue}>$86,700</Text>
                  </View>
                  <View style={styles.brandMetrics}>
                    <Text style={styles.brandMetric}>AOV: $16.25</Text>
                    <Text style={styles.brandMetric}>Orders: 1,923</Text>
                    <Text style={styles.brandMetric}>Margin: 35.7%</Text>
                  </View>
                  <View style={styles.brandProgress}>
                    <View style={[styles.brandProgressFill, { width: '78%' }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <BarChart3 color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.quickActionText}>View Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Users color={COLORS.electricBlue} size={24} />
                  <Text style={styles.quickActionText}>Staff Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <AlertCircle color={COLORS.moltenGold} size={24} />
                  <Text style={styles.quickActionText}>View Alerts</Text>
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
                <Text style={styles.locationName}>Atlanta HQ</Text>
                <View style={[styles.statusDot, { backgroundColor: COLORS.emeraldGreen }]} />
              </View>
              
              <View style={styles.locationStats}>
                <View style={styles.locationStat}>
                  <Text style={styles.locationStatValue}>$678,400</Text>
                  <Text style={styles.locationStatLabel}>Revenue (L30D)</Text>
                </View>
                <View style={styles.locationStat}>
                  <Text style={styles.locationStatValue}>42</Text>
                  <Text style={styles.locationStatLabel}>Employees</Text>
                </View>
                <View style={styles.locationStat}>
                  <Text style={styles.locationStatValue}>8</Text>
                  <Text style={styles.locationStatLabel}>Active Brands</Text>
                </View>
              </View>

              <View style={styles.locationMetrics}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>On-Time Rate</Text>
                  <Text style={styles.metricValue}>94.2%</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Customer Rating</Text>
                  <Text style={styles.metricValue}>4.8/5</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Training Compliance</Text>
                  <Text style={styles.metricValue}>87.5%</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsButtonText}>View Detailed Analytics</Text>
            </TouchableOpacity>
          </View>
        );

      case 'payouts':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>REVENUE SETTLEMENT</Text>
            
            <View style={styles.payoutSummary}>
              <View style={styles.payoutCard}>
                <Text style={styles.payoutLabel}>This Week</Text>
                <Text style={styles.payoutAmount}>$116,200</Text>
                <Text style={styles.payoutStatus}>Cleared</Text>
              </View>
              
              <View style={styles.payoutCard}>
                <Text style={styles.payoutLabel}>Pending Review</Text>
                <Text style={styles.payoutAmount}>$8,400</Text>
                <Text style={styles.payoutStatus}>Under Review</Text>
              </View>
            </View>

            <View style={styles.payoutHistory}>
              <Text style={styles.historyTitle}>Recent Payouts</Text>
              
              <View style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <Text style={styles.payoutDate}>Jan 15, 2024</Text>
                  <Text style={styles.payoutPeriod}>Week of Jan 8-14</Text>
                </View>
                <View style={styles.payoutItemRight}>
                  <Text style={styles.payoutItemAmount}>$108,750</Text>
                  <CheckCircle color={COLORS.emeraldGreen} size={16} />
                </View>
              </View>

              <View style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <Text style={styles.payoutDate}>Jan 8, 2024</Text>
                  <Text style={styles.payoutPeriod}>Week of Jan 1-7</Text>
                </View>
                <View style={styles.payoutItemRight}>
                  <Text style={styles.payoutItemAmount}>$95,200</Text>
                  <CheckCircle color={COLORS.emeraldGreen} size={16} />
                </View>
              </View>

              <View style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <Text style={styles.payoutDate}>Jan 1, 2024</Text>
                  <Text style={styles.payoutPeriod}>Week of Dec 25-31</Text>
                </View>
                <View style={styles.payoutItemRight}>
                  <Text style={styles.payoutItemAmount}>$112,900</Text>
                  <CheckCircle color={COLORS.emeraldGreen} size={16} />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export Payout History</Text>
            </TouchableOpacity>
          </View>
        );

      case 'opportunities':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>STRATEGIC OPPORTUNITIES</Text>
            
            <View style={styles.opportunityList}>
              <View style={styles.opportunityCard}>
                <View style={styles.opportunityHeader}>
                  <TrendingUp color={COLORS.emeraldGreen} size={20} />
                  <Text style={styles.opportunityTitle}>Weekend Surge Optimization</Text>
                </View>
                <Text style={styles.opportunityDescription}>
                  Mojo Juice shows +14% weekend demand. Consider adding weekend-specific menu items.
                </Text>
                <View style={styles.opportunityImpact}>
                  <Text style={styles.impactLabel}>Potential Impact:</Text>
                  <Text style={styles.impactValue}>+$12,000/month</Text>
                </View>
                <TouchableOpacity style={styles.opportunityButton}>
                  <Text style={styles.opportunityButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.opportunityCard}>
                <View style={styles.opportunityHeader}>
                  <Target color={COLORS.electricBlue} size={20} />
                  <Text style={styles.opportunityTitle}>Training Compliance Boost</Text>
                </View>
                <Text style={styles.opportunityDescription}>
                  Increasing training compliance from 87.5% to 95% could improve efficiency by 8%.
                </Text>
                <View style={styles.opportunityImpact}>
                  <Text style={styles.impactLabel}>Potential Impact:</Text>
                  <Text style={styles.impactValue}>+$8,500/month</Text>
                </View>
                <TouchableOpacity style={styles.opportunityButton}>
                  <Text style={styles.opportunityButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.opportunityCard}>
                <View style={styles.opportunityHeader}>
                  <PieChart color={COLORS.moltenGold} size={20} />
                  <Text style={styles.opportunityTitle}>Brand Mix Optimization</Text>
                </View>
                <Text style={styles.opportunityDescription}>
                  Taco Yaki has highest margin (35.7%) but lowest volume. Marketing push recommended.
                </Text>
                <View style={styles.opportunityImpact}>
                  <Text style={styles.impactLabel}>Potential Impact:</Text>
                  <Text style={styles.impactValue}>+$15,200/month</Text>
                </View>
                <TouchableOpacity style={styles.opportunityButton}>
                  <Text style={styles.opportunityButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepBlack, COLORS.darkCharcoal]}
        style={StyleSheet.absoluteFillObject}
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
            title="Payouts"
            icon={DollarSign}
            isActive={activeTab === 'payouts'}
            onPress={() => setActiveTab('payouts')}
            badge={1}
          />
          <TabButton
            title="Opportunities"
            icon={Target}
            isActive={activeTab === 'opportunities'}
            onPress={() => setActiveTab('opportunities')}
            badge={3}
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
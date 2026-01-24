import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Activity, DollarSign, Users, Clock, TrendingUp, Zap } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/colors';



interface CommandData {
  total_alerts: number;
  critical_alerts: number;
  total_activities: number;
  pending_tasks: number;
  daily_revenue: number;
  weekly_revenue: number;
  active_employees: number;
  avg_shift_hours: number;
}

export default function CommandScreen() {
  const [data, setData] = useState<CommandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All Brands');

  const brands = ['All Brands', 'QDOBA', 'TACO BUENO', 'MOD PIZZA'];

  const fetchData = async () => {
    try {
      const { data: result, error } = await supabase
        .schema('casper_boh')
        .rpc('rpc_command_summary');

      if (error) throw error;
      setData(result);
    } catch (error) {
      console.error('Error fetching command data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={COLORS.moltenGold} />
        <Text style={styles.loadingText}>INITIALIZING COMMAND CENTER...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.electricBlue, COLORS.deepBlue]}
            style={styles.logoContainer}
          >
            <Zap color={COLORS.pureWhite} size={28} />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.title}>COMMAND CENTER</Text>
            <Text style={styles.subtitle}>LIVE OPERATIONS DASHBOARD</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={COLORS.moltenGold}
            />
          }
        >
          <View style={styles.content}>
            {/* Brand Filter */}
            <View style={styles.brandFilter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.brandButton,
                      selectedBrand === brand && styles.brandButtonActive,
                    ]}
                    onPress={() => setSelectedBrand(brand)}
                  >
                    {selectedBrand === brand ? (
                      <LinearGradient
                        colors={[COLORS.moltenGold, COLORS.darkGold]}
                        style={styles.brandButtonGradient}
                      >
                        <Text style={styles.brandButtonTextActive}>{brand}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.brandButtonText}>{brand}</Text>
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
                  <Text style={styles.badgeText}>{data?.critical_alerts || 0}</Text>
                </View>
              </View>
              <View style={styles.alertCard}>
                <View style={styles.alertRow}>
                  <View style={styles.alertDot} />
                  <Text style={styles.alertText}>Equipment temperature deviation detected</Text>
                </View>
                <View style={styles.alertRow}>
                  <View style={[styles.alertDot, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.alertText}>Inventory low on 3 items at Station 5</Text>
                </View>
              </View>
            </View>

            {/* Activity Overview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(0, 191, 255, 0.2)' }]}>
                  <Activity color={COLORS.electricBlue} size={20} />
                </View>
                <Text style={styles.sectionTitle}>ACTIVITY OVERVIEW</Text>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(0, 191, 255, 0.15)', 'rgba(0, 63, 127, 0.1)']}
                    style={styles.metricGradient}
                  >
                    <TrendingUp color={COLORS.electricBlue} size={24} />
                    <Text style={styles.metricValue}>{data?.total_activities || 0}</Text>
                    <Text style={styles.metricLabel}>Total Activities</Text>
                  </LinearGradient>
                </View>
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                    style={styles.metricGradient}
                  >
                    <Clock color={COLORS.warning} size={24} />
                    <Text style={styles.metricValue}>{data?.pending_tasks || 0}</Text>
                    <Text style={styles.metricLabel}>Pending Tasks</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Revenue */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(80, 200, 120, 0.2)' }]}>
                  <DollarSign color={COLORS.emeraldGreen} size={20} />
                </View>
                <Text style={styles.sectionTitle}>REVENUE</Text>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(80, 200, 120, 0.15)', 'rgba(0, 107, 60, 0.1)']}
                    style={styles.metricGradient}
                  >
                    <Text style={styles.metricValueLarge}>
                      ${((data?.daily_revenue || 0) / 1000).toFixed(1)}k
                    </Text>
                    <Text style={styles.metricLabel}>Daily Revenue</Text>
                  </LinearGradient>
                </View>
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(255, 215, 0, 0.15)', 'rgba(184, 134, 11, 0.1)']}
                    style={styles.metricGradient}
                  >
                    <Text style={styles.metricValueLarge}>
                      ${((data?.weekly_revenue || 0) / 1000).toFixed(1)}k
                    </Text>
                    <Text style={styles.metricLabel}>Weekly Revenue</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Employees */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                  <Users color={COLORS.moltenGold} size={20} />
                </View>
                <Text style={styles.sectionTitle}>EMPLOYEES</Text>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(255, 215, 0, 0.15)', 'rgba(184, 134, 11, 0.1)']}
                    style={styles.metricGradient}
                  >
                    <Users color={COLORS.moltenGold} size={24} />
                    <Text style={styles.metricValue}>{data?.active_employees || 0}</Text>
                    <Text style={styles.metricLabel}>Active Now</Text>
                  </LinearGradient>
                </View>
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(229, 228, 226, 0.15)', 'rgba(229, 228, 226, 0.05)']}
                    style={styles.metricGradient}
                  >
                    <Clock color={COLORS.platinum} size={24} />
                    <Text style={styles.metricValue}>
                      {data?.avg_shift_hours?.toFixed(1) || '0.0'}
                    </Text>
                    <Text style={styles.metricLabel}>Avg Shift Hours</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Live Status Footer */}
            <View style={styles.statusFooter}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>LIVE • Last updated just now</Text>
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.deepBlack,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.platinum,
    letterSpacing: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.pureWhite,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.platinum,
    letterSpacing: 2,
    marginTop: 4,
  },
  content: {
    paddingBottom: 40,
  },
  brandFilter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  brandButton: {
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  brandButtonActive: {
    borderRadius: 20,
  },
  brandButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  brandButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 20,
    overflow: 'hidden',
  },
  brandButtonTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepBlack,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.platinum,
    letterSpacing: 2,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.alertRed,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.pureWhite,
    fontSize: 12,
    fontWeight: '800',
  },
  alertCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.alertRed,
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.lightGray,
    lineHeight: 18,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.pureWhite,
    marginTop: 12,
  },
  metricValueLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.pureWhite,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.lightGray,
    marginTop: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emeraldGreen,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.lightGray,
    letterSpacing: 1,
  },
});

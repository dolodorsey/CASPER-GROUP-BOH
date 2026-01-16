import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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
              <Text
                style={[
                  styles.brandButtonText,
                  selectedBrand === brand && styles.brandButtonTextActive,
                ]}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Critical Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={24} color="#FF3B30" />
          <Text style={styles.sectionTitle}>Critical Alerts</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data?.critical_alerts || 0}</Text>
          </View>
        </View>
      </View>

      {/* Activity Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pulse" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Activity Overview</Text>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data?.total_activities || 0}</Text>
            <Text style={styles.metricLabel}>Total Activities</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data?.pending_tasks || 0}</Text>
            <Text style={styles.metricLabel}>Pending Tasks</Text>
          </View>
        </View>
      </View>

      {/* Revenue */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash" size={24} color="#34C759" />
          <Text style={styles.sectionTitle}>Revenue</Text>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>${((data?.daily_revenue || 0) / 1000).toFixed(1)}k</Text>
            <Text style={styles.metricLabel}>Daily</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>${((data?.weekly_revenue || 0) / 1000).toFixed(1)}k</Text>
            <Text style={styles.metricLabel}>Weekly</Text>
          </View>
        </View>
      </View>

      {/* Employees */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={24} color="#AF52DE" />
          <Text style={styles.sectionTitle}>Employees</Text>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data?.active_employees || 0}</Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data?.avg_shift_hours?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.metricLabel}>Avg Hours</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandFilter: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  brandButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  brandButtonActive: {
    backgroundColor: '#007AFF',
  },
  brandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  brandButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
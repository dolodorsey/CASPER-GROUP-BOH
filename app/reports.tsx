import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

export default function ReportsScreen() {
  const reports = [
    {
      icon: 'stats-chart',
      title: 'Occupancy Report',
      description: 'Monthly occupancy trends',
      period: 'Last 30 days',
      color: COLORS.primary,
    },
    {
      icon: 'cash',
      title: 'Revenue Report',
      description: 'Financial performance',
      period: 'Last 90 days',
      color: COLORS.success,
    },
    {
      icon: 'construct',
      title: 'Maintenance Report',
      description: 'Service requests & repairs',
      period: 'Last 30 days',
      color: COLORS.warning,
    },
    {
      icon: 'people',
      title: 'Tenant Report',
      description: 'Tenant activity & satisfaction',
      period: 'Last 60 days',
      color: COLORS.info,
    },
  ];

  const metrics = [
    { label: 'Total Properties', value: '5', change: '+2', positive: true },
    { label: 'Occupied Units', value: '142', change: '+8', positive: true },
    { label: 'Monthly Revenue', value: '$485K', change: '+12%', positive: true },
    { label: 'Maintenance Requests', value: '23', change: '-5', positive: true },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <Text style={styles.headerSubtitle}>Performance insights</Text>
      </View>

      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricChange}>
                <Ionicons 
                  name={metric.positive ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={metric.positive ? COLORS.success : COLORS.error} 
                />
                <Text style={[
                  styles.changeText, 
                  { color: metric.positive ? COLORS.success : COLORS.error }
                ]}>
                  {metric.change}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Reports</Text>
        {reports.map((report, index) => (
          <TouchableOpacity key={index} style={styles.reportItem}>
            <View style={[styles.reportIconContainer, { backgroundColor: report.color + '20' }]}>
              <Ionicons name={report.icon as any} size={28} color={report.color} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
              <Text style={styles.reportPeriod}>{report.period}</Text>
            </View>
            <Ionicons name="download-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Options</Text>
        
        <TouchableOpacity style={styles.exportItem}>
          <View style={styles.exportLeft}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
            <Text style={styles.exportLabel}>Export to PDF</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportItem}>
          <View style={styles.exportLeft}>
            <Ionicons name="document-outline" size={24} color={COLORS.success} />
            <Text style={styles.exportLabel}>Export to Excel</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportItem}>
          <View style={styles.exportLeft}>
            <Ionicons name="mail-outline" size={24} color={COLORS.info} />
            <Text style={styles.exportLabel}>Email Report</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 5,
  },
  metricsSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 20,
    paddingVertical: 10,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  reportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  reportDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  reportPeriod: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  exportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  exportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 15,
  },
});

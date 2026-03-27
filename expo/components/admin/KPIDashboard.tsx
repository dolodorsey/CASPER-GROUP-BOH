import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { KPIMetric } from '@/types/admin';

interface KPICardProps {
  metric: KPIMetric;
  onPress?: () => void;
}

export function KPICard({ metric, onPress }: KPICardProps) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp color={COLORS.emeraldGreen} size={16} />;
      case 'down':
        return <TrendingDown color={COLORS.alertRed} size={16} />;
      default:
        return <Minus color={COLORS.lightGray} size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (metric.status) {
      case 'good':
        return COLORS.emeraldGreen;
      case 'warning':
        return COLORS.moltenGold;
      case 'critical':
        return COLORS.alertRed;
      default:
        return COLORS.lightGray;
    }
  };

  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      if (metric.unit === '$') {
        return `$${value.toLocaleString()}`;
      }
      if (metric.unit === '%') {
        return `${value}%`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[COLORS.darkCharcoal, COLORS.deepBlack]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.name}>{metric.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{formatValue(metric.value)}</Text>
          {metric.unit && !['$', '%'].includes(metric.unit) && (
            <Text style={styles.unit}>{metric.unit}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[
              styles.trendText,
              { color: metric.trend === 'up' ? COLORS.emeraldGreen : 
                       metric.trend === 'down' ? COLORS.alertRed : COLORS.lightGray }
            ]}>
              {Math.abs(metric.trendValue)}%
            </Text>
          </View>
          
          {metric.target && (
            <Text style={styles.target}>
              Target: {formatValue(metric.target)}
            </Text>
          )}
        </View>

        <Text style={styles.lastUpdated}>
          Updated {new Date(metric.lastUpdated).toLocaleTimeString()}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface KPIDashboardProps {
  metrics: KPIMetric[];
  isLoading?: boolean;
}

export function KPIDashboard({ metrics, isLoading }: KPIDashboardProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading KPIs...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {metrics.map((metric) => (
        <KPICard key={metric.id} metric={metric} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    marginRight: 16,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    minHeight: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.platinum,
    letterSpacing: 0.5,
    flex: 1,
    lineHeight: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.pureWhite,
  },
  unit: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  target: {
    fontSize: 10,
    color: COLORS.lightGray,
  },
  lastUpdated: {
    fontSize: 9,
    color: COLORS.lightGray,
    opacity: 0.7,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: 14,
  },
});
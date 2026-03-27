import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Play,
  Eye
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { Alert } from '@/types/admin';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  onApplyPlaybook?: (alertId: string) => void;
  onView?: (alertId: string) => void;
  isApplying?: boolean;
}

export function AlertCard({ 
  alert, 
  onAcknowledge, 
  onApplyPlaybook, 
  onView,
  isApplying 
}: AlertCardProps) {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return COLORS.alertRed;
      case 'error':
        return '#FF6B35';
      case 'warning':
        return COLORS.moltenGold;
      case 'info':
        return COLORS.electricBlue;
      default:
        return COLORS.lightGray;
    }
  };

  const getSeverityIcon = () => {
    const color = getSeverityColor();
    const size = 20;
    
    switch (alert.severity) {
      case 'critical':
      case 'error':
        return <AlertTriangle color={color} size={size} />;
      case 'warning':
        return <AlertTriangle color={color} size={size} />;
      case 'info':
        return <CheckCircle color={color} size={size} />;
      default:
        return <Clock color={color} size={size} />;
    }
  };

  const getStatusText = () => {
    switch (alert.status) {
      case 'active':
        return 'Active';
      case 'acknowledged':
        return 'Acknowledged';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getSeverityColor() }]}>
      <LinearGradient
        colors={[COLORS.darkCharcoal, COLORS.deepBlack]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {getSeverityIcon()}
            <View style={styles.headerText}>
              <Text style={styles.title}>{alert.title}</Text>
              <Text style={styles.type}>{alert.type.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getSeverityColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <Text style={styles.message}>{alert.message}</Text>

        <View style={styles.meta}>
          <Text style={styles.timestamp}>
            {new Date(alert.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.target}>
            {alert.targetType}: {alert.targetId}
          </Text>
        </View>

        {alert.actionable && alert.playbook && alert.status === 'active' && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onView?.(alert.id)}
            >
              <Eye color={COLORS.platinum} size={16} />
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onAcknowledge?.(alert.id)}
            >
              <CheckCircle color={COLORS.electricBlue} size={16} />
              <Text style={styles.actionText}>Acknowledge</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryButton, isApplying && styles.disabledButton]}
              onPress={() => onApplyPlaybook?.(alert.id)}
              disabled={isApplying}
            >
              <Play color={COLORS.pureWhite} size={16} />
              <Text style={styles.primaryButtonText}>
                {isApplying ? 'Applying...' : 'Apply Playbook'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {alert.playbook && (
          <View style={styles.playbook}>
            <Text style={styles.playbookTitle}>{alert.playbook.name}</Text>
            <Text style={styles.playbookDescription}>{alert.playbook.description}</Text>
            <Text style={styles.playbookImpact}>
              Impact: {alert.playbook.estimatedImpact}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

interface AlertCenterProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onApplyPlaybook?: (alertId: string) => void;
  onView?: (alertId: string) => void;
  isApplying?: boolean;
  isLoading?: boolean;
}

export function AlertCenter({ 
  alerts, 
  onAcknowledge, 
  onApplyPlaybook, 
  onView,
  isApplying,
  isLoading 
}: AlertCenterProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CheckCircle color={COLORS.emeraldGreen} size={48} />
        <Text style={styles.emptyTitle}>All Clear</Text>
        <Text style={styles.emptyMessage}>No active alerts at this time</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={onAcknowledge}
          onApplyPlaybook={onApplyPlaybook}
          onView={onView}
          isApplying={isApplying}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    borderLeftWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginBottom: 4,
  },
  type: {
    fontSize: 11,
    color: COLORS.platinum,
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.pureWhite,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.lightGray,
    opacity: 0.7,
  },
  target: {
    fontSize: 11,
    color: COLORS.platinum,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.darkCharcoal,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.platinum,
    marginLeft: 6,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.moltenGold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 12,
    color: COLORS.deepBlack,
    marginLeft: 6,
    fontWeight: '700',
  },
  playbook: {
    backgroundColor: COLORS.deepBlack,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  playbookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.moltenGold,
    marginBottom: 4,
  },
  playbookDescription: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginBottom: 6,
    lineHeight: 16,
  },
  playbookImpact: {
    fontSize: 11,
    color: COLORS.emeraldGreen,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
});
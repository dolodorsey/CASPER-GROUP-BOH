import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  X, 
  Shield, 
  BarChart3, 
  Users, 
  MapPin,
  Package,
  MessageSquare,
  RefreshCw,
  Activity
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { KPIDashboard } from '@/components/admin/KPIDashboard';
import { AlertCenter } from '@/components/admin/AlertCenter';
import { useAdmin } from '@/providers/AdminProvider';



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
          color={isActive ? COLORS.moltenGold : COLORS.lightGray} 
          size={20} 
        />
        <Text style={[
          styles.tabText,
          { color: isActive ? COLORS.moltenGold : COLORS.lightGray }
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

export default function AdminPortal() {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    alerts,
    kpis,
    acknowledgeAlert,
    applyPlaybook,
    refreshData,
    isLoadingAlerts,
    isLoadingKPIs,
    isApplyingPlaybook,
  } = useAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshData();
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
                tintColor={COLORS.moltenGold}
              />
            }
          >
            {/* Live KPIs */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>LIVE NETWORK STATUS</Text>
                <TouchableOpacity onPress={handleRefresh}>
                  <RefreshCw color={COLORS.platinum} size={16} />
                </TouchableOpacity>
              </View>
              <KPIDashboard metrics={kpis} isLoading={isLoadingKPIs} />
            </View>

            {/* Active Alerts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE ALERTS</Text>
              <AlertCenter
                alerts={alerts}
                onAcknowledge={acknowledgeAlert}
                onApplyPlaybook={applyPlaybook}
                isApplying={isApplyingPlaybook}
                isLoading={isLoadingAlerts}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <Activity color={COLORS.electricBlue} size={24} />
                  <Text style={styles.quickActionText}>View Live Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Users color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.quickActionText}>Manage Staff</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Package color={COLORS.moltenGold} size={24} />
                  <Text style={styles.quickActionText}>Check Inventory</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'brands':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.comingSoonText}>Brand Performance Center</Text>
            <Text style={styles.comingSoonSubtext}>
              Comprehensive brand management and analytics coming soon
            </Text>
          </View>
        );

      case 'locations':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.comingSoonText}>Location Control Hub</Text>
            <Text style={styles.comingSoonSubtext}>
              Real-time location monitoring and control coming soon
            </Text>
          </View>
        );

      case 'orders':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.comingSoonText}>Orders & Ticket Flow</Text>
            <Text style={styles.comingSoonSubtext}>
              Live order management and SLA monitoring coming soon
            </Text>
          </View>
        );

      case 'inventory':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.comingSoonText}>Inventory & Supply Chain</Text>
            <Text style={styles.comingSoonSubtext}>
              Smart inventory management and auto-reordering coming soon
            </Text>
          </View>
        );

      case 'messages':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.comingSoonText}>Messaging & War Room</Text>
            <Text style={styles.comingSoonSubtext}>
              Enterprise communication hub coming soon
            </Text>
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
            <Shield color={COLORS.moltenGold} size={28} />
            <View>
              <Text style={styles.title}>ADMIN COMMAND</Text>
              <Text style={styles.subtitle}>Mission Control</Text>
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
            icon={BarChart3}
            isActive={activeTab === 'dashboard'}
            onPress={() => setActiveTab('dashboard')}
            badge={alerts.filter(a => a.status === 'active').length}
          />
          <TabButton
            title="Brands"
            icon={Shield}
            isActive={activeTab === 'brands'}
            onPress={() => setActiveTab('brands')}
          />
          <TabButton
            title="Locations"
            icon={MapPin}
            isActive={activeTab === 'locations'}
            onPress={() => setActiveTab('locations')}
          />
          <TabButton
            title="Orders"
            icon={Activity}
            isActive={activeTab === 'orders'}
            onPress={() => setActiveTab('orders')}
          />
          <TabButton
            title="Inventory"
            icon={Package}
            isActive={activeTab === 'inventory'}
            onPress={() => setActiveTab('inventory')}
          />
          <TabButton
            title="Messages"
            icon={MessageSquare}
            isActive={activeTab === 'messages'}
            onPress={() => setActiveTab('messages')}
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
    borderBottomColor: COLORS.moltenGold,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.platinum,
    letterSpacing: 2,
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
  comingSoonText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.pureWhite,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 16,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: COLORS.lightGray,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});
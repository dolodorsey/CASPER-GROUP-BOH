import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { 
  X, 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Activity

  , ClipboardList
  , GraduationCap
  , UserPlus} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import NeedsTab from "@/components/ops/NeedsTab";
import SOPTab from "@/components/ops/SOPTab";
import ScheduleTab from "@/components/ops/ScheduleTab";
import ChatTab from "@/components/ops/ChatTab";
import TrainingTab from "@/components/ops/TrainingTab";
import OnboardingTab from "@/components/ops/OnboardingTab";

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
          color={isActive ? COLORS.electricBlue : COLORS.lightGray} 
          size={20} 
        />
        <Text style={[
          styles.tabText,
          { color: isActive ? COLORS.electricBlue : COLORS.lightGray }
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

export default function EmployeePortal() {
  const { isBooting, userId, profile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isBooting) return null;
  if (!userId) return <Redirect href="/login" />;
  if (!profile) return <Redirect href="/login" />;
  if (profile.role === "admin") return <Redirect href="/admin" />;
  if (profile.role === "partner") return <Redirect href="/partner" />;
  if (profile.role !== "employee") return <Redirect href="/login" />;
  
  const employeeLocationId = profile.location_id ?? null;

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
                tintColor={COLORS.electricBlue}
              />
            }
          >
            {/* Today's Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TODAY&apos;S OVERVIEW</Text>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <Clock color={COLORS.electricBlue} size={24} />
                  <Text style={styles.overviewValue}>6h 30m</Text>
                  <Text style={styles.overviewLabel}>Shift Duration</Text>
                </View>
                <View style={styles.overviewCard}>
                  <CheckCircle color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.overviewValue}>47</Text>
                  <Text style={styles.overviewLabel}>Orders Completed</Text>
                </View>
                <View style={styles.overviewCard}>
                  <TrendingUp color={COLORS.moltenGold} size={24} />
                  <Text style={styles.overviewValue}>98%</Text>
                  <Text style={styles.overviewLabel}>Performance</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Award color={COLORS.electricBlue} size={24} />
                  <Text style={styles.overviewValue}>2</Text>
                  <Text style={styles.overviewLabel}>Achievements</Text>
                </View>
              </View>
            </View>

            {/* Active Tasks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE TASKS</Text>
              <View style={styles.taskList}>
                <View style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.taskPriority, { backgroundColor: COLORS.alertRed }]} />
                    <Text style={styles.taskTitle}>Fryer Temperature Check</Text>
                    <Text style={styles.taskTime}>Due: 3:30 PM</Text>
                  </View>
                  <Text style={styles.taskDescription}>
                    Check and log fryer temperature for Patty Daddy station
                  </Text>
                  <TouchableOpacity style={styles.taskButton}>
                    <Text style={styles.taskButtonText}>Complete Task</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.taskPriority, { backgroundColor: COLORS.moltenGold }]} />
                    <Text style={styles.taskTitle}>Inventory Count - Avocados</Text>
                    <Text style={styles.taskTime}>Due: 4:00 PM</Text>
                  </View>
                  <Text style={styles.taskDescription}>
                    Count remaining avocados for Taco Yaki prep
                  </Text>
                  <TouchableOpacity style={styles.taskButton}>
                    <Text style={styles.taskButtonText}>Complete Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <Clock color={COLORS.electricBlue} size={24} />
                  <Text style={styles.quickActionText}>Clock In/Out</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <AlertCircle color={COLORS.alertRed} size={24} />
                  <Text style={styles.quickActionText}>Report Issue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <MessageSquare color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.quickActionText}>Team Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );

      case 'schedule':
      return <ScheduleTab mode="employee" activeLocationId={employeeLocationId} />;

    case 'needs':
      return <NeedsTab mode="employee" activeLocationId={employeeLocationId} />;

    case 'sops':
      return <SOPTab mode="employee" />;

    case 'training':
      return <TrainingTab mode="employee" />;

    case 'onboarding':
      return <OnboardingTab mode="employee" activeLocationId={employeeLocationId} />;

    case 'messages':
      return <ChatTab activeLocationId={employeeLocationId} />;

    case 'performance':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>TRAINING MODULES</Text>
            
            <View style={styles.trainingProgress}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '87%' }]} />
              </View>
              <Text style={styles.progressText}>87% Complete</Text>
            </View>

            <View style={styles.trainingList}>
              <View style={styles.trainingCard}>
                <View style={styles.trainingHeader}>
                  <CheckCircle color={COLORS.emeraldGreen} size={20} />
                  <Text style={styles.trainingTitle}>Food Safety Basics</Text>
                  <Text style={styles.trainingStatus}>Complete</Text>
                </View>
                <Text style={styles.trainingDescription}>
                  Essential food safety protocols and procedures
                </Text>
              </View>

              <View style={styles.trainingCard}>
                <View style={styles.trainingHeader}>
                  <Activity color={COLORS.electricBlue} size={20} />
                  <Text style={styles.trainingTitle}>Espresso Standards</Text>
                  <Text style={styles.trainingStatus}>In Progress</Text>
                </View>
                <Text style={styles.trainingDescription}>
                  Beanzo&apos;s Speed Brew Challenge - 7/8 modules complete
                </Text>
                <TouchableOpacity style={styles.continueButton}>
                  <Text style={styles.continueButtonText}>Continue Training</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.trainingCard}>
                <View style={styles.trainingHeader}>
                  <Clock color={COLORS.lightGray} size={20} />
                  <Text style={styles.trainingTitle}>Patty Daddy Sauce Sealing</Text>
                  <Text style={styles.trainingStatus}>Not Started</Text>
                </View>
                <Text style={styles.trainingDescription}>
                  Advanced sauce sealing techniques and quality control
                </Text>
              </View>
            </View>
          </View>
        );

      case 'communication':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionTitle}>TEAM MESSAGES</Text>
            
            <View style={styles.messagesList}>
              <View style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>Mike Chen (Manager)</Text>
                  <Text style={styles.messageTime}>2:30 PM</Text>
                </View>
                <Text style={styles.messageText}>
                  Great job on the lunch rush today team! We hit 98% on-time delivery.
                </Text>
              </View>

              <View style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>Sarah Johnson</Text>
                  <Text style={styles.messageTime}>1:45 PM</Text>
                </View>
                <Text style={styles.messageText}>
                  Reminder: Fryer maintenance scheduled for 4 PM. Please complete all orders by 3:45.
                </Text>
              </View>

              <View style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>System Alert</Text>
                  <Text style={styles.messageTime}>12:15 PM</Text>
                </View>
                <Text style={styles.messageText}>
                  Mojo Juice surge prediction +14% for weekend. Extra prep scheduled.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.composeButton}>
              <MessageSquare color={COLORS.pureWhite} size={20} />
              <Text style={styles.composeButtonText}>Send Message</Text>
            </TouchableOpacity>
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
            <Users color={COLORS.electricBlue} size={28} />
            <View>
              <Text style={styles.title}>EMPLOYEE HUB</Text>
              <Text style={styles.subtitle}>The Nerve System</Text>
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
            badge={2}
          />
          <TabButton
            title="Schedule"
            icon={Calendar}
            isActive={activeTab === 'schedule'}
            onPress={() => setActiveTab('schedule')}
          />
          <TabButton
            title="Needs"
            icon={ClipboardList}
            isActive={activeTab === 'needs'}
            onPress={() => setActiveTab('needs')}
          />
          <TabButton
            title="SOPs"
            icon={BookOpen}
            isActive={activeTab === 'sops'}
            onPress={() => setActiveTab('sops')}
          />
          <TabButton
            title="Training"
            icon={GraduationCap}
            isActive={activeTab === 'training'}
            onPress={() => setActiveTab('training')}
            badge={1}
          />
          <TabButton
            title="Onboarding"
            icon={UserPlus}
            isActive={activeTab === 'onboarding'}
            onPress={() => setActiveTab('onboarding')}
          />
          <TabButton
            title="Chat"
            icon={MessageSquare}
            isActive={activeTab === 'messages'}
            onPress={() => setActiveTab('messages')}
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
    borderBottomColor: COLORS.electricBlue,
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
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.pureWhite,
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 11,
    color: COLORS.lightGray,
    marginTop: 4,
    textAlign: 'center',
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskPriority: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  taskTime: {
    fontSize: 11,
    color: COLORS.lightGray,
  },
  taskDescription: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginBottom: 12,
    lineHeight: 16,
  },
  taskButton: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  taskButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.pureWhite,
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
  scheduleContainer: {
    gap: 16,
    marginBottom: 24,
  },
  scheduleDay: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.electricBlue,
    letterSpacing: 1,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pureWhite,
    marginTop: 4,
    marginBottom: 8,
  },
  shift: {
    backgroundColor: COLORS.deepBlack,
    borderRadius: 8,
    padding: 12,
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  shiftRole: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  dayOff: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontStyle: 'italic',
  },
  requestButton: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
  trainingProgress: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.deepBlack,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.electricBlue,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  trainingList: {
    gap: 16,
  },
  trainingCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trainingTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
    marginLeft: 12,
  },
  trainingStatus: {
    fontSize: 11,
    color: COLORS.lightGray,
  },
  trainingDescription: {
    fontSize: 12,
    color: COLORS.lightGray,
    lineHeight: 16,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  messagesList: {
    gap: 16,
    marginBottom: 24,
  },
  messageCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.electricBlue,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.lightGray,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.pureWhite,
    lineHeight: 18,
  },
  composeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.electricBlue,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  composeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pureWhite,
  },
});
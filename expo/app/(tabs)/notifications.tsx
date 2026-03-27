import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GoldFrame } from '@/components/GoldFrame';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>"I'm just saying you could do better"</Text>

        <GoldFrame>
          <View style={styles.notificationHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.timestamp}>2 minutes ago</Text>
          </View>
          <Text style={styles.notificationTitle}>Operation Completed</Text>
          <Text style={styles.notificationBody}>
            Sole Exchange: Protocol "MIDNIGHT RUN" executed successfully. All metrics nominal.
          </Text>
        </GoldFrame>

        <GoldFrame>
          <View style={styles.notificationHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.moltenGold} />
            <Text style={styles.timestamp}>15 minutes ago</Text>
          </View>
          <Text style={styles.notificationTitle}>System Update</Text>
          <Text style={styles.notificationBody}>
            Pinky Promise: New command protocol available. Review and deploy at your discretion.
          </Text>
        </GoldFrame>

        <GoldFrame>
          <View style={styles.notificationHeader}>
            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
            <Text style={styles.timestamp}>1 hour ago</Text>
          </View>
          <Text style={styles.notificationTitle}>Attention Required</Text>
          <Text style={styles.notificationBody}>
            Umbrella Group: Metrics deviation detected. System auto-corrected. No action required.
          </Text>
        </GoldFrame>

        <GoldFrame>
          <View style={styles.notificationHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.timestamp}>3 hours ago</Text>
          </View>
          <Text style={styles.notificationTitle}>Daily Report</Text>
          <Text style={styles.notificationBody}>
            All systems: 24-hour operational summary generated. 100% uptime achieved across all brands.
          </Text>
        </GoldFrame>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.moltenGold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.moltenGold,
    marginBottom: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
});

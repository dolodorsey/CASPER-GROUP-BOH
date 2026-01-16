import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function AdminDashboard() {
  const router = useRouter();

  const dashboardItems = [
    {
      title: 'Employee Management',
      description: 'View and manage employee accounts',
      route: '/employee',
      icon: '👥',
    },
    {
      title: 'Alerts & Incidents',
      description: 'Monitor and review security alerts',
      route: '/admin/alerts',
      icon: '🚨',
    },
    {
      title: 'Reports',
      description: 'View analytics and reports',
      route: '/admin/reports',
      icon: '📊',
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      route: '/admin/settings',
      icon: '⚙️',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Casper Control Center</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.pureWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  content: {
    flex: 1,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.cardBackground || '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },
});

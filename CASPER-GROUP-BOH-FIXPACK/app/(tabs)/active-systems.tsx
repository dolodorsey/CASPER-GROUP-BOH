import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { GoldFrame } from '@/components/GoldFrame';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveSystemsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Active Systems</Text>
        <Text style={styles.subtitle}>"Know yourself, know your worth"</Text>

        <GoldFrame>
          <View style={styles.systemHeader}>
            <Ionicons name="pulse" size={24} color={COLORS.moltenGold} />
            <Text style={styles.systemTitle}>Pinky Promise</Text>
          </View>
          <Text style={styles.status}>🟢 Status: Active</Text>
          <Text style={styles.metric}>Operations Running: 5</Text>
          <Text style={styles.metric}>Uptime: 99.9%</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.buttonText}>View Protocols →</Text>
          </TouchableOpacity>
        </GoldFrame>

        <GoldFrame>
          <View style={styles.systemHeader}>
            <Ionicons name="pulse" size={24} color={COLORS.moltenGold} />
            <Text style={styles.systemTitle}>Umbrella Group</Text>
          </View>
          <Text style={styles.status}>🟢 Status: Active</Text>
          <Text style={styles.metric}>Operations Running: 3</Text>
          <Text style={styles.metric}>Uptime: 98.7%</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.buttonText}>View Protocols →</Text>
          </TouchableOpacity>
        </GoldFrame>

        <GoldFrame>
          <View style={styles.systemHeader}>
            <Ionicons name="pulse" size={24} color={COLORS.moltenGold} />
            <Text style={styles.systemTitle}>Sole Exchange</Text>
          </View>
          <Text style={styles.status}>🟢 Status: Active</Text>
          <Text style={styles.metric}>Operations Running: 7</Text>
          <Text style={styles.metric}>Uptime: 100%</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.buttonText}>View Protocols →</Text>
          </TouchableOpacity>
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
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  systemTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.moltenGold,
    marginLeft: 12,
  },
  status: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  metric: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  detailsButton: {
    marginTop: 12,
    padding: 8,
  },
  buttonText: {
    fontSize: 14,
    color: COLORS.moltenGold,
    fontWeight: '600',
  },
});

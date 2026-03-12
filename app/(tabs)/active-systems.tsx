import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const SYSTEMS = [
  { name: 'Pinky Promise', status: 'active', ops: 5, uptime: 99.9, icon: 'shield-checkmark', revenue: '$12.4K' },
  { name: 'Umbrella Group', status: 'active', ops: 3, uptime: 98.7, icon: 'umbrella', revenue: '$8.2K' },
  { name: 'Sole Exchange', status: 'active', ops: 7, uptime: 100, icon: 'swap-horizontal', revenue: '$15.1K' },
  { name: 'Bodegea', status: 'active', ops: 4, uptime: 97.5, icon: 'storefront', revenue: '$6.8K' },
];

const ALERTS = [
  { text: 'Inventory restock needed — kitchen supplies', level: 'warning', time: '12m ago' },
  { text: 'New reservation block opened for Saturday', level: 'info', time: '1h ago' },
  { text: 'Staff schedule conflict detected', level: 'error', time: '2h ago' },
];

export default function ActiveSystemsScreen() {
  const totalOps = SYSTEMS.reduce((a, s) => a + s.ops, 0);
  const avgUptime = (SYSTEMS.reduce((a, s) => a + s.uptime, 0) / SYSTEMS.length).toFixed(1);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {/* Header */}
        <Text style={s.greeting}>Command Center</Text>
        <Text style={s.subtitle}>All systems operational</Text>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{SYSTEMS.length}</Text>
            <Text style={s.statLabel}>SYSTEMS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNumber}>{totalOps}</Text>
            <Text style={s.statLabel}>ACTIVE OPS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNumber, { color: '#10B981' }]}>{avgUptime}%</Text>
            <Text style={s.statLabel}>UPTIME</Text>
          </View>
        </View>

        {/* Alerts */}
        <Text style={s.sectionTitle}>Alerts</Text>
        {ALERTS.map((alert, i) => (
          <View key={i} style={s.alertRow}>
            <View style={[s.alertDot, {
              backgroundColor: alert.level === 'error' ? '#EF4444' : alert.level === 'warning' ? '#F59E0B' : '#3B82F6'
            }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertText}>{alert.text}</Text>
              <Text style={s.alertTime}>{alert.time}</Text>
            </View>
          </View>
        ))}

        {/* Systems */}
        <Text style={[s.sectionTitle, { marginTop: 28 }]}>Active Systems</Text>
        {SYSTEMS.map((sys) => (
          <TouchableOpacity key={sys.name} activeOpacity={0.85} style={s.systemCard}>
            <View style={s.systemTop}>
              <View style={s.systemIconWrap}>
                <Ionicons name={sys.icon as any} size={22} color={COLORS.moltenGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.systemName}>{sys.name}</Text>
                <View style={s.statusRow}>
                  <View style={s.statusDot} />
                  <Text style={s.statusText}>Active</Text>
                </View>
              </View>
              <Text style={s.systemRevenue}>{sys.revenue}</Text>
            </View>
            <View style={s.systemMeta}>
              <View style={s.metaItem}>
                <Text style={s.metaValue}>{sys.ops}</Text>
                <Text style={s.metaLabel}>ops</Text>
              </View>
              <View style={s.metaDivider} />
              <View style={s.metaItem}>
                <Text style={[s.metaValue, { color: sys.uptime >= 99 ? '#10B981' : '#F59E0B' }]}>{sys.uptime}%</Text>
                <Text style={s.metaLabel}>uptime</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={s.viewBtn}>Details →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 32, fontWeight: '800', color: COLORS.moltenGold, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#555', marginTop: 4, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 9, color: '#555', fontWeight: '700', letterSpacing: 1.5, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12, marginTop: 5 },
  alertText: { color: '#ddd', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  alertTime: { color: '#444', fontSize: 11, marginTop: 3 },
  systemCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.08)' },
  systemTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  systemIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,215,0,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  systemName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
  systemRevenue: { color: COLORS.moltenGold, fontSize: 16, fontWeight: '700' },
  systemMeta: { flexDirection: 'row', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' },
  metaItem: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metaValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  metaLabel: { color: '#555', fontSize: 11 },
  metaDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 14 },
  viewBtn: { color: COLORS.moltenGold, fontSize: 13, fontWeight: '600' },
});

import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { GoldFrame } from '@/components/GoldFrame';
import { COLORS } from '@/constants/colors';
import { useAlerts, useTickets, useChannels, useChatMessages } from '@/hooks/useSupabaseData';

type Feed = {
  id: string;
  kind: 'alert' | 'ticket' | 'message';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
  ts: string;
};

const SEV: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  critical: { icon: 'alert-circle', color: '#EF4444' },
  error: { icon: 'alert-circle', color: '#EF4444' },
  warning: { icon: 'warning', color: '#F59E0B' },
  info: { icon: 'information-circle', color: '#3B82F6' },
  low: { icon: 'checkmark-circle', color: '#10B981' },
};

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: alerts = [], isLoading: aLoading, refetch: refetchAlerts } = useAlerts('active');
  const { data: tickets = [], refetch: refetchTickets } = useTickets();
  const { data: channels = [] } = useChannels();

  // Pull messages from #announcements if it exists
  const announcementsChannel = useMemo(
    () => (channels as any[]).find((c) => c.name === '#announcements'),
    [channels],
  );
  const { data: announcements = [], refetch: refetchMessages } = useChatMessages(announcementsChannel?.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAlerts(), refetchTickets(), refetchMessages()]);
    setRefreshing(false);
  };

  const feed: Feed[] = useMemo(() => {
    const items: Feed[] = [];

    // Alerts
    for (const a of alerts as any[]) {
      const s = SEV[a.severity] ?? SEV.info;
      items.push({
        id: `alert:${a.id}`,
        kind: 'alert',
        icon: s.icon,
        color: s.color,
        title: a.title || 'Alert',
        body: a.message || a.description || '—',
        ts: a.created_at,
      });
    }

    // Recent tickets (new + in_progress only, most recent 10)
    const openTickets = (tickets as any[])
      .filter((t) => ['new', 'in_progress'].includes(t.status))
      .slice(0, 10);
    for (const t of openTickets) {
      items.push({
        id: `ticket:${t.id}`,
        kind: 'ticket',
        icon: 'receipt',
        color: COLORS.moltenGold,
        title: `New ${t.provider} order · $${Number(t.total || 0).toFixed(2)}`,
        body: t.status === 'new' ? 'Awaiting fire' : t.status === 'in_progress' ? 'In kitchen' : t.status,
        ts: t.created_at,
      });
    }

    // Announcements (last 5)
    const recentMsgs = (announcements as any[]).slice(-5).reverse();
    for (const m of recentMsgs) {
      items.push({
        id: `msg:${m.id}`,
        kind: 'message',
        icon: 'megaphone',
        color: COLORS.electricBlue,
        title: 'Announcement',
        body: m.body,
        ts: m.created_at,
      });
    }

    // Newest first
    items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    return items;
  }, [alerts, tickets, announcements]);

  if (aLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.moltenGold} />
        <Text style={styles.loadingText}>LOADING FEED...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.moltenGold} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          {feed.length === 0 ? 'All quiet.' : `${feed.length} recent event${feed.length === 1 ? '' : 's'}`}
        </Text>

        {feed.length === 0 ? (
          <GoldFrame>
            <View style={styles.notificationHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.timestamp}>now</Text>
            </View>
            <Text style={styles.notificationTitle}>All Systems Nominal</Text>
            <Text style={styles.notificationBody}>
              No active alerts. No live tickets. No pending announcements. Pull down to refresh.
            </Text>
          </GoldFrame>
        ) : (
          feed.map((item) => (
            <GoldFrame key={item.id}>
              <View style={styles.notificationHeader}>
                <Ionicons name={item.icon} size={20} color={item.color} />
                <Text style={styles.timestamp}>{relativeTime(item.ts)}</Text>
              </View>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
            </GoldFrame>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  loadingContainer: { flex: 1, backgroundColor: COLORS.deepBlack, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.moltenGold, marginTop: 12, letterSpacing: 2, fontSize: 12 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { color: COLORS.pureWhite, fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: COLORS.lightGray, fontSize: 14, marginBottom: 24 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  timestamp: { color: COLORS.lightGray, fontSize: 11, letterSpacing: 1 },
  notificationTitle: { color: COLORS.pureWhite, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  notificationBody: { color: COLORS.lightGray, fontSize: 13, lineHeight: 19 },
});

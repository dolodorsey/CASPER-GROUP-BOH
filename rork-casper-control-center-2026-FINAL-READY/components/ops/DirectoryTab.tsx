import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { SectionTitle } from './ui';

type DirectoryRow = {
  user_id: string;
  role: string;
  full_name: string | null;
  email: string | null;
  title: string | null;
  location_id: string;
  location_name: string;
};

export default function DirectoryTab({
  activeLocationId,
}: {
  activeLocationId: string | null;
}) {
  const { allowedLocations } = useAuth();

  const locationIds = useMemo(() => {
    return (allowedLocations ?? []).map((l: any) => l.id);
  }, [allowedLocations]);

  const q = useQuery({
    queryKey: ['ops', 'directory', activeLocationId, locationIds],
    queryFn: async () => {
      // Directory is driven by user_location_access + profiles + locations.
      // Admins will see everything; non-admins see only their allowed locations via RLS.
      let query = supabase
        .from('v_directory')
        .select('*')
        .order('location_name', { ascending: true })
        .order('full_name', { ascending: true })
        .limit(1000);

      if (activeLocationId) query = query.eq('location_id', activeLocationId);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DirectoryRow[];
    },
  });

  const rows = q.data ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.section}>
        <SectionTitle title="Directory" subtitle="Roster by location access. (Admin sees all; others see their allowed locations.)" />
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No directory entries yet.</Text>
          <Text style={styles.muted}>Once users exist in Supabase Auth + profiles and have location access, they’ll appear here.</Text>
        </View>
      ) : (
        rows.map((r) => (
          <View key={`${r.location_id}-${r.user_id}`} style={styles.card}>
            <Text style={styles.name}>{r.full_name ?? r.email ?? r.user_id}</Text>
            <Text style={styles.meta}>{r.title ?? r.role}</Text>
            <Text style={styles.sub}>{r.location_name}</Text>
            <Text style={styles.small}>user_id: {r.user_id}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14 },
  muted: { color: COLORS.silver, fontSize: 12, marginTop: 6 },
  emptyCard: { margin: 16, padding: 18, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  emptyTitle: { color: COLORS.pureWhite, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  card: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  name: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '900' },
  meta: { color: COLORS.moltenGold, fontSize: 12, marginTop: 4, fontWeight: '800' },
  sub: { color: COLORS.platinum, fontSize: 12, marginTop: 6 },
  small: { color: COLORS.silver, fontSize: 11, marginTop: 6 },
});

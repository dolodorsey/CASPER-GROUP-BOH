import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { Field, PillButton, SectionTitle } from './ui';

type Shift = {
  id: string;
  location_id: string;
  brand_id: string | null;
  user_id: string;
  role: string | null;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
};

export default function ScheduleTab({
  mode,
  activeLocationId,
}: {
  mode: 'admin' | 'employee' | 'partner';
  activeLocationId: string | null;
}) {
  const { userId, allowedLocations } = useAuth();
  const qc = useQueryClient();

  const canAdmin = mode === 'admin';
  const [assignUserId, setAssignUserId] = useState('');
  const [role, setRole] = useState('Shift');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [notes, setNotes] = useState('');

  const locationFilterIds = useMemo(() => {
    if (mode === 'admin') return null;
    return allowedLocations?.map((l: any) => l.id) ?? [];
  }, [mode, allowedLocations]);

  const shiftsQuery = useQuery({
    queryKey: ['ops', 'shifts', mode, activeLocationId, locationFilterIds, userId],
    queryFn: async () => {
      let q = supabase.from('shifts').select('*').order('start_at', { ascending: true }).limit(500);
      if (activeLocationId) q = q.eq('location_id', activeLocationId);
      if (locationFilterIds && locationFilterIds.length > 0) q = q.in('location_id', locationFilterIds);
      if (mode === 'employee' && userId) q = q.eq('user_id', userId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Shift[];
    },
  });

  const createShift = useMutation({
    mutationFn: async () => {
      if (!canAdmin) throw new Error('Not allowed');
      const location_id =
        activeLocationId ?? (allowedLocations && allowedLocations.length ? allowedLocations[0].id : null);
      if (!location_id) throw new Error('Select a location');
      const payload = {
        location_id,
        user_id: assignUserId.trim(),
        role: role.trim() || null,
        start_at: startAt.trim(),
        end_at: endAt.trim(),
        status: 'scheduled',
        notes: notes.trim() || null,
      };
      const { error } = await supabase.from('shifts').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setAssignUserId('');
      setRole('Shift');
      setStartAt('');
      setEndAt('');
      setNotes('');
      await qc.invalidateQueries({ queryKey: ['ops', 'shifts'] });
    },
  });

  const shifts = shiftsQuery.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.section}>
        <SectionTitle
          title="Scheduling"
          subtitle={mode === 'admin' ? 'Create shifts per location. (Employee assignment uses user_id UUID for now.)' : 'Your upcoming shifts.'}
        />
      </View>

      {canAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Shift</Text>
          <Field label="Assign user_id (UUID)" value={assignUserId} onChangeText={setAssignUserId} placeholder="Paste the user UUID from Supabase Auth" />
          <Field label="Role" value={role} onChangeText={setRole} placeholder="Example: Cashier / Line Cook" />
          <Field label="Start (ISO)" value={startAt} onChangeText={setStartAt} placeholder="2026-01-03T18:00:00Z" />
          <Field label="End (ISO)" value={endAt} onChangeText={setEndAt} placeholder="2026-01-03T23:00:00Z" />
          <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
          <PillButton
            label={createShift.isPending ? 'Saving...' : 'Create Shift'}
            kind="success"
            onPress={() => createShift.mutate()}
            disabled={createShift.isPending || !assignUserId.trim() || !startAt.trim() || !endAt.trim()}
          />
          <Text style={styles.mutedSmall}>Next UI upgrade: choose employee from a directory dropdown (no UUID copy/paste).</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Shifts</Text>
      </View>

      {shifts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No shifts scheduled.</Text>
          <Text style={styles.muted}>Once shifts are created, they'll appear here by your role and location access.</Text>
        </View>
      ) : (
        shifts.map((s) => (
          <View key={s.id} style={styles.shiftCard}>
            <Text style={styles.shiftTitle}>{s.role ?? 'Shift'}</Text>
            <Text style={styles.shiftMeta}>
              {new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}
            </Text>
            <Text style={styles.mutedSmall}>Status: {s.status}</Text>
            {mode === 'admin' ? <Text style={styles.mutedSmall}>user_id: {s.user_id}</Text> : null}
            {s.notes ? <Text style={styles.shiftNotes}>{s.notes}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 14 },
  sectionLabel: { color: COLORS.platinum, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  muted: { color: COLORS.silver, fontSize: 12, marginTop: 6 },
  mutedSmall: { color: COLORS.silver, fontSize: 11, marginTop: 6 },
  card: { margin: 16, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  cardTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  emptyCard: { margin: 16, padding: 18, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  emptyTitle: { color: COLORS.pureWhite, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  shiftCard: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  shiftTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '900' },
  shiftMeta: { color: COLORS.moltenGold, fontSize: 12, marginTop: 4, fontWeight: '800' },
  shiftNotes: { color: COLORS.platinum, fontSize: 12, marginTop: 8, lineHeight: 18 },
});

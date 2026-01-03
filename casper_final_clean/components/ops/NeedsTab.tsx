import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { Field, PillButton, SectionTitle } from './ui';

type NeedStatus = 'pending' | 'approved' | 'ordered' | 'fulfilled';
type NeedUrgency = 'low' | 'normal' | 'high';

type SupplyNeed = {
  id: string;
  created_at: string;
  created_by: string;
  location_id: string;
  brand_id: string | null;
  item_name: string;
  quantity: string | null;
  urgency: NeedUrgency;
  status: NeedStatus;
  notes: string | null;
};

export default function NeedsTab({
  mode,
  activeLocationId,
}: {
  mode: 'admin' | 'employee' | 'partner';
  activeLocationId: string | null;
}) {
  const { userId, profile, allowedLocations, allowedBrands } = useAuth();
  const qc = useQueryClient();

  const canWrite = mode === 'admin' || mode === 'employee';

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState<NeedUrgency>('normal');
  const [notes, setNotes] = useState('');

  const locationFilterIds = useMemo(() => {
    if (mode === 'admin') return null;
    return allowedLocations?.map((l: any) => l.id) ?? [];
  }, [mode, allowedLocations]);

  const needsQuery = useQuery({
    queryKey: ['ops', 'needs', mode, activeLocationId, locationFilterIds],
    queryFn: async () => {
      let q = supabase.from('supply_needs').select('*').order('created_at', { ascending: false }).limit(200);
      if (activeLocationId) q = q.eq('location_id', activeLocationId);
      if (locationFilterIds && locationFilterIds.length > 0) q = q.in('location_id', locationFilterIds);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as SupplyNeed[];
    },
  });

  const createNeed = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in');
      const location_id =
        activeLocationId ??
        (allowedLocations && allowedLocations.length ? allowedLocations[0].id : profile?.location_id) ??
        null;

      if (!location_id) throw new Error('Select a location first');

      const brand_id =
        profile?.brand_id ??
        (allowedBrands && allowedBrands.length ? allowedBrands[0].id : null) ??
        null;

      const payload = {
        created_by: userId,
        location_id,
        brand_id,
        item_name: itemName.trim(),
        quantity: quantity.trim() || null,
        urgency,
        status: 'pending' as NeedStatus,
        notes: notes.trim() || null,
      };

      const { error } = await supabase.from('supply_needs').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setItemName('');
      setQuantity('');
      setUrgency('normal');
      setNotes('');
      await qc.invalidateQueries({ queryKey: ['ops', 'needs'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: NeedStatus }) => {
      const { error } = await supabase.from('supply_needs').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['ops', 'needs'] });
    },
  });

  const needs = needsQuery.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.section}>
        <SectionTitle title="Needs & Requests" subtitle="Team can report low inventory, missing supplies, or operational requests." />
        {!activeLocationId ? (
          <Text style={styles.muted}>Tip: pick an Active Location (top) to keep this list focused.</Text>
        ) : null}
      </View>

      {canWrite ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create a Request</Text>
          <Field label="Item" value={itemName} onChangeText={setItemName} placeholder="Example: gloves, paper towels, fryer oil..." />
          <Field label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="Example: 2 cases / 12 lbs / 1 box" />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <PillButton label="Urgency: Low" kind={urgency === 'low' ? 'primary' : 'default'} onPress={() => setUrgency('low')} />
            <PillButton label="Urgency: Normal" kind={urgency === 'normal' ? 'primary' : 'default'} onPress={() => setUrgency('normal')} />
            <PillButton label="Urgency: High" kind={urgency === 'high' ? 'primary' : 'default'} onPress={() => setUrgency('high')} />
          </View>
          <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional context (what happened, by when, etc.)" multiline />
          <PillButton
            label={createNeed.isPending ? 'Submitting...' : 'Submit Request'}
            kind="success"
            onPress={() => createNeed.mutate()}
            disabled={createNeed.isPending || !itemName.trim()}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Recent Requests</Text>
      </View>

      {needs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No requests yet.</Text>
          <Text style={styles.muted}>Once your team submits requests, they'll appear here in real time.</Text>
        </View>
      ) : (
        needs.map((n) => (
          <View key={n.id} style={styles.needCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.needTitle}>{n.item_name}</Text>
                <Text style={styles.needMeta}>
                  {n.quantity ? `${n.quantity} • ` : ''}
                  {n.urgency.toUpperCase()} • {n.status.toUpperCase()}
                </Text>
                <Text style={styles.needMetaSmall}>{new Date(n.created_at).toLocaleString()}</Text>
                {n.notes ? <Text style={styles.needNotes}>{n.notes}</Text> : null}
              </View>
              {mode === 'admin' ? (
                <View style={{ gap: 8 }}>
                  <PillButton label="Approve" onPress={() => updateStatus.mutate({ id: n.id, status: 'approved' })} />
                  <PillButton label="Ordered" onPress={() => updateStatus.mutate({ id: n.id, status: 'ordered' })} />
                  <PillButton label="Fulfill" kind="primary" onPress={() => updateStatus.mutate({ id: n.id, status: 'fulfilled' })} />
                </View>
              ) : null}
            </View>
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
  card: { margin: 16, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  cardTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  emptyCard: { margin: 16, padding: 18, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  emptyTitle: { color: COLORS.pureWhite, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  needCard: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  needTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '900' },
  needMeta: { color: COLORS.moltenGold, fontSize: 12, marginTop: 4, fontWeight: '800' },
  needMetaSmall: { color: COLORS.silver, fontSize: 11, marginTop: 4 },
  needNotes: { color: COLORS.platinum, fontSize: 12, marginTop: 8, lineHeight: 18 },
});

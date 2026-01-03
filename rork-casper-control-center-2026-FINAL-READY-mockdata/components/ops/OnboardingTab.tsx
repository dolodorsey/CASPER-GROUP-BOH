import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { Field, PillButton, SectionTitle } from './ui';

export default function OnboardingTab({ mode, activeLocationId }: { mode: 'admin' | 'employee' | 'partner'; activeLocationId: string | null }) {
  const { userId } = useAuth();
  const qc = useQueryClient();

  const canAdmin = mode === 'admin';

  const [targetUserId, setTargetUserId] = useState('');
  const [templateName, setTemplateName] = useState('Employee Onboarding');

  const templatesQ = useQuery({
    queryKey: ['ops', 'onboarding_templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('onboarding_templates').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const runsQ = useQuery({
    queryKey: ['ops', 'onboarding_runs', mode, userId, activeLocationId],
    queryFn: async () => {
      let q = supabase.from('onboarding_runs').select('*').order('started_at', { ascending: false }).limit(200);
      if (mode !== 'admin' && userId) q = q.eq('user_id', userId);
      if (activeLocationId) q = q.eq('location_id', activeLocationId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async () => {
      if (!canAdmin) throw new Error('Not allowed');
      const payload = { name: templateName.trim(), created_by: userId };
      const { error } = await supabase.from('onboarding_templates').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['ops', 'onboarding_templates'] });
    },
  });

  const startRun = useMutation({
    mutationFn: async () => {
      if (!canAdmin) throw new Error('Not allowed');
      const templates = templatesQ.data ?? [];
      const tpl = templates[0];
      if (!tpl) throw new Error('Create a template first');
      if (!activeLocationId) throw new Error('Select a location');
      const payload = { template_id: tpl.id, user_id: targetUserId.trim(), location_id: activeLocationId, status: 'active' };
      const { error } = await supabase.from('onboarding_runs').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setTargetUserId('');
      await qc.invalidateQueries({ queryKey: ['ops', 'onboarding_runs'] });
    },
  });

  const runs = runsQ.data ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.section}>
        <SectionTitle title="Onboarding" subtitle="Templates → Tasks → Runs. This is the MVP scaffold; next step is task checklists per role." />
      </View>

      {canAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Controls</Text>
          <Field label="Template name" value={templateName} onChangeText={setTemplateName} placeholder="Employee Onboarding" />
          <PillButton label="Create Template" kind="success" onPress={() => createTemplate.mutate()} disabled={createTemplate.isPending || !templateName.trim()} />
          <View style={{ height: 12 }} />
          <Field label="Start onboarding for user_id (UUID)" value={targetUserId} onChangeText={setTargetUserId} placeholder="Paste user UUID" />
          <PillButton label="Start Onboarding Run" kind="primary" onPress={() => startRun.mutate()} disabled={startRun.isPending || !targetUserId.trim() || !activeLocationId} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Onboarding Runs</Text>
      </View>

      {runs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No onboarding runs.</Text>
          <Text style={styles.muted}>Admins can start onboarding runs for new staff per location.</Text>
        </View>
      ) : (
        runs.map((r: any) => (
          <View key={r.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>Run • {r.status}</Text>
            <Text style={styles.itemMeta}>user_id: {r.user_id}</Text>
            <Text style={styles.itemMeta}>location_id: {r.location_id}</Text>
            <Text style={styles.small}>{new Date(r.started_at).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14 },
  sectionLabel: { color: COLORS.platinum, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  muted: { color: COLORS.silver, fontSize: 12, marginTop: 6 },
  small: { color: COLORS.silver, fontSize: 11, marginTop: 6 },
  card: { margin: 16, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  cardTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  emptyCard: { margin: 16, padding: 18, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  emptyTitle: { color: COLORS.pureWhite, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  itemCard: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  itemTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '900' },
  itemMeta: { color: COLORS.platinum, fontSize: 12, marginTop: 6 },
});

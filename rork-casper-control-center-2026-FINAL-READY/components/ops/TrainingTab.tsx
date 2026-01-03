import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { Field, PillButton, SectionTitle } from './ui';

export default function TrainingTab({ mode }: { mode: 'admin' | 'employee' | 'partner' }) {
  const { userId, allowedBrands } = useAuth();
  const qc = useQueryClient();

  const canAdmin = mode === 'admin';
  const [brandId, setBrandId] = useState('');
  const [title, setTitle] = useState('New Training Module');
  const [description, setDescription] = useState('');

  const modulesQ = useQuery({
    queryKey: ['ops', 'training_modules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('training_modules').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const createModule = useMutation({
    mutationFn: async () => {
      if (!canAdmin) throw new Error('Not allowed');
      const finalBrand = brandId || (allowedBrands && allowedBrands.length ? allowedBrands[0].id : '');
      if (!finalBrand) throw new Error('brand_id required');
      const payload = { brand_id: finalBrand, title: title.trim(), description: description.trim() || null, is_active: true, created_by: userId };
      const { error } = await supabase.from('training_modules').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setTitle('New Training Module');
      setDescription('');
      setBrandId('');
      await qc.invalidateQueries({ queryKey: ['ops', 'training_modules'] });
    },
  });

  const modules = modulesQ.data ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.section}>
        <SectionTitle title="Training" subtitle="Modules → Lessons → Questions → Attempts. MVP scaffold; next step is full quiz + scoring UI." />
      </View>

      {canAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Training Module</Text>
          <Field label="brand_id" value={brandId} onChangeText={setBrandId} placeholder="Example: taco-yaki" />
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Example: Food Safety 101" />
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="Optional" multiline />
          <PillButton label={createModule.isPending ? 'Saving...' : 'Create Module'} kind="success" onPress={() => createModule.mutate()} disabled={createModule.isPending || !title.trim()} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Active Modules</Text>
      </View>

      {modules.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No training modules yet.</Text>
          <Text style={styles.muted}>Admins can create modules per brand. Lessons and quizzes can be added next.</Text>
        </View>
      ) : (
        modules.map((m: any) => (
          <View key={m.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{m.title}</Text>
            <Text style={styles.itemMeta}>{m.brand_id}</Text>
            {m.description ? <Text style={styles.desc}>{m.description}</Text> : null}
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
  desc: { color: COLORS.platinum, fontSize: 12, marginTop: 8, lineHeight: 18 },
  card: { margin: 16, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  cardTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  emptyCard: { margin: 16, padding: 18, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  emptyTitle: { color: COLORS.pureWhite, fontWeight: '800', fontSize: 14, marginBottom: 6 },
  itemCard: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  itemTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '900' },
  itemMeta: { color: COLORS.moltenGold, fontSize: 12, marginTop: 4, fontWeight: '800' },
});

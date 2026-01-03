import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { Field, PillButton, SectionTitle } from './ui';

type SOPDoc = {
  id: string;
  brand_id: string;
  title: string;
  version: string | null;
  file_url: string | null;
  is_active: boolean;
  published_at: string;
};

export default function SOPTab({
  mode,
}: {
  mode: 'admin' | 'employee' | 'partner';
}) {
  const { userId, allowedBrands } = useAuth();
  const qc = useQueryClient();

  const canAdmin = mode === 'admin';
  const [brandId, setBrandId] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [fileUrl, setFileUrl] = useState('');

  const docsQuery = useQuery({
    queryKey: ['ops', 'sops', mode],
    queryFn: async () => {
      // RLS controls which docs each role can see.
      const { data, error } = await supabase
        .from('sop_documents')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as SOPDoc[];
    },
  });

  const createDoc = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in');
      const finalBrand = brandId || (allowedBrands && allowedBrands.length ? allowedBrands[0].id : '');
      if (!finalBrand) throw new Error('Select a brand_id');
      const payload = {
        brand_id: finalBrand,
        title: title.trim(),
        version: version.trim() || null,
        file_url: fileUrl.trim() || null,
        is_active: true,
      };
      const { error } = await supabase.from('sop_documents').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setTitle('');
      setBrandId('');
      setVersion('v1.0');
      setFileUrl('');
      await qc.invalidateQueries({ queryKey: ['ops', 'sops'] });
    },
  });

  const acknowledge = useMutation({
    mutationFn: async (sopId: string) => {
      if (!userId) throw new Error('Not signed in');
      const payload = { sop_id: sopId, user_id: userId };
      const { error } = await supabase.from('sop_acknowledgements').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['ops', 'sops'] });
      await qc.invalidateQueries({ queryKey: ['ops', 'sop_acks'] });
    },
  });

  const ackQuery = useQuery({
    queryKey: ['ops', 'sop_acks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sop_acknowledgements').select('*').limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const ackSet = useMemo(() => new Set((ackQuery.data ?? []).map((a: any) => a.sop_id)), [ackQuery.data]);

  const docs = docsQuery.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.section}>
        <SectionTitle title="SOP Library" subtitle="Upload SOPs later; for now, you can create records and track staff acknowledgements." />
      </View>

      {canAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add SOP Record</Text>
          <Field label="brand_id" value={brandId} onChangeText={setBrandId} placeholder="Example: angel-wings" />
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Example: Angel Wings Kitchen SOP" />
          <Field label="Version" value={version} onChangeText={setVersion} placeholder="v1.0" />
          <Field label="File URL (optional)" value={fileUrl} onChangeText={setFileUrl} placeholder="Add later when SOP PDFs are uploaded" />
          <PillButton
            label={createDoc.isPending ? 'Saving...' : 'Create SOP'}
            kind="success"
            onPress={() => createDoc.mutate()}
            disabled={createDoc.isPending || !title.trim()}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Active SOPs</Text>
      </View>

      {docs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No SOPs yet.</Text>
          <Text style={styles.muted}>Once you upload SOPs, they will show here by brand access.</Text>
        </View>
      ) : (
        docs.map((d) => {
          const acknowledged = ackSet.has(d.id);
          return (
            <View key={d.id} style={styles.docCard}>
              <Text style={styles.docTitle}>{d.title}</Text>
              <Text style={styles.docMeta}>
                {d.brand_id} {d.version ? `• ${d.version}` : ''}
              </Text>
              <Text style={styles.mutedSmall}>Published: {new Date(d.published_at).toLocaleDateString()}</Text>
              {d.file_url ? <Text style={styles.link}>Link: {d.file_url}</Text> : null}

              {mode !== 'admin' ? (
                <View style={{ marginTop: 10 }}>
                  <PillButton
                    label={acknowledged ? 'Acknowledged' : acknowledge.isPending ? 'Signing...' : 'Sign / Acknowledge'}
                    kind={acknowledged ? 'primary' : 'success'}
                    onPress={() => acknowledge.mutate(d.id)}
                    disabled={acknowledged || acknowledge.isPending}
                  />
                </View>
              ) : null}
            </View>
          );
        })
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
  docCard: { marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16 },
  docTitle: { color: COLORS.pureWhite, fontSize: 14, fontWeight: '900' },
  docMeta: { color: COLORS.moltenGold, fontSize: 12, marginTop: 4, fontWeight: '800' },
  link: { color: COLORS.electricBlue, fontSize: 12, marginTop: 8 },
});

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { useBrands, useSopCountsByBrand } from '@/hooks/useSupabaseData';

export default function SopsIndexScreen() {
  const router = useRouter();
  const { data: brands = [], isLoading } = useBrands();
  const { data: counts = [] } = useSopCountsByBrand();

  const totalForBrand = (brandId: string) => counts.filter(c => c.brand_id === brandId).reduce((s, c) => s + Number(c.sop_count || 0), 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft color={COLORS.pureWhite} size={22} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>SOPs</Text>
            <Text style={styles.subtitle}>SELECT AN ENTITY</Text>
          </View>
          <View style={styles.iconBtn}>
            <BookOpen color={COLORS.moltenGold} size={20} />
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.introTitle}>Standard Operating Procedures</Text>
          <Text style={styles.introBody}>Tap a brand to view its SOPs organized by lifecycle: Open · Recipes · Service · Close · Compliance · Brand Voice.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.moltenGold} style={{ marginVertical: 60 }} />
          ) : (
            <View style={styles.grid}>
              {brands.map(b => {
                const total = totalForBrand(b.id);
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.tile}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/sops/${b.slug}` as any)}
                  >
                    <LinearGradient
                      colors={[b.color_primary || COLORS.moltenGold, b.color_secondary || COLORS.darkGold]}
                      style={styles.tileAccent}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.tileContent}>
                      <Text style={styles.tileIcon}>{b.icon || '🍽️'}</Text>
                      <Text style={styles.tileName} numberOfLines={2}>{b.name}</Text>
                      <Text style={styles.tileTagline} numberOfLines={1}>{b.tagline || ''}</Text>
                      <View style={styles.tileFooter}>
                        <Text style={styles.tileCount}>{total} SOP{total !== 1 ? 's' : ''}</Text>
                        <ChevronRight color={COLORS.lightGray} size={14} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  iconBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderWidth: 1, borderColor: COLORS.borderGray },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 3 },
  subtitle: { fontSize: 10, color: COLORS.platinum, letterSpacing: 2, marginTop: 3 },

  intro: { paddingHorizontal: 16, paddingVertical: 20 },
  introTitle: { fontSize: 22, fontWeight: '800', color: COLORS.pureWhite, marginBottom: 6 },
  introBody: { fontSize: 13, color: COLORS.lightGray, lineHeight: 19 },

  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '48%', backgroundColor: COLORS.darkCharcoal, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderGray },
  tileAccent: { height: 6 },
  tileContent: { padding: 14 },
  tileIcon: { fontSize: 28, marginBottom: 8 },
  tileName: { fontSize: 15, fontWeight: '800', color: COLORS.pureWhite, marginBottom: 4, letterSpacing: 0.3 },
  tileTagline: { fontSize: 10, color: COLORS.lightGray, marginBottom: 12, fontStyle: 'italic' },
  tileFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.borderGray, paddingTop: 8 },
  tileCount: { fontSize: 10, color: COLORS.moltenGold, fontWeight: '700', letterSpacing: 1 },
});

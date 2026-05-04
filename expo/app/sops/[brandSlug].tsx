import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Search, ChevronDown, ChevronRight, FileText, CheckCircle2,
  Sunrise, ChefHat, Bell, Moon, ShieldCheck, Megaphone,
} from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { useBrands, useSopsByBrand, type CgSop } from '@/hooks/useSupabaseData';

type SectionKey = 'open' | 'recipes' | 'service' | 'close' | 'compliance' | 'brand_voice';

const SECTIONS: { key: SectionKey; label: string; icon: any; color: string; description: string }[] = [
  { key: 'open',         label: 'Open',           icon: Sunrise,     color: '#F59E0B', description: 'Pre-shift checklists, station setup, line check' },
  { key: 'recipes',      label: 'Recipes & Build',icon: ChefHat,     color: COLORS.moltenGold, description: 'Menu items, ingredients, plating, allergens' },
  { key: 'service',      label: 'Service',        icon: Bell,        color: COLORS.electricBlue, description: 'POS workflow, ticket times, expo, delivery handoff' },
  { key: 'close',        label: 'Close',          icon: Moon,        color: '#7C3AED', description: 'Breakdown, deep clean, waste log, lockup' },
  { key: 'compliance',   label: 'Compliance',     icon: ShieldCheck, color: COLORS.alertRed, description: 'Health code, allergens, ServSafe, fire/safety' },
  { key: 'brand_voice',  label: 'Brand Voice',    icon: Megaphone,   color: COLORS.emeraldGreen, description: 'Tone, packaging, social, photo style, no-go phrases' },
];

export default function EntitySopsScreen() {
  const router = useRouter();
  const { brandSlug } = useLocalSearchParams<{ brandSlug: string }>();
  const { data: brands = [] } = useBrands();
  const brand = brands.find(b => b.slug === brandSlug);
  const { data: sops = [], isLoading } = useSopsByBrand(brand?.id);

  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState<SectionKey | null>('recipes');

  const sopsBySection: Record<SectionKey, CgSop[]> = useMemo(() => {
    const groups: Record<SectionKey, CgSop[]> = { open: [], recipes: [], service: [], close: [], compliance: [], brand_voice: [] };
    const filter = search.toLowerCase().trim();
    sops.forEach(s => {
      const sec = (s.section as SectionKey) || 'recipes';
      if (!groups[sec]) groups[sec] = [];
      if (filter && !s.title.toLowerCase().includes(filter) && !(s.content || '').toLowerCase().includes(filter)) return;
      groups[sec].push(s);
    });
    return groups;
  }, [sops, search]);

  const totalSops = sops.length;
  const totalFiltered = Object.values(sopsBySection).reduce((s, arr) => s + arr.length, 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft color={COLORS.pureWhite} size={22} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1}>{brand?.name || 'SOPs'}</Text>
            <Text style={styles.subtitle}>{totalSops} SOPs · 6 sections</Text>
          </View>
          <View style={[styles.iconBtn, { backgroundColor: brand?.color_primary || COLORS.darkCharcoal }]}>
            <Text style={{ fontSize: 18 }}>{brand?.icon || '📋'}</Text>
          </View>
        </View>

        {brand?.tagline && (
          <View style={styles.taglineBar}>
            <Text style={styles.tagline} numberOfLines={1}>{brand.tagline}</Text>
            {brand.mascot && <Text style={styles.mascot}>· {brand.mascot}</Text>}
          </View>
        )}

        <View style={styles.searchBar}>
          <Search color={COLORS.lightGray} size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search SOPs..."
            placeholderTextColor={COLORS.mutedGray}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Text style={styles.searchCount}>{totalFiltered} match{totalFiltered !== 1 ? 'es' : ''}</Text>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.moltenGold} style={{ marginVertical: 60 }} />
          ) : (
            SECTIONS.map(section => {
              const items = sopsBySection[section.key] || [];
              const open = openSection === section.key;
              const Icon = section.icon;
              return (
                <View key={section.key} style={styles.sectionCard}>
                  <TouchableOpacity
                    onPress={() => setOpenSection(open ? null : section.key)}
                    style={styles.sectionHeader}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.sectionIcon, { backgroundColor: `${section.color}22` }]}>
                      <Icon color={section.color} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <Text style={styles.sectionDesc} numberOfLines={1}>{section.description}</Text>
                    </View>
                    <View style={styles.sectionRight}>
                      <Text style={styles.sectionCount}>{items.length}</Text>
                      {open ? <ChevronDown color={COLORS.lightGray} size={18} /> : <ChevronRight color={COLORS.lightGray} size={18} />}
                    </View>
                  </TouchableOpacity>

                  {open && (
                    <View style={styles.sectionBody}>
                      {items.length === 0 ? (
                        <Text style={styles.emptyText}>No SOPs in this section yet.</Text>
                      ) : (
                        items.map(s => (
                          <View key={s.id} style={styles.sopItem}>
                            <View style={styles.sopItemHead}>
                              <FileText color={section.color} size={14} />
                              <Text style={styles.sopTitle}>{s.title}</Text>
                              {s.requires_ack && (
                                <View style={styles.ackBadge}>
                                  <CheckCircle2 color={COLORS.moltenGold} size={10} />
                                  <Text style={styles.ackText}>ACK</Text>
                                </View>
                              )}
                            </View>
                            {s.content && (
                              <Text style={styles.sopContent}>{s.content}</Text>
                            )}
                            <View style={styles.sopMeta}>
                              <Text style={styles.sopMetaText}>v{s.version}</Text>
                              <Text style={styles.sopMetaText}>·</Text>
                              <Text style={styles.sopMetaText}>{s.status}</Text>
                              {s.effective_date && (<>
                                <Text style={styles.sopMetaText}>·</Text>
                                <Text style={styles.sopMetaText}>eff. {new Date(s.effective_date).toLocaleDateString()}</Text>
                              </>)}
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
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
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  title: { fontSize: 16, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: COLORS.platinum, letterSpacing: 1.5, marginTop: 3 },

  taglineBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  tagline: { fontSize: 12, color: COLORS.platinum, fontStyle: 'italic' },
  mascot: { fontSize: 11, color: COLORS.moltenGold, fontWeight: '700' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginHorizontal: 16, marginTop: 8, marginBottom: 12, height: 42, backgroundColor: COLORS.darkCharcoal, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderGray },
  searchInput: { flex: 1, color: COLORS.pureWhite, fontSize: 13 },
  searchCount: { fontSize: 10, color: COLORS.lightGray, letterSpacing: 1 },

  scroll: { paddingHorizontal: 16 },
  sectionCard: { backgroundColor: COLORS.darkCharcoal, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderGray, marginBottom: 8, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: COLORS.pureWhite, letterSpacing: 0.5 },
  sectionDesc: { fontSize: 11, color: COLORS.lightGray, marginTop: 2 },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionCount: { fontSize: 12, color: COLORS.moltenGold, fontWeight: '800' },

  sectionBody: { padding: 14, paddingTop: 0, gap: 10, borderTopWidth: 1, borderTopColor: COLORS.borderGray },
  sopItem: { padding: 12, backgroundColor: COLORS.midnightBlack, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderGray, marginTop: 10 },
  sopItemHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sopTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.pureWhite },
  ackBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: `${COLORS.moltenGold}22`, borderRadius: 4 },
  ackText: { fontSize: 8, color: COLORS.moltenGold, fontWeight: '800', letterSpacing: 1 },
  sopContent: { fontSize: 12, color: COLORS.lightGray, lineHeight: 18, marginBottom: 8 },
  sopMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  sopMetaText: { fontSize: 10, color: COLORS.mutedGray, letterSpacing: 0.5 },

  emptyText: { color: COLORS.lightGray, fontSize: 12, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
});

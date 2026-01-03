import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FileText, DollarSign, Receipt, HandCoins, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

type TabKey = 'statements' | 'payouts' | 'invoices' | 'agreement';

function money(cents?: number | null) {
  const v = Number(cents ?? 0) / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function TabButton({ title, icon: Icon, isActive, onPress }: { title: string; icon: any; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, isActive && styles.tabBtnActive]}>
      <Icon size={16} color={isActive ? COLORS.text : COLORS.textSecondary} />
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function PartnerPortal() {
  const router = useRouter();
  const { loading, profile, sessionReady, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('statements');
  const [refreshing, setRefreshing] = useState(false);

  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const init = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return;

    const { data: pu } = await supabase.from('partner_users').select('partner_id').eq('user_id', uid).maybeSingle();
    const pid = pu?.partner_id ?? null;
    setPartnerId(pid);

    if (!pid) return;

    const [ag, st, pa, inv] = await Promise.all([
      supabase.from('partner_agreements').select('*').eq('partner_id', pid).order('created_at', { ascending: false }),
      supabase.from('partner_statements').select('*').eq('partner_id', pid).order('period_start', { ascending: false }).limit(25),
      supabase.from('partner_payouts').select('*').eq('partner_id', pid).order('created_at', { ascending: false }).limit(25),
      supabase.from('partner_invoices').select('*').eq('partner_id', pid).order('created_at', { ascending: false }).limit(25),
    ]);

    setAgreements(ag.data ?? []);
    setStatements(st.data ?? []);
    setPayouts(pa.data ?? []);
    setInvoices(inv.data ?? []);
  };

  useEffect(() => {
    if (sessionReady && profile?.role === 'partner') init();
  }, [sessionReady, profile?.role]);

  const onRefresh = async () => {
    setRefreshing(true);
    await init();
    setRefreshing(false);
  };

  if (!sessionReady || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={styles.center}><ActivityIndicator /></View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    router.replace('/login?portal=partner' as any);
    return null;
  }

  if (profile.role !== 'partner') {
    router.replace(`/login?portal=${profile.role}` as any);
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.background, COLORS.card]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hTitle}>Partner Financials</Text>
            <Text style={styles.hSub}>Statements • Payouts • Invoices</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => signOut().then(() => router.replace('/' as any))} style={styles.iconBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          <TabButton title="Statements" icon={FileText} isActive={activeTab === 'statements'} onPress={() => setActiveTab('statements')} />
          <TabButton title="Payouts" icon={HandCoins} isActive={activeTab === 'payouts'} onPress={() => setActiveTab('payouts')} />
          <TabButton title="Invoices" icon={Receipt} isActive={activeTab === 'invoices'} onPress={() => setActiveTab('invoices')} />
          <TabButton title="Agreement" icon={DollarSign} isActive={activeTab === 'agreement'} onPress={() => setActiveTab('agreement')} />
        </ScrollView>

        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {!partnerId ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Access not linked</Text>
              <Text style={styles.cardText}>Your user is not linked to a partner profile. Ask admin to map your account in partner_users.</Text>
            </View>
          ) : null}

          {activeTab === 'statements' ? (
            <>
              <Text style={styles.sectionTitle}>Recent Statements</Text>
              {statements.map((s) => (
                <View key={s.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{s.period_start} → {s.period_end}</Text>
                    <Text style={styles.rowSub}>Status: {s.status}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.money}>{money(s.net_due_partner_cents)}</Text>
                    <Text style={styles.rowSub}>Net due</Text>
                  </View>
                </View>
              ))}
              {statements.length === 0 ? <Text style={styles.empty}>No statements yet.</Text> : null}
            </>
          ) : null}

          {activeTab === 'payouts' ? (
            <>
              <Text style={styles.sectionTitle}>Payouts</Text>
              {payouts.map((p) => (
                <View key={p.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.status.toUpperCase()}</Text>
                    <Text style={styles.rowSub}>{p.method ?? '—'} • {p.paid_at ? new Date(p.paid_at).toLocaleString() : 'Pending'}</Text>
                  </View>
                  <Text style={styles.money}>{money(p.amount_cents)}</Text>
                </View>
              ))}
              {payouts.length === 0 ? <Text style={styles.empty}>No payouts yet.</Text> : null}
            </>
          ) : null}

          {activeTab === 'invoices' ? (
            <>
              <Text style={styles.sectionTitle}>Invoices</Text>
              {invoices.map((i) => (
                <View key={i.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{i.invoice_number ?? 'Invoice'}</Text>
                    <Text style={styles.rowSub}>{i.direction.replaceAll('_', ' ')} • Due {i.due_date ?? '—'} • {i.status}</Text>
                  </View>
                  <Text style={styles.money}>{money(i.total_cents)}</Text>
                </View>
              ))}
              {invoices.length === 0 ? <Text style={styles.empty}>No invoices yet.</Text> : null}
            </>
          ) : null}

          {activeTab === 'agreement' ? (
            <>
              <Text style={styles.sectionTitle}>Agreement</Text>
              {agreements.map((a) => (
                <View key={a.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{a.brand_label ?? 'Brand'} • {a.location_label ?? 'Location'}</Text>
                  <Text style={styles.cardText}>Status: {a.status}</Text>
                  <Text style={styles.cardText}>Frequency: {a.payout_frequency}</Text>
                  <Text style={styles.cardText}>Revenue Share: {(Number(a.revenue_share_bps ?? 0) / 100).toFixed(2)}%</Text>
                  {a.notes ? <Text style={styles.cardText}>Notes: {a.notes}</Text> : null}
                </View>
              ))}
              {agreements.length === 0 ? <Text style={styles.empty}>No agreement records yet.</Text> : null}
            </>
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.footerText}>For questions: contact Accounts Payable.</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  hSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  iconBtn: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 10, borderRadius: 12 },
  tabs: { maxHeight: 54, marginTop: 6 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'transparent' },
  tabBtnActive: { backgroundColor: COLORS.card },
  tabText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 12 },
  tabTextActive: { color: COLORS.text },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 10, marginTop: 6 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontWeight: '800', marginBottom: 6 },
  cardText: { color: COLORS.textSecondary, lineHeight: 18 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  rowTitle: { color: COLORS.text, fontWeight: '800' },
  rowSub: { color: COLORS.textSecondary, marginTop: 4, fontSize: 12 },
  money: { color: COLORS.text, fontWeight: '900' },
  empty: { color: COLORS.textSecondary, marginTop: 10 },
  footer: { marginTop: 18, alignItems: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: 12 },
});

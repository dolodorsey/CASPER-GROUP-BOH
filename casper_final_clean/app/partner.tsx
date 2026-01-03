import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

type Statement = { id: string; period_start: string; period_end: string; status: string; gross_sales_cents: number; net_due_partner_cents: number; created_at: string; };
type Payout = { id: string; amount_cents: number; status: string; paid_at: string | null; created_at: string; };
type Invoice = { id: string; invoice_number: string | null; direction: string; status: string; total_cents: number; due_date: string | null; created_at: string; };

const usd = (cents: number | null | undefined) => (Number(cents ?? 0) / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function PartnerPortal() {
  const { isBooting, userId, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null); setLoading(true);
    try {
      const s1 = await supabase.from("partner_statements").select("id, period_start, period_end, status, gross_sales_cents, net_due_partner_cents, created_at").order("period_start", { ascending: false }).limit(12);
      if (s1.error) throw s1.error;
      const s2 = await supabase.from("partner_payouts").select("id, amount_cents, status, paid_at, created_at").order("created_at", { ascending: false }).limit(20);
      if (s2.error) throw s2.error;
      const s3 = await supabase.from("partner_invoices").select("id, invoice_number, direction, status, total_cents, due_date, created_at").order("created_at", { ascending: false }).limit(20);
      if (s3.error) throw s3.error;
      setStatements((s1.data ?? []) as any);
      setPayouts((s2.data ?? []) as any);
      setInvoices((s3.data ?? []) as any);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load financials.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (userId) load(); }, [userId]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const kpis = useMemo(() => {
    const open = invoices.filter(i => !["paid","void"].includes(i.status));
    const openTotal = open.reduce((a,i)=>a+Number(i.total_cents ?? 0),0);
    const lastPayout = payouts.find(p=>p.status==="paid") ?? payouts[0];
    const lastStmt = statements[0];
    return { lastNet: usd(lastStmt?.net_due_partner_cents), lastPayout: usd(lastPayout?.amount_cents), openInvoices: usd(openTotal) };
  }, [statements,payouts,invoices]);

  if (isBooting) return null;
  if (!userId) return <Redirect href="/login" />;
  if (!profile || profile.role !== "partner") return <Redirect href="/" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#0A0F1C", "#151B2C"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}>
          <Text style={styles.title}>Partner Financials</Text>
          <Text style={styles.subtitle}>Statements • Payouts • Invoices</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Last Statement Net</Text><Text style={styles.kpiValue}>{kpis.lastNet}</Text></View>
            <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Last Payout</Text><Text style={styles.kpiValue}>{kpis.lastPayout}</Text></View>
            <View style={styles.kpiCard}><Text style={styles.kpiLabel}>Open Invoices</Text><Text style={styles.kpiValue}>{kpis.openInvoices}</Text></View>
          </View>

          <Section title="Statements" loading={loading}>
            {statements.map(s => <Row key={s.id} primary={`${s.period_start} → ${s.period_end}`} secondary={`Gross: ${usd(s.gross_sales_cents)} • Net: ${usd(s.net_due_partner_cents)} • ${s.status}`} />)}
            {!loading && statements.length===0 ? <Empty text="No statements yet." /> : null}
          </Section>

          <Section title="Payouts" loading={loading}>
            {payouts.map(p => <Row key={p.id} primary={`${usd(p.amount_cents)} • ${p.status}`} secondary={p.paid_at ? `Paid: ${new Date(p.paid_at).toLocaleString()}` : `Created: ${new Date(p.created_at).toLocaleString()}`} />)}
            {!loading && payouts.length===0 ? <Empty text="No payouts yet." /> : null}
          </Section>

          <Section title="Invoices" loading={loading}>
            {invoices.map(i => <Row key={i.id} primary={`${i.invoice_number ?? "Invoice"} • ${usd(i.total_cents)} • ${i.status}`} secondary={`${i.direction}${i.due_date ? ` • Due: ${i.due_date}` : ""}`} />)}
            {!loading && invoices.length===0 ? <Empty text="No invoices yet." /> : null}
          </Section>

          <Text style={styles.note}>Partners cannot access ops modules.</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function Section({ title, children, loading }: { title: string; children: React.ReactNode; loading: boolean }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{loading ? <Text style={styles.sectionMeta}>Loading…</Text> : null}</View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}
function Row({ primary, secondary }: { primary: string; secondary: string }) {
  return <View style={styles.row}><Text style={styles.rowPrimary}>{primary}</Text><Text style={styles.rowSecondary}>{secondary}</Text></View>;
}
function Empty({ text }: { text: string }) { return <Text style={styles.empty}>{text}</Text>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0F1C" },
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6, marginBottom: 14 },
  error: { color: "#ff6b6b", marginBottom: 10 },
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  kpiCard: { padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", minWidth: 160 },
  kpiLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  kpiValue: { fontSize: 18, fontWeight: "800", color: "#fff", marginTop: 6 },
  section: { marginTop: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.04)", overflow: "hidden" },
  sectionHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  sectionMeta: { color: "rgba(255,255,255,0.6)" },
  sectionBody: { padding: 12, gap: 10 },
  row: { padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)" },
  rowPrimary: { color: "#fff", fontWeight: "700" },
  rowSecondary: { color: "rgba(255,255,255,0.7)", marginTop: 4 },
  empty: { color: "rgba(255,255,255,0.7)" },
  note: { marginTop: 18, color: "rgba(255,255,255,0.6)" },
});

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Package, BookOpen, MessageSquare, GraduationCap, X, MapPin, Plus } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";

type TabKey = "schedule" | "needs" | "sops" | "training" | "chat";

function TabButton({ title, icon: Icon, isActive, onPress }: { title: string; icon: any; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, isActive && styles.tabBtnActive]}>
      <Icon size={16} color={isActive ? COLORS.text : COLORS.textSecondary} />
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function EmployeePortal() {
  const router = useRouter();
  const { loading, sessionReady, profile, userId, allowedLocations, allowedBrands, activeLocationId, setActiveLocationId, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("schedule");
  const [refreshing, setRefreshing] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // schedule
  const [shifts, setShifts] = useState<any[]>([]);

  // needs
  const [needs, setNeeds] = useState<any[]>([]);
  const [needItem, setNeedItem] = useState("");
  const [needQty, setNeedQty] = useState("");
  const [needUrgency, setNeedUrgency] = useState<"low"|"normal"|"high">("normal");
  const [needNotes, setNeedNotes] = useState("");
  const [needBrandId, setNeedBrandId] = useState<string | null>(null);

  // sops
  const [sops, setSops] = useState<any[]>([]);
  const [acks, setAcks] = useState<Record<string, boolean>>({});

  // training
  const [trainingModules, setTrainingModules] = useState<any[]>([]);

  // chat
  const [room, setRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatBody, setChatBody] = useState("");

  const [locationModal, setLocationModal] = useState(false);

  const loadCatalog = async () => {
    if (!allowedLocations.length) return;

    const locRes = await supabase.from("cg_locations").select("id,name,city,state,address").in("id", allowedLocations);
    setLocations(locRes.data ?? []);

    const brRes = allowedBrands.length
      ? await supabase.from("cg_brands").select("id,name").in("id", allowedBrands)
      : await supabase.from("cg_brands").select("id,name");
    setBrands(brRes.data ?? []);
  };

  const loadSchedule = async () => {
    if (!activeLocationId || !userId) return;
    const res = await supabase
      .from("shifts")
      .select("*")
      .eq("location_id", activeLocationId)
      .eq("user_id", userId)
      .order("start_at", { ascending: true })
      .limit(50);
    setShifts(res.data ?? []);
  };

  const loadNeeds = async () => {
    if (!activeLocationId) return;
    const res = await supabase
      .from("supply_needs")
      .select("id,item_name,quantity,urgency,status,notes,created_at,brand_id,created_by")
      .eq("location_id", activeLocationId)
      .order("created_at", { ascending: false })
      .limit(100);
    setNeeds(res.data ?? []);
  };

  const loadSops = async () => {
    // SOPs are brand-level; show ones tied to brands the user has access to (or via location-based helper RLS)
    const res = allowedBrands.length
      ? await supabase.from("sop_documents").select("*").in("brand_id", allowedBrands).eq("is_active", true).order("published_at", { ascending: false }).limit(50)
      : await supabase.from("sop_documents").select("*").eq("is_active", true).order("published_at", { ascending: false }).limit(50);

    setSops(res.data ?? []);

    if (userId && (res.data?.length ?? 0) > 0) {
      const sopIds = (res.data ?? []).map((d: any) => d.id);
      const ackRes = await supabase.from("sop_acknowledgements").select("sop_id").eq("user_id", userId).in("sop_id", sopIds);
      const map: Record<string, boolean> = {};
      (ackRes.data ?? []).forEach((r: any) => { map[r.sop_id] = true; });
      setAcks(map);
    }
  };

  const loadTraining = async () => {
    const res = await supabase.from("training_modules").select("*").order("created_at", { ascending: false }).limit(50);
    setTrainingModules(res.data ?? []);
  };

  const loadChat = async () => {
    if (!activeLocationId) return;

    // Ensure a room exists per location (type=location). If not, create it (employees/admin only).
    const existing = await supabase.from("chat_rooms").select("*").eq("location_id", activeLocationId).eq("type", "location").maybeSingle();
    let r = existing.data;
    if (!r) {
      const created = await supabase.from("chat_rooms").insert({ location_id: activeLocationId, name: "Location Chat", type: "location" }).select("*").single();
      r = created.data;
    }
    setRoom(r);

    if (r?.id) {
      const msgRes = await supabase.from("chat_messages").select("*").eq("room_id", r.id).order("created_at", { ascending: true }).limit(200);
      setMessages(msgRes.data ?? []);
    }
  };

  const loadAll = async () => {
    await loadCatalog();
    await Promise.all([loadSchedule(), loadNeeds(), loadSops(), loadTraining(), loadChat()]);
  };

  useEffect(() => {
    if (sessionReady && profile?.role === "employee") loadAll();
  }, [sessionReady, profile?.role, activeLocationId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const createNeed = async () => {
    if (!activeLocationId || !userId) return;
    if (!needItem.trim()) return;

    await supabase.from("supply_needs").insert({
      created_by: userId,
      location_id: activeLocationId,
      brand_id: needBrandId,
      item_name: needItem.trim(),
      quantity: needQty.trim() || null,
      urgency: needUrgency,
      notes: needNotes.trim() || null,
    });

    setNeedItem("");
    setNeedQty("");
    setNeedNotes("");
    setNeedUrgency("normal");
    setNeedBrandId(null);

    await loadNeeds();
  };

  const acknowledgeSop = async (sopId: string) => {
    if (!userId) return;
    await supabase.from("sop_acknowledgements").insert({ sop_id: sopId, user_id: userId });
    setAcks((prev) => ({ ...prev, [sopId]: true }));
  };

  const sendMessage = async () => {
    if (!room?.id || !userId) return;
    const body = chatBody.trim();
    if (!body) return;
    setChatBody("");
    await supabase.from("chat_messages").insert({ room_id: room.id, user_id: userId, body });
    await loadChat();
  };

  const locationLabel = useMemo(() => {
    const loc = locations.find((l) => l.id === activeLocationId);
    if (!loc) return "Select location";
    return loc.name ?? loc.id;
  }, [locations, activeLocationId]);

  if (!sessionReady || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={styles.center}><ActivityIndicator /></View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    router.replace("/login?portal=employee" as any);
    return null;
  }

  if (profile.role !== "employee") {
    router.replace(`/login?portal=${profile.role}` as any);
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.background, COLORS.card]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hTitle}>Employee Portal</Text>
            <TouchableOpacity onPress={() => setLocationModal(true)} style={styles.locationPill}>
              <MapPin size={14} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>{locationLabel}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => signOut().then(() => router.replace("/" as any))} style={styles.iconBtn}>
            <X size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          <TabButton title="Schedule" icon={Calendar} isActive={activeTab === "schedule"} onPress={() => setActiveTab("schedule")} />
          <TabButton title="Needs" icon={Package} isActive={activeTab === "needs"} onPress={() => setActiveTab("needs")} />
          <TabButton title="SOPs" icon={BookOpen} isActive={activeTab === "sops"} onPress={() => setActiveTab("sops")} />
          <TabButton title="Training" icon={GraduationCap} isActive={activeTab === "training"} onPress={() => setActiveTab("training")} />
          <TabButton title="Chat" icon={MessageSquare} isActive={activeTab === "chat"} onPress={() => setActiveTab("chat")} />
        </ScrollView>

        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {!activeLocationId ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No location selected</Text>
              <Text style={styles.cardText}>Pick your location to load schedule, needs, and chat.</Text>
            </View>
          ) : null}

          {activeTab === "schedule" ? (
            <>
              <Text style={styles.sectionTitle}>My Shifts</Text>
              {shifts.map((s) => (
                <View key={s.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{s.role ?? "Shift"}</Text>
                    <Text style={styles.rowSub}>
                      {new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}
                    </Text>
                    <Text style={styles.rowSub}>Status: {s.status}</Text>
                    {s.notes ? <Text style={styles.rowSub}>Notes: {s.notes}</Text> : null}
                  </View>
                </View>
              ))}
              {shifts.length === 0 ? <Text style={styles.empty}>No shifts scheduled.</Text> : null}
            </>
          ) : null}

          {activeTab === "needs" ? (
            <>
              <Text style={styles.sectionTitle}>Needs / Requests</Text>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Create a request</Text>

                <Text style={styles.label}>Item</Text>
                <TextInput value={needItem} onChangeText={setNeedItem} placeholder="Gloves, To-Go Bags, Syrup…" placeholderTextColor={COLORS.textSecondary} style={styles.input} />

                <Text style={styles.label}>Quantity (optional)</Text>
                <TextInput value={needQty} onChangeText={setNeedQty} placeholder="e.g. 2 cases" placeholderTextColor={COLORS.textSecondary} style={styles.input} />

                <Text style={styles.label}>Urgency</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {(["low","normal","high"] as const).map((u) => (
                    <TouchableOpacity key={u} onPress={() => setNeedUrgency(u)} style={[styles.pill, needUrgency === u && styles.pillActive]}>
                      <Text style={[styles.pillText, needUrgency === u && styles.pillTextActive]}>{u.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Brand (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
                  <TouchableOpacity onPress={() => setNeedBrandId(null)} style={[styles.pill, !needBrandId && styles.pillActive]}>
                    <Text style={[styles.pillText, !needBrandId && styles.pillTextActive]}>ALL</Text>
                  </TouchableOpacity>
                  {brands.map((b) => (
                    <TouchableOpacity key={b.id} onPress={() => setNeedBrandId(b.id)} style={[styles.pill, needBrandId === b.id && styles.pillActive]}>
                      <Text style={[styles.pillText, needBrandId === b.id && styles.pillTextActive]}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput value={needNotes} onChangeText={setNeedNotes} placeholder="Why needed / vendor / deadline…" placeholderTextColor={COLORS.textSecondary} style={[styles.input, { height: 88 }]} multiline />

                <TouchableOpacity onPress={createNeed} style={styles.primaryBtn}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Submit</Text>
                </TouchableOpacity>
              </View>

              {needs.map((n) => (
                <View key={n.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{n.item_name}</Text>
                    <Text style={styles.rowSub}>
                      {n.quantity ? `Qty: ${n.quantity} • ` : ""}Urgency: {String(n.urgency).toUpperCase()} • Status: {String(n.status).toUpperCase()}
                    </Text>
                    {n.notes ? <Text style={styles.rowSub}>Notes: {n.notes}</Text> : null}
                    <Text style={styles.rowSub}>{new Date(n.created_at).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
              {needs.length === 0 ? <Text style={styles.empty}>No requests yet.</Text> : null}
            </>
          ) : null}

          {activeTab === "sops" ? (
            <>
              <Text style={styles.sectionTitle}>SOP Library</Text>
              {sops.map((d) => {
                const done = !!acks[d.id];
                return (
                  <View key={d.id} style={styles.rowCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{d.title}</Text>
                      <Text style={styles.rowSub}>Brand: {d.brand_id} • Version: {d.version ?? "—"}</Text>
                      <Text style={styles.rowSub}>Published: {new Date(d.published_at).toLocaleString()}</Text>
                      {d.file_url ? <Text style={styles.rowSub}>File: {d.file_url}</Text> : <Text style={styles.rowSub}>File: (upload later)</Text>}
                    </View>
                    <TouchableOpacity disabled={done} onPress={() => acknowledgeSop(d.id)} style={[styles.ackBtn, done && styles.ackBtnDone]}>
                      <Text style={[styles.ackText, done && styles.ackTextDone]}>{done ? "ACKED" : "ACKNOWLEDGE"}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {sops.length === 0 ? <Text style={styles.empty}>No SOPs uploaded yet.</Text> : null}
            </>
          ) : null}

          {activeTab === "training" ? (
            <>
              <Text style={styles.sectionTitle}>Training</Text>
              {trainingModules.map((m) => (
                <View key={m.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{m.title}</Text>
                    <Text style={styles.rowSub}>{m.description ?? "—"}</Text>
                  </View>
                </View>
              ))}
              {trainingModules.length === 0 ? <Text style={styles.empty}>No modules yet. Admin can add modules + questions in Supabase.</Text> : null}
            </>
          ) : null}

          {activeTab === "chat" ? (
            <>
              <Text style={styles.sectionTitle}>Location Chat</Text>
              {!room ? (
                <Text style={styles.empty}>No room yet.</Text>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{room.name}</Text>
                  <View style={{ maxHeight: 380 }}>
                    <ScrollView>
                      {messages.map((m) => (
                        <View key={m.id} style={styles.msgRow}>
                          <Text style={styles.msgMeta}>{new Date(m.created_at).toLocaleString()}</Text>
                          <Text style={styles.msgBody}>{m.body}</Text>
                        </View>
                      ))}
                      {messages.length === 0 ? <Text style={styles.empty}>No messages yet.</Text> : null}
                    </ScrollView>
                  </View>

                  <TextInput value={chatBody} onChangeText={setChatBody} placeholder="Type a message…" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                  <TouchableOpacity onPress={sendMessage} style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : null}
        </ScrollView>

        <Modal visible={locationModal} transparent animationType="fade" onRequestClose={() => setLocationModal(false)}>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {locations.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => { setActiveLocationId(l.id); setLocationModal(false); }}
                    style={[styles.modalRow, l.id === activeLocationId && styles.modalRowActive]}
                  >
                    <Text style={styles.modalRowTitle}>{l.name}</Text>
                    <Text style={styles.modalRowSub}>{[l.address, l.city, l.state].filter(Boolean).join(", ")}</Text>
                  </TouchableOpacity>
                ))}
                {locations.length === 0 ? <Text style={styles.empty}>No locations assigned to your account.</Text> : null}
              </ScrollView>
              <TouchableOpacity onPress={() => setLocationModal(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  locationPill: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  locationText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "700" },
  iconBtn: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 10, borderRadius: 12 },
  tabs: { maxHeight: 54, marginTop: 6 },
  tabBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "transparent" },
  tabBtnActive: { backgroundColor: COLORS.card },
  tabText: { color: COLORS.textSecondary, fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: COLORS.text },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "800", marginBottom: 10, marginTop: 6 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardTitle: { color: COLORS.text, fontWeight: "800", marginBottom: 6 },
  cardText: { color: COLORS.textSecondary, lineHeight: 18 },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  rowTitle: { color: COLORS.text, fontWeight: "800" },
  rowSub: { color: COLORS.textSecondary, marginTop: 4, fontSize: 12 },
  empty: { color: COLORS.textSecondary, marginTop: 10 },
  label: { color: COLORS.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  pill: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: "transparent", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "800" },
  pillTextActive: { color: "#fff" },
  primaryBtn: { marginTop: 12, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
  ackBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  ackBtnDone: { borderColor: COLORS.border, backgroundColor: COLORS.background },
  ackText: { color: COLORS.primary, fontWeight: "900", fontSize: 12 },
  ackTextDone: { color: COLORS.textSecondary },

  msgRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  msgMeta: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  msgBody: { color: COLORS.text, lineHeight: 18 },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  modalTitle: { color: COLORS.text, fontWeight: "900", fontSize: 14, marginBottom: 10 },
  modalRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalRowActive: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 10 },
  modalRowTitle: { color: COLORS.text, fontWeight: "800" },
  modalRowSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  modalClose: { marginTop: 12, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  modalCloseText: { color: COLORS.textSecondary, fontWeight: "800" },
});

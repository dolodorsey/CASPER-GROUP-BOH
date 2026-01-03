import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, Package, BookOpen, MessageSquare, GraduationCap, Users, MapPin, X, Plus } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

type TabKey = "schedule" | "needs" | "sops" | "training" | "chat" | "directory";

function TabButton({ title, icon: Icon, isActive, onPress }: { title: string; icon: any; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, isActive && styles.tabBtnActive]}>
      <Icon size={16} color={isActive ? COLORS.text : COLORS.textSecondary} />
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function AdminPortal() {
  const router = useRouter();
  const { loading, sessionReady, profile, userId, allowedLocations, allowedBrands, activeLocationId, setActiveLocationId, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("schedule");
  const [refreshing, setRefreshing] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [locationModal, setLocationModal] = useState(false);

  // schedule
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftRole, setShiftRole] = useState("");
  const [shiftUserId, setShiftUserId] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");

  // needs
  const [needs, setNeeds] = useState<any[]>([]);

  // sops
  const [sops, setSops] = useState<any[]>([]);
  const [sopTitle, setSopTitle] = useState("");
  const [sopBrandId, setSopBrandId] = useState<string | null>(null);
  const [sopVersion, setSopVersion] = useState("");
  const [sopFileUrl, setSopFileUrl] = useState("");

  // training
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [trainTitle, setTrainTitle] = useState("");
  const [trainDesc, setTrainDesc] = useState("");

  // chat
  const [room, setRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatBody, setChatBody] = useState("");

  const loadCatalog = async () => {
    const locRes = allowedLocations.length
      ? await supabase.from("cg_locations").select("id,name,city,state,address").in("id", allowedLocations)
      : await supabase.from("cg_locations").select("id,name,city,state,address");
    setLocations(locRes.data ?? []);

    const brRes = allowedBrands.length
      ? await supabase.from("cg_brands").select("id,name").in("id", allowedBrands)
      : await supabase.from("cg_brands").select("id,name");
    setBrands(brRes.data ?? []);

    // Employees directory (admins only via RLS)
    const empRes = await supabase.from("profiles").select("id,full_name,email,role").neq("role", "partner").limit(200);
    setEmployees(empRes.data ?? []);
  };

  const loadSchedule = async () => {
    if (!activeLocationId) return;
    const res = await supabase.from("shifts").select("*").eq("location_id", activeLocationId).order("start_at", { ascending: true }).limit(200);
    setShifts(res.data ?? []);
  };

  const loadNeeds = async () => {
    if (!activeLocationId) return;
    const res = await supabase.from("supply_needs").select("*").eq("location_id", activeLocationId).order("created_at", { ascending: false }).limit(200);
    setNeeds(res.data ?? []);
  };

  const loadSops = async () => {
    const res = allowedBrands.length
      ? await supabase.from("sop_documents").select("*").in("brand_id", allowedBrands).order("published_at", { ascending: false }).limit(100)
      : await supabase.from("sop_documents").select("*").order("published_at", { ascending: false }).limit(100);
    setSops(res.data ?? []);
  };

  const loadTraining = async () => {
    const res = await supabase.from("training_modules").select("*").order("created_at", { ascending: false }).limit(100);
    setTrainingModules(res.data ?? []);
  };

  const loadChat = async () => {
    if (!activeLocationId) return;
    const existing = await supabase.from("chat_rooms").select("*").eq("location_id", activeLocationId).eq("type", "location").maybeSingle();
    let r = existing.data;
    if (!r) {
      const created = await supabase.from("chat_rooms").insert({ location_id: activeLocationId, name: "Location Chat", type: "location" }).select("*").single();
      r = created.data;
    }
    setRoom(r);
    if (r?.id) {
      const msgRes = await supabase.from("chat_messages").select("*").eq("room_id", r.id).order("created_at", { ascending: true }).limit(400);
      setMessages(msgRes.data ?? []);
    }
  };

  const loadAll = async () => {
    await loadCatalog();
    await Promise.all([loadSchedule(), loadNeeds(), loadSops(), loadTraining(), loadChat()]);
  };

  useEffect(() => {
    if (sessionReady && profile?.role === "admin") loadAll();
  }, [sessionReady, profile?.role, activeLocationId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const locationLabel = useMemo(() => {
    const loc = locations.find((l) => l.id === activeLocationId);
    if (!loc) return "Select location";
    return loc.name ?? loc.id;
  }, [locations, activeLocationId]);

  const createShift = async () => {
    if (!activeLocationId || !shiftUserId.trim() || !shiftStart.trim() || !shiftEnd.trim()) return;
    await supabase.from("shifts").insert({
      location_id: activeLocationId,
      user_id: shiftUserId.trim(),
      role: shiftRole.trim() || "Shift",
      start_at: new Date(shiftStart).toISOString(),
      end_at: new Date(shiftEnd).toISOString(),
      status: "scheduled",
      notes: shiftNotes.trim() || null,
    });
    setShiftRole(""); setShiftUserId(""); setShiftStart(""); setShiftEnd(""); setShiftNotes("");
    await loadSchedule();
  };

  const updateNeedStatus = async (id: string, status: string) => {
    await supabase.from("supply_needs").update({ status }).eq("id", id);
    await loadNeeds();
  };

  const createSop = async () => {
    if (!sopBrandId || !sopTitle.trim() || !userId) return;
    await supabase.from("sop_documents").insert({
      brand_id: sopBrandId,
      title: sopTitle.trim(),
      version: sopVersion.trim() || null,
      file_url: sopFileUrl.trim() || null,
      created_by: userId,
      is_active: true,
    });
    setSopTitle(""); setSopVersion(""); setSopFileUrl(""); setSopBrandId(null);
    await loadSops();
  };

  const createTrainingModule = async () => {
    if (!trainTitle.trim()) return;
    await supabase.from("training_modules").insert({
      title: trainTitle.trim(),
      description: trainDesc.trim() || null,
      is_active: true,
    });
    setTrainTitle(""); setTrainDesc("");
    await loadTraining();
  };

  const sendMessage = async () => {
    if (!room?.id || !userId) return;
    const body = chatBody.trim();
    if (!body) return;
    setChatBody("");
    await supabase.from("chat_messages").insert({ room_id: room.id, user_id: userId, body });
    await loadChat();
  };

  if (!sessionReady || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={styles.center}><ActivityIndicator /></View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    router.replace("/login?portal=admin" as any);
    return null;
  }

  if (profile.role !== "admin") {
    router.replace(`/login?portal=${profile.role}` as any);
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.background, COLORS.card]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hTitle}>Admin Control</Text>
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
          <TabButton title="Directory" icon={Users} isActive={activeTab === "directory"} onPress={() => setActiveTab("directory")} />
        </ScrollView>

        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {!activeLocationId ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>No location selected</Text>
              <Text style={styles.cardText}>Pick a location to manage shifts, needs, and location chat.</Text>
            </View>
          ) : null}

          {activeTab === "schedule" ? (
            <>
              <Text style={styles.sectionTitle}>Scheduling</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Create shift</Text>
                <Text style={styles.label}>Employee User ID (UUID)</Text>
                <TextInput value={shiftUserId} onChangeText={setShiftUserId} placeholder="Paste user_id" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>Role</Text>
                <TextInput value={shiftRole} onChangeText={setShiftRole} placeholder="Lead Cook / Cashier / Prep" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>Start (YYYY-MM-DD HH:MM)</Text>
                <TextInput value={shiftStart} onChangeText={setShiftStart} placeholder="2026-01-01 18:00" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>End (YYYY-MM-DD HH:MM)</Text>
                <TextInput value={shiftEnd} onChangeText={setShiftEnd} placeholder="2026-01-01 23:00" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>Notes</Text>
                <TextInput value={shiftNotes} onChangeText={setShiftNotes} placeholder="Optional" placeholderTextColor={COLORS.textSecondary} style={[styles.input, { height: 80 }]} multiline />
                <TouchableOpacity onPress={createShift} style={styles.primaryBtn}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Create</Text>
                </TouchableOpacity>
              </View>

              {shifts.map((s) => (
                <View key={s.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{s.role ?? "Shift"}</Text>
                    <Text style={styles.rowSub}>{new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}</Text>
                    <Text style={styles.rowSub}>User: {s.user_id}</Text>
                    <Text style={styles.rowSub}>Status: {s.status}</Text>
                  </View>
                </View>
              ))}
              {shifts.length === 0 ? <Text style={styles.empty}>No shifts for this location.</Text> : null}
            </>
          ) : null}

          {activeTab === "needs" ? (
            <>
              <Text style={styles.sectionTitle}>Needs / Requests</Text>
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
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity onPress={() => updateNeedStatus(n.id, "ordered")} style={styles.smallBtn}>
                      <Text style={styles.smallBtnText}>ORDERED</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateNeedStatus(n.id, "fulfilled")} style={[styles.smallBtn, { borderColor: COLORS.success }]}>
                      <Text style={[styles.smallBtnText, { color: COLORS.success }]}>DONE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {needs.length === 0 ? <Text style={styles.empty}>No requests.</Text> : null}
            </>
          ) : null}

          {activeTab === "sops" ? (
            <>
              <Text style={styles.sectionTitle}>SOP Library</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Publish SOP</Text>
                <Text style={styles.label}>Brand</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
                  {brands.map((b) => (
                    <TouchableOpacity key={b.id} onPress={() => setSopBrandId(b.id)} style={[styles.pill, sopBrandId === b.id && styles.pillActive]}>
                      <Text style={[styles.pillText, sopBrandId === b.id && styles.pillTextActive]}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.label}>Title</Text>
                <TextInput value={sopTitle} onChangeText={setSopTitle} placeholder="Kitchen SOP v1" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>Version</Text>
                <TextInput value={sopVersion} onChangeText={setSopVersion} placeholder="1.0" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>File URL</Text>
                <TextInput value={sopFileUrl} onChangeText={setSopFileUrl} placeholder="Supabase Storage URL or Drive link" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <TouchableOpacity onPress={createSop} style={styles.primaryBtn}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Publish</Text>
                </TouchableOpacity>
              </View>

              {sops.map((d) => (
                <View key={d.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{d.title}</Text>
                    <Text style={styles.rowSub}>Brand: {d.brand_id} • Version: {d.version ?? "—"} • Active: {String(d.is_active)}</Text>
                    <Text style={styles.rowSub}>Published: {new Date(d.published_at).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
              {sops.length === 0 ? <Text style={styles.empty}>No SOPs yet.</Text> : null}
            </>
          ) : null}

          {activeTab === "training" ? (
            <>
              <Text style={styles.sectionTitle}>Training</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Create module</Text>
                <Text style={styles.label}>Title</Text>
                <TextInput value={trainTitle} onChangeText={setTrainTitle} placeholder="Food Safety Basics" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
                <Text style={styles.label}>Description</Text>
                <TextInput value={trainDesc} onChangeText={setTrainDesc} placeholder="What to know before your first shift" placeholderTextColor={COLORS.textSecondary} style={[styles.input, { height: 80 }]} multiline />
                <TouchableOpacity onPress={createTrainingModule} style={styles.primaryBtn}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Create</Text>
                </TouchableOpacity>
              </View>

              {trainingModules.map((m) => (
                <View key={m.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{m.title}</Text>
                    <Text style={styles.rowSub}>{m.description ?? "—"}</Text>
                    <Text style={styles.rowSub}>Active: {String(m.is_active)}</Text>
                  </View>
                </View>
              ))}
              {trainingModules.length === 0 ? <Text style={styles.empty}>No training modules yet.</Text> : null}
            </>
          ) : null}

          {activeTab === "chat" ? (
            <>
              <Text style={styles.sectionTitle}>Location Chat</Text>
              {!room ? <Text style={styles.empty}>No room yet.</Text> : (
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

          {activeTab === "directory" ? (
            <>
              <Text style={styles.sectionTitle}>Directory</Text>
              {employees.map((u) => (
                <View key={u.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{u.full_name ?? u.email ?? u.id}</Text>
                    <Text style={styles.rowSub}>Role: {u.role} • User ID: {u.id}</Text>
                  </View>
                </View>
              ))}
              {employees.length === 0 ? <Text style={styles.empty}>No users visible (check RLS on profiles).</Text> : null}
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
                {locations.length === 0 ? <Text style={styles.empty}>No locations found.</Text> : null}
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
  primaryBtn: { marginTop: 12, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
  pill: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: "transparent", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "800" },
  pillTextActive: { color: "#fff" },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  smallBtnText: { color: COLORS.primary, fontWeight: "900", fontSize: 11 },

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

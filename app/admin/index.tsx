import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, AlertTriangle, BarChart3, Settings, MapPin, Activity, FileText, ClipboardList, Users, ChevronRight, Clock, CheckCircle, Circle, Send, MessageSquare, BookOpen, ArrowLeft, X as XIcon, Megaphone } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useBrands, useLocations, useKpis, useAlerts, useSops, useTasks, useTrainingModules, useChannels, useChatMessages } from '@/hooks/useSupabaseData';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

type Screen = 'home' | 'location' | 'alerts' | 'reports' | 'settings' | 'sops' | 'sop_detail' | 'tasks' | 'training' | 'training_detail' | 'chat' | 'chat_channel' | 'outreach' | 'schedule';

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, userId, signOut, allowedLocations } = useAuth();
  const { data: brands } = useBrands();
  const { data: locations, isLoading: locsLoading, refetch: refetchLocs } = useLocations();
  const { data: kpis } = useKpis();
  const { data: alerts, refetch: refetchAlerts } = useAlerts();
  const { data: sops } = useSops();
  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: training } = useTrainingModules();
  const { data: channels } = useChannels();

  const [screen, setScreen] = useState<Screen>('home');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSop, setSelectedSop] = useState<any>(null);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: chatMessages, refetch: refetchChat } = useChatMessages(selectedChannel?.id);

  const activeAlerts = alerts?.filter(a => a.status === 'active') ?? [];
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'error').length;
  const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress') ?? [];
  const revenueKpi = kpis?.find(k => k.name.includes('Revenue'));
  const ordersKpi = kpis?.find(k => k.name.includes('Orders'));
  const slaKpi = kpis?.find(k => k.name.includes('SLA'));
  const ratingKpi = kpis?.find(k => k.name.includes('Rating'));

  const onRefresh = async () => { setRefreshing(true); await Promise.all([refetchLocs(), refetchAlerts(), refetchTasks()]); setRefreshing(false); };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedChannel || !userId) return;
    await supabase.from('cg_messages').insert({ channel_id: selectedChannel.id, actor_id: userId, body: chatInput.trim() });
    setChatInput('');
    refetchChat();
  };

  const BackHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <View style={s.backHeader}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}><ArrowLeft color={COLORS.pureWhite} size={22} /></TouchableOpacity>
      <Text style={s.backTitle}>{title}</Text>
    </View>
  );

  // ─── LOCATION DETAIL ───
  if (screen === 'location' && selectedLocation) {
    const locAlerts = activeAlerts.filter(a => a.location_id === selectedLocation.id);
    const locTasks = pendingTasks.filter(t => t.location_id === selectedLocation.id);
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title={selectedLocation.name} onBack={() => setScreen('home')} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            <Text style={s.locCity}>{selectedLocation.city}, {selectedLocation.state}</Text>
            <View style={s.statsRow}>
              <View style={s.statBox}><Text style={s.statNum}>{locAlerts.length}</Text><Text style={s.statLbl}>Alerts</Text></View>
              <View style={s.statBox}><Text style={s.statNum}>{locTasks.length}</Text><Text style={s.statLbl}>Tasks</Text></View>
              <View style={s.statBox}><Text style={s.statNum}>{brands?.length ?? 0}</Text><Text style={s.statLbl}>Brands</Text></View>
            </View>
            {locAlerts.length > 0 && <><Text style={s.secTitle}>ALERTS</Text>{locAlerts.map((a,i) => <View key={i} style={[s.row, { borderLeftColor: a.severity === 'critical' ? COLORS.alertRed : COLORS.warning, borderLeftWidth: 3 }]}><AlertTriangle color={COLORS.alertRed} size={14} /><Text style={s.rowText}>{a.title}</Text></View>)}</>}
            {locTasks.length > 0 && <><Text style={s.secTitle}>OPEN TASKS</Text>{locTasks.map((t,i) => <TouchableOpacity key={i} style={s.row}><Circle color={t.priority === 'critical' ? COLORS.alertRed : t.priority === 'high' ? COLORS.warning : COLORS.electricBlue} size={14} /><View style={{flex:1,marginLeft:10}}><Text style={s.rowText}>{t.title}</Text><Text style={s.rowSub}>{t.priority} • {t.status}</Text></View></TouchableOpacity>)}</>}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── SOP LIST ───
  if (screen === 'sops') {
    const categories = [...new Set(sops?.map(s => s.category) ?? [])];
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="SOPs & Documents" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {categories.map(cat => (
              <View key={cat}>
                <Text style={s.secTitle}>{cat.toUpperCase().replace('_',' ')}</Text>
                {sops?.filter(s => s.category === cat).map((sop, i) => (
                  <TouchableOpacity key={i} style={s.row} onPress={() => { setSelectedSop(sop); setScreen('sop_detail'); }}>
                    <FileText color={cat === 'menu' ? COLORS.moltenGold : cat === 'outreach' ? COLORS.electricBlue : COLORS.emeraldGreen} size={16} />
                    <Text style={[s.rowText, {flex:1,marginLeft:10}]}>{sop.title}</Text>
                    <ChevronRight color={COLORS.lightGray} size={16} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── SOP DETAIL ───
  if (screen === 'sop_detail' && selectedSop) {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title={selectedSop.title} onBack={() => setScreen('sops')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={[s.badge, { alignSelf: 'flex-start' }]}><Text style={s.badgeText}>{selectedSop.category?.toUpperCase()}</Text></View>
            <Text style={s.sopContent}>{selectedSop.content}</Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── TASKS ───
  if (screen === 'tasks') {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="Tasks & Checklists" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refetchTasks()} tintColor={COLORS.moltenGold} />}>
            {tasks?.map((t, i) => (
              <TouchableOpacity key={i} style={s.row} onPress={async () => {
                const next = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'pending';
                await supabase.from('cgtasks').update({ status: next, ...(next === 'completed' ? { completed_at: new Date().toISOString() } : {}) }).eq('id', t.id);
                refetchTasks();
              }}>
                {t.status === 'completed' ? <CheckCircle color={COLORS.emeraldGreen} size={18} /> : <Circle color={t.priority === 'critical' ? COLORS.alertRed : t.priority === 'high' ? COLORS.warning : COLORS.electricBlue} size={18} />}
                <View style={{flex:1,marginLeft:12}}>
                  <Text style={[s.rowText, t.status === 'completed' && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{t.title}</Text>
                  <Text style={s.rowSub}>{t.priority} • {t.status.replace('_',' ')}{t.due_date ? ` • Due ${t.due_date}` : ''}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── TRAINING ───
  if (screen === 'training') {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="Training & Modules" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {training?.map((t, i) => (
              <TouchableOpacity key={i} style={s.row} onPress={() => { setSelectedTraining(t); setScreen('training_detail'); }}>
                <BookOpen color={COLORS.electricBlue} size={16} />
                <View style={{flex:1,marginLeft:10}}>
                  <Text style={s.rowText}>{t.title}</Text>
                  <Text style={s.rowSub}>{t.estimated_minutes} min{t.description ? ` • ${t.description.slice(0,50)}` : ''}</Text>
                </View>
                <ChevronRight color={COLORS.lightGray} size={16} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── TRAINING DETAIL ───
  if (screen === 'training_detail' && selectedTraining) {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title={selectedTraining.title} onBack={() => setScreen('training')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={s.rowSub}>{selectedTraining.estimated_minutes} minutes</Text>
            <Text style={[s.sopContent, { marginTop: 16 }]}>{selectedTraining.description}</Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── CHAT CHANNELS ───
  if (screen === 'chat') {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="Team Chat" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {channels?.map((ch, i) => (
              <TouchableOpacity key={i} style={s.row} onPress={() => { setSelectedChannel(ch); setScreen('chat_channel'); }}>
                <MessageSquare color={ch.type === 'global' ? COLORS.moltenGold : COLORS.electricBlue} size={18} />
                <View style={{flex:1,marginLeft:12}}>
                  <Text style={s.rowText}>#{ch.name}</Text>
                  <Text style={s.rowSub}>{ch.type}</Text>
                </View>
                <ChevronRight color={COLORS.lightGray} size={16} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── CHAT CHANNEL ───
  if (screen === 'chat_channel' && selectedChannel) {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top','bottom']}>
          <BackHeader title={`#${selectedChannel.name}`} onBack={() => setScreen('chat')} />
          <ScrollView style={{flex:1}} contentContainerStyle={{ padding: 16 }}>
            {chatMessages?.map((m, i) => (
              <View key={i} style={s.msgBubble}>
                <Text style={s.msgBody}>{m.body}</Text>
                <Text style={s.msgTime}>{new Date(m.created_at).toLocaleString()}</Text>
              </View>
            ))}
            {(!chatMessages || chatMessages.length === 0) && <Text style={s.rowSub}>No messages yet. Start the conversation.</Text>}
          </ScrollView>
          <View style={s.chatInputRow}>
            <TextInput style={s.chatInput} placeholder="Type a message..." placeholderTextColor={COLORS.lightGray} value={chatInput} onChangeText={setChatInput} />
            <TouchableOpacity style={s.sendBtn} onPress={sendMessage}><Send color={COLORS.deepBlack} size={18} /></TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── ALERTS ───
  if (screen === 'alerts') {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="Alerts & Incidents" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refetchAlerts()} tintColor={COLORS.moltenGold} />}>
            {alerts?.map((a, i) => (
              <View key={i} style={[s.row, { borderLeftWidth: 3, borderLeftColor: a.severity === 'critical' ? COLORS.alertRed : a.severity === 'warning' ? COLORS.warning : COLORS.info }]}>
                <AlertTriangle color={a.severity === 'critical' || a.severity === 'error' ? COLORS.alertRed : COLORS.warning} size={16} />
                <View style={{flex:1,marginLeft:10}}>
                  <Text style={s.rowText}>{a.title}</Text>
                  <Text style={s.rowSub}>{a.severity.toUpperCase()} • {a.source || 'System'} • {a.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── REPORTS ───
  if (screen === 'reports') {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="Reports & KPIs" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={s.kpiGrid}>
              {kpis?.map((k, i) => (
                <View key={i} style={s.kpiCard}>
                  <Text style={[s.kpiVal, { color: k.status === 'good' ? COLORS.emeraldGreen : k.status === 'warning' ? COLORS.warning : COLORS.alertRed }]}>
                    {k.unit === 'USD' ? `$${Number(k.value).toLocaleString()}` : k.unit === 'percent' ? `${k.value}%` : k.value}
                  </Text>
                  <Text style={s.kpiLbl}>{k.name}</Text>
                  {k.trend_value !== 0 && <Text style={[s.rowSub, { color: k.trend_direction === 'up' ? COLORS.emeraldGreen : COLORS.alertRed }]}>{k.trend_direction === 'up' ? '↑' : '↓'} {Math.abs(k.trend_value)}%</Text>}
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── SETTINGS ───
  if (screen === 'settings') {
    return (
      <View style={s.container}><LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top']}>
          <BackHeader title="Settings & Access" onBack={() => setScreen('home')} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={s.row}><Shield color={COLORS.moltenGold} size={18} /><View style={{flex:1,marginLeft:10}}><Text style={s.rowText}>{profile?.full_name || 'Admin'}</Text><Text style={s.rowSub}>{(profile?.role || 'admin').toUpperCase()}</Text></View></View>
            <Text style={s.secTitle}>LOCATIONS ({locations?.length})</Text>
            {locations?.map((l, i) => <View key={i} style={s.row}><MapPin color={COLORS.electricBlue} size={14} /><Text style={[s.rowText, {marginLeft:10}]}>{l.name} — {l.city}, {l.state}</Text></View>)}
            <Text style={s.secTitle}>BRANDS ({brands?.length})</Text>
            {brands?.map((b, i) => <View key={i} style={s.row}><View style={[s.dot, { backgroundColor: COLORS.moltenGold }]} /><Text style={s.rowText}>{b.name}</Text></View>)}
            <TouchableOpacity style={[s.row, { marginTop: 20 }]} onPress={signOut}><Text style={[s.rowText, { color: COLORS.alertRed }]}>Sign Out</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ─── HOME ───
  return (
    <View style={s.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.moltenGold} />}>
          {/* Header */}
          <View style={s.header}>
            <LinearGradient colors={[COLORS.moltenGold, COLORS.darkGold]} style={s.headerIcon}><Shield color={COLORS.deepBlack} size={20} /></LinearGradient>
            <View style={{flex:1}}><Text style={s.title}>ADMIN COMMAND</Text><Text style={s.subtitle}>Welcome back, {profile?.full_name || 'Admin'}</Text></View>
            <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}><XIcon color={COLORS.pureWhite} size={20} /></TouchableOpacity>
          </View>

          {/* KPI Strip */}
          <View style={s.statsRow}>
            <View style={s.statBox}><Text style={s.statNum}>{revenueKpi ? `$${(Number(revenueKpi.value)/1000).toFixed(0)}K` : '—'}</Text><Text style={s.statLbl}>REVENUE</Text></View>
            <View style={s.statBox}><Text style={s.statNum}>{ordersKpi?.value ?? '—'}</Text><Text style={s.statLbl}>ORDERS</Text></View>
            <View style={s.statBox}><Text style={[s.statNum, criticalCount > 0 && { color: COLORS.alertRed }]}>{activeAlerts.length}</Text><Text style={s.statLbl}>ALERTS</Text></View>
            <View style={s.statBox}><Text style={s.statNum}>{ratingKpi?.value ?? '—'}</Text><Text style={s.statLbl}>RATING</Text></View>
          </View>

          {/* Locations — PRIMARY NAV */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={s.secTitle}>LOCATIONS</Text>
            {locations?.map((loc, i) => (
              <TouchableOpacity key={i} style={s.locCard} onPress={() => { setSelectedLocation(loc); setScreen('location'); }}>
                <MapPin color={COLORS.electricBlue} size={18} />
                <View style={{flex:1,marginLeft:12}}>
                  <Text style={s.rowText}>{loc.name}</Text>
                  <Text style={s.rowSub}>{loc.city}, {loc.state}</Text>
                </View>
                <ChevronRight color={COLORS.lightGray} size={18} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions Grid */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <Text style={s.secTitle}>OPERATIONS</Text>
            <View style={s.grid}>
              {[
                { title: 'Tasks', sub: `${pendingTasks.length} pending`, icon: ClipboardList, color: COLORS.electricBlue, go: 'tasks' as Screen },
                { title: 'SOPs & Docs', sub: `${sops?.length ?? 0} documents`, icon: FileText, color: COLORS.emeraldGreen, go: 'sops' as Screen },
                { title: 'Training', sub: `${training?.length ?? 0} modules`, icon: BookOpen, color: COLORS.moltenGold, go: 'training' as Screen },
                { title: 'Team Chat', sub: `${channels?.length ?? 0} channels`, icon: MessageSquare, color: COLORS.platinum, go: 'chat' as Screen },
                { title: 'Alerts', sub: `${activeAlerts.length} active`, icon: AlertTriangle, color: COLORS.alertRed, go: 'alerts' as Screen },
                { title: 'Reports', sub: `${kpis?.length ?? 0} KPIs`, icon: BarChart3, color: COLORS.moltenGold, go: 'reports' as Screen },
                { title: 'Command', sub: 'Live dashboard', icon: Activity, color: COLORS.electricBlue, go: 'command' as any },
                { title: 'Settings', sub: 'Access & roles', icon: Settings, color: COLORS.lightGray, go: 'settings' as Screen },
              ].map((a, i) => (
                <TouchableOpacity key={i} style={s.gridCard} onPress={() => a.go === 'command' ? router.push('/command') : setScreen(a.go)}>
                  <a.icon color={a.color} size={22} />
                  <Text style={s.gridTitle}>{a.title}</Text>
                  <Text style={s.gridSub}>{a.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  headerIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: COLORS.lightGray, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.darkCharcoal, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6 },
  statBox: { flex: 1, backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderGray },
  statNum: { fontSize: 18, fontWeight: '800', color: COLORS.moltenGold },
  statLbl: { fontSize: 8, color: COLORS.lightGray, letterSpacing: 1.5, marginTop: 4 },
  secTitle: { fontSize: 10, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 2, marginBottom: 10, marginTop: 4 },
  locCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.borderGray },
  locCity: { fontSize: 14, color: COLORS.lightGray, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.borderGray },
  rowText: { fontSize: 14, fontWeight: '600', color: COLORS.pureWhite },
  rowSub: { fontSize: 11, color: COLORS.lightGray, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCard: { width: '48%', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.borderGray, gap: 6 },
  gridTitle: { fontSize: 13, fontWeight: '700', color: COLORS.pureWhite },
  gridSub: { fontSize: 10, color: COLORS.lightGray },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: { width: '48%', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.borderGray },
  kpiVal: { fontSize: 20, fontWeight: '800' },
  kpiLbl: { fontSize: 11, color: COLORS.lightGray, marginTop: 4 },
  badge: { backgroundColor: COLORS.electricBlue, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 12 },
  badgeText: { fontSize: 9, fontWeight: '800', color: COLORS.deepBlack, letterSpacing: 1 },
  sopContent: { fontSize: 14, color: COLORS.pureWhite, lineHeight: 22, fontFamily: 'monospace' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  backHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.darkCharcoal, alignItems: 'center', justifyContent: 'center' },
  backTitle: { fontSize: 18, fontWeight: '800', color: COLORS.pureWhite },
  msgBubble: { backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderGray },
  msgBody: { fontSize: 14, color: COLORS.pureWhite, lineHeight: 20 },
  msgTime: { fontSize: 10, color: COLORS.lightGray, marginTop: 6 },
  chatInputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: COLORS.borderGray },
  chatInput: { flex: 1, backgroundColor: COLORS.darkCharcoal, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.pureWhite, fontSize: 14, borderWidth: 1, borderColor: COLORS.borderGray },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.moltenGold, alignItems: 'center', justifyContent: 'center' },
});

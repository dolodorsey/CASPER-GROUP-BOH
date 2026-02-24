import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal, Alert as RNAlert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, AlertTriangle, BarChart3, Settings, MapPin, Activity, FileText, ClipboardList, Users, ChevronRight, Clock, CheckCircle, Circle, Send, MessageSquare, BookOpen, ArrowLeft, X as XIcon, Calendar, Plus, Globe, Building, Download, Award } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useBrands, useLocations, useKpis, useAlerts, useSops, useTasks, useTrainingModules, useChannels, useChatMessages, useReportsDaily, useShiftsByLocation, useProfiles } from '@/hooks/useSupabaseData';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

type Screen = 'home'|'location'|'alerts'|'reports'|'settings'|'sops'|'sop_detail'|'tasks'|'training'|'training_detail'|'training_lesson'|'chat'|'chat_channel'|'schedule'|'users';

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, userId, signOut } = useAuth();
  const { data: brands } = useBrands();
  const { data: locations, refetch: refetchLocs } = useLocations();
  const { data: kpis } = useKpis();
  const { data: alerts, refetch: refetchAlerts } = useAlerts();
  const { data: sops, refetch: refetchSops } = useSops();
  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: training } = useTrainingModules();
  const { data: channels, refetch: refetchChannels } = useChannels();
  const { data: allProfiles } = useProfiles();

  const [screen, setScreen] = useState<Screen>('home');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSop, setSelectedSop] = useState<any>(null);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [taskLocationFilter, setTaskLocationFilter] = useState<string|null>(null);
  const [reportPeriod, setReportPeriod] = useState<'today'|'week'|'month'>('week');
  const [reportLocationFilter, setReportLocationFilter] = useState<string|null>(null);
  const [scheduleLocationId, setScheduleLocationId] = useState<string|null>(null);
  const [scheduleWeekOf, setScheduleWeekOf] = useState<string>(() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().split('T')[0]; });
  const [lessonBlock, setLessonBlock] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number,number>>({});
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelScope, setNewChannelScope] = useState('global');

  const { data: chatMessages, refetch: refetchChat } = useChatMessages(selectedChannel?.id);
  const reportDates = useMemo(() => {
    const now = new Date();
    if (reportPeriod === 'today') return { startDate: now.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
    if (reportPeriod === 'week') { const s = new Date(now); s.setDate(s.getDate()-7); return { startDate: s.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }; }
    const s = new Date(now); s.setDate(s.getDate()-30); return { startDate: s.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
  }, [reportPeriod]);
  const { data: reportData } = useReportsDaily({ ...reportDates, locationId: reportLocationFilter ?? undefined });
  const effSchedLoc = scheduleLocationId || locations?.[0]?.id;
  const { data: scheduleShifts } = useShiftsByLocation(effSchedLoc, scheduleWeekOf);

  const activeAlerts = alerts?.filter((a:any) => a.status === 'active') ?? [];
  const criticalCount = activeAlerts.filter((a:any) => a.severity === 'critical' || a.severity === 'error').length;
  const pendingTasks = tasks?.filter((t:any) => t.status === 'pending' || t.status === 'in_progress') ?? [];
  const filteredTasks = taskLocationFilter ? tasks?.filter((t:any) => t.location_id === taskLocationFilter) : tasks;
  const revenueKpi = kpis?.find((k:any) => k.name.includes('Revenue'));
  const ordersKpi = kpis?.find((k:any) => k.name.includes('Orders'));
  const ratingKpi = kpis?.find((k:any) => k.name.includes('Rating'));

  const reportAgg = useMemo(() => {
    if (!reportData || reportData.length === 0) return null;
    const tRev = reportData.reduce((s:number,r:any) => s+Number(r.revenue||0), 0);
    const tOrd = reportData.reduce((s:number,r:any) => s+Number(r.orders||0), 0);
    const avgT = tOrd > 0 ? tRev/tOrd : 0;
    const rr = reportData.filter((r:any)=>r.customer_rating); const avgR = rr.length>0 ? rr.reduce((s:number,r:any)=>s+Number(r.customer_rating),0)/rr.length : 0;
    const sr = reportData.filter((r:any)=>r.sla_pct); const avgS = sr.length>0 ? sr.reduce((s:number,r:any)=>s+Number(r.sla_pct),0)/sr.length : 0;
    const tLab = reportData.reduce((s:number,r:any) => s+Number(r.labor_cost||0), 0);
    const tFood = reportData.reduce((s:number,r:any) => s+Number(r.food_cost||0), 0);
    return { tRev, tOrd, avgT, avgR, avgS, tLab, tFood, days: reportData.length };
  }, [reportData]);

  const reportByLoc = useMemo(() => {
    if (!reportData || reportData.length === 0 || reportLocationFilter) return [];
    const m: Record<string,any> = {};
    reportData.forEach((r:any) => { const l = locations?.find((x:any)=>x.id===r.location_id); const k = r.location_id||'x'; if(!m[k]) m[k]={rev:0,ord:0,name:l?.name||'Unknown'}; m[k].rev+=Number(r.revenue||0); m[k].ord+=Number(r.orders||0); });
    return Object.values(m).sort((a:any,b:any) => b.rev-a.rev);
  }, [reportData, reportLocationFilter, locations]);

  // Actions
  const onRefresh = async () => { setRefreshing(true); await Promise.all([refetchLocs(),refetchAlerts(),refetchTasks(),refetchSops(),refetchChannels()]); setRefreshing(false); };
  const sendMessage = async () => { if(!chatInput.trim()||!selectedChannel||!userId) return; await supabase.from('cg_messages').insert({channel_id:selectedChannel.id,actor_id:userId,body:chatInput.trim()}); setChatInput(''); refetchChat(); };
  const createTask = async () => { if(!newTaskTitle.trim()) return; await supabase.from('cg_tasks').insert({title:newTaskTitle.trim(),priority:newTaskPriority,status:'pending',location_id:taskLocationFilter||null}); setNewTaskTitle(''); setShowCreateTask(false); refetchTasks(); };
  const createChannel = async () => { if(!newChannelName.trim()) return; await supabase.from('cg_channels').insert({name:newChannelName.trim(),type:newChannelScope==='managers'?'role':'global',scope:newChannelScope,min_role:newChannelScope==='managers'?'manager':newChannelScope==='hq'?'admin':'employee',is_archived:false}); setNewChannelName(''); setShowCreateChannel(false); refetchChannels(); };
  const acknowledgeSop = async (sopId:string) => { if(!userId) return; await supabase.from('cg_sop_acknowledgements').insert({sop_id:sopId,user_id:userId}); RNAlert.alert('Done','SOP acknowledged.'); };

  const BackHeader = ({title,onBack,rightAction}:{title:string;onBack:()=>void;rightAction?:React.ReactNode}) => (
    <View style={st.backHeader}><TouchableOpacity onPress={onBack} style={st.backBtn}><ArrowLeft color={COLORS.pureWhite} size={22}/></TouchableOpacity><Text style={st.backTitle} numberOfLines={1}>{title}</Text>{rightAction&&<View style={{marginLeft:'auto'}}>{rightAction}</View>}</View>
  );

  // LOCATION DETAIL
  if (screen === 'location' && selectedLocation) {
    const la = activeAlerts.filter((a:any)=>a.location_id===selectedLocation.id);
    const lt = pendingTasks.filter((t:any)=>t.location_id===selectedLocation.id);
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title={selectedLocation.name} onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={{padding:16}}>
      <Text style={st.locCity}>{selectedLocation.city}, {selectedLocation.state}</Text>
      <View style={st.statsRow}><View style={st.statBox}><Text style={st.statNum}>{la.length}</Text><Text style={st.statLbl}>ALERTS</Text></View><View style={st.statBox}><Text style={st.statNum}>{lt.length}</Text><Text style={st.statLbl}>TASKS</Text></View><View style={st.statBox}><Text style={st.statNum}>{brands?.length??0}</Text><Text style={st.statLbl}>BRANDS</Text></View></View>
      <View style={st.quickActions}>
        <TouchableOpacity style={st.quickBtn} onPress={()=>{setTaskLocationFilter(selectedLocation.id);setScreen('tasks');}}><ClipboardList color={COLORS.electricBlue} size={16}/><Text style={st.quickBtnText}>Tasks</Text></TouchableOpacity>
        <TouchableOpacity style={st.quickBtn} onPress={()=>{setScheduleLocationId(selectedLocation.id);setScreen('schedule');}}><Calendar color={COLORS.emeraldGreen} size={16}/><Text style={st.quickBtnText}>Schedule</Text></TouchableOpacity>
        <TouchableOpacity style={st.quickBtn} onPress={()=>setScreen('chat')}><MessageSquare color={COLORS.platinum} size={16}/><Text style={st.quickBtnText}>Chat</Text></TouchableOpacity>
      </View>
      {la.length>0&&<><Text style={st.secTitle}>ALERTS</Text>{la.map((a:any,i:number)=><View key={i} style={[st.row,{borderLeftColor:a.severity==='critical'?COLORS.alertRed:COLORS.warning,borderLeftWidth:3}]}><AlertTriangle color={COLORS.alertRed} size={14}/><Text style={[st.rowText,{marginLeft:8}]}>{a.title}</Text></View>)}</>}
      {lt.length>0&&<><Text style={st.secTitle}>TASKS</Text>{lt.map((t:any,i:number)=><View key={i} style={st.row}><Circle color={t.priority==='critical'?COLORS.alertRed:COLORS.electricBlue} size={14}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{t.title}</Text><Text style={st.rowSub}>{t.priority} · {t.status}</Text></View></View>)}</>}
    </ScrollView></SafeAreaView></View>);
  }

  // SOPS LIST
  if (screen === 'sops') {
    const cats = [...new Set(sops?.map((s:any)=>s.category)??[])];
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title="SOPs & Documents" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={{padding:16}}>
      {cats.map((cat:string)=>(<View key={cat}><Text style={st.secTitle}>{cat.toUpperCase().replace('_',' ')}</Text>
        {sops?.filter((s:any)=>s.category===cat).map((sop:any,i:number)=>(<TouchableOpacity key={i} style={st.row} onPress={()=>{setSelectedSop(sop);setScreen('sop_detail');}}>
          <FileText color={COLORS.emeraldGreen} size={16}/>
          <View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{sop.title}</Text>
            <View style={{flexDirection:'row',gap:6,marginTop:4}}>
              {sop.version&&<View style={st.tagBadge}><Text style={st.tagText}>v{sop.version}</Text></View>}
              {sop.requires_ack&&<View style={[st.tagBadge,{backgroundColor:COLORS.warning}]}><Text style={st.tagText}>ACK</Text></View>}
              {sop.file_url&&<View style={[st.tagBadge,{backgroundColor:COLORS.electricBlue}]}><Text style={st.tagText}>FILE</Text></View>}
            </View></View><ChevronRight color={COLORS.lightGray} size={16}/></TouchableOpacity>))}
      </View>))}
    </ScrollView></SafeAreaView></View>);
  }

  // SOP DETAIL
  if (screen === 'sop_detail' && selectedSop) {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title={selectedSop.title} onBack={()=>setScreen('sops')}/><ScrollView contentContainerStyle={{padding:16}}>
      <View style={{flexDirection:'row',gap:8,marginBottom:12}}><View style={[st.badge,{alignSelf:'flex-start'}]}><Text style={st.badgeText}>{selectedSop.category?.toUpperCase()}</Text></View>{selectedSop.version&&<View style={[st.badge,{backgroundColor:COLORS.darkCharcoal}]}><Text style={[st.badgeText,{color:COLORS.platinum}]}>V{selectedSop.version}</Text></View>}</View>
      <Text style={st.sopContent}>{selectedSop.content}</Text>
      {selectedSop.file_url&&<TouchableOpacity style={[st.row,{marginTop:16,justifyContent:'center'}]} onPress={()=>Linking.openURL(selectedSop.file_url)}><Download color={COLORS.electricBlue} size={18}/><Text style={[st.rowText,{color:COLORS.electricBlue,marginLeft:8}]}>View Document</Text></TouchableOpacity>}
      {selectedSop.requires_ack&&<TouchableOpacity style={[st.actionBtn,{marginTop:16}]} onPress={()=>acknowledgeSop(selectedSop.id)}><CheckCircle color={COLORS.deepBlack} size={18}/><Text style={st.actionBtnText}>Acknowledge</Text></TouchableOpacity>}
    </ScrollView></SafeAreaView></View>);
  }

  // TASKS
  if (screen === 'tasks') {
    const sorted = [...(filteredTasks??[])].sort((a:any,b:any)=>{const p:Record<string,number>={critical:0,high:1,medium:2,low:3};return(p[a.priority]??4)-(p[b.priority]??4);});
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}>
      <BackHeader title="Tasks" onBack={()=>{setTaskLocationFilter(null);setScreen('home');}} rightAction={<TouchableOpacity onPress={()=>setShowCreateTask(true)} style={st.plusBtn}><Plus color={COLORS.deepBlack} size={18}/></TouchableOpacity>}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight:44,paddingHorizontal:16}} contentContainerStyle={{gap:6,alignItems:'center'}}>
        <TouchableOpacity style={[st.filterChip,!taskLocationFilter&&st.filterChipActive]} onPress={()=>setTaskLocationFilter(null)}><Text style={[st.filterChipText,!taskLocationFilter&&st.filterChipTextActive]}>All</Text></TouchableOpacity>
        {locations?.map((l:any)=>(<TouchableOpacity key={l.id} style={[st.filterChip,taskLocationFilter===l.id&&st.filterChipActive]} onPress={()=>setTaskLocationFilter(l.id)}><Text style={[st.filterChipText,taskLocationFilter===l.id&&st.filterChipTextActive]}>{l.name}</Text></TouchableOpacity>))}
      </ScrollView>
      <ScrollView contentContainerStyle={{padding:16}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>refetchTasks()} tintColor={COLORS.moltenGold}/>}>
        {sorted.map((t:any,i:number)=>{const od=t.due_date&&new Date(t.due_date)<new Date()&&t.status!=='completed';return(
          <TouchableOpacity key={i} style={st.row} onPress={async()=>{const nx=t.status==='pending'?'in_progress':t.status==='in_progress'?'completed':'pending';await supabase.from('cg_tasks').update({status:nx,...(nx==='completed'?{completed_at:new Date().toISOString()}:{})}).eq('id',t.id);refetchTasks();}}>
            {t.status==='completed'?<CheckCircle color={COLORS.emeraldGreen} size={18}/>:<Circle color={t.priority==='critical'?COLORS.alertRed:t.priority==='high'?COLORS.warning:COLORS.electricBlue} size={18}/>}
            <View style={{flex:1,marginLeft:12}}><Text style={[st.rowText,t.status==='completed'&&{textDecorationLine:'line-through',opacity:0.5}]}>{t.title}</Text>
              <Text style={[st.rowSub,od&&{color:COLORS.alertRed}]}>{t.priority} · {t.status.replace('_',' ')}{t.due_date?' · '+t.due_date:''}{od?' · OVERDUE':''}</Text>
              {t.recurrence&&t.recurrence!=='none'&&<View style={[st.tagBadge,{marginTop:4}]}><Text style={st.tagText}>{t.recurrence.toUpperCase()}</Text></View>}
            </View></TouchableOpacity>);})}
      </ScrollView>
      <Modal visible={showCreateTask} transparent animationType="slide"><View style={st.modalOverlay}><View style={st.modalContent}>
        <Text style={st.modalTitle}>New Task</Text>
        <TextInput style={st.modalInput} placeholder="Task title..." placeholderTextColor={COLORS.lightGray} value={newTaskTitle} onChangeText={setNewTaskTitle}/>
        <View style={{flexDirection:'row',gap:6,marginBottom:16}}>{['low','medium','high','critical'].map(p=>(<TouchableOpacity key={p} style={[st.filterChip,newTaskPriority===p&&st.filterChipActive]} onPress={()=>setNewTaskPriority(p)}><Text style={[st.filterChipText,newTaskPriority===p&&st.filterChipTextActive]}>{p}</Text></TouchableOpacity>))}</View>
        <View style={{flexDirection:'row',gap:8}}><TouchableOpacity style={[st.actionBtn,{flex:1}]} onPress={createTask}><Text style={st.actionBtnText}>Create</Text></TouchableOpacity><TouchableOpacity style={[st.actionBtn,{flex:1,backgroundColor:COLORS.darkCharcoal}]} onPress={()=>setShowCreateTask(false)}><Text style={[st.actionBtnText,{color:COLORS.pureWhite}]}>Cancel</Text></TouchableOpacity></View>
      </View></View></Modal>
    </SafeAreaView></View>);
  }

  // TRAINING LIST
  if (screen === 'training') {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title="Training" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={{padding:16}}>
      {training?.map((t:any,i:number)=>{const bl=t.content_blocks??[];const hq=(t.quiz_questions??[]).length>0;return(
        <TouchableOpacity key={i} style={st.row} onPress={()=>{setSelectedTraining(t);if(bl.length>0){setLessonBlock(0);setQuizAnswers({});setScreen('training_lesson');}else setScreen('training_detail');}}>
          <BookOpen color={t.is_required?COLORS.moltenGold:COLORS.electricBlue} size={16}/>
          <View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{t.title}</Text>
            <Text style={st.rowSub}>{t.estimated_minutes} min{bl.length>0?' · '+bl.length+' sections':''}{hq?' · Quiz':''}</Text>
            <View style={{flexDirection:'row',gap:6,marginTop:4}}>{t.is_required&&<View style={[st.tagBadge,{backgroundColor:COLORS.alertRed}]}><Text style={st.tagText}>REQUIRED</Text></View>}{t.passing_score&&<View style={st.tagBadge}><Text style={st.tagText}>Pass: {t.passing_score}%</Text></View>}</View>
          </View><ChevronRight color={COLORS.lightGray} size={16}/></TouchableOpacity>);})}
    </ScrollView></SafeAreaView></View>);
  }

  // TRAINING DETAIL (fallback)
  if (screen === 'training_detail' && selectedTraining) {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title={selectedTraining.title} onBack={()=>setScreen('training')}/><ScrollView contentContainerStyle={{padding:16}}>
      <Text style={st.rowSub}>{selectedTraining.estimated_minutes} minutes</Text><Text style={[st.sopContent,{marginTop:16}]}>{selectedTraining.description}</Text>
    </ScrollView></SafeAreaView></View>);
  }

  // TRAINING LESSON
  if (screen === 'training_lesson' && selectedTraining) {
    const bl = selectedTraining.content_blocks??[]; const qz = selectedTraining.quiz_questions??[];
    const tot = bl.length+(qz.length>0?1:0); const isQ = lessonBlock>=bl.length&&qz.length>0;
    const prog = tot>0?((lessonBlock+1)/tot)*100:0; const cb = !isQ?bl[lessonBlock]:null;
    const submitQuiz = async()=>{let c=0;qz.forEach((q:any,i:number)=>{if(quizAnswers[i]===q.correct_answer_index)c++;});const sc=Math.round((c/qz.length)*100);const ps=sc>=(selectedTraining.passing_score||80);if(userId){await supabase.from('cg_training_progress').upsert({module_id:selectedTraining.id,user_id:userId,status:'completed',quiz_score:sc,quiz_answers:quizAnswers,current_block:bl.length,completed_at:new Date().toISOString()},{onConflict:'module_id,user_id'});}RNAlert.alert(ps?'Passed!':'Not Passed','Score: '+sc+'%');};
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title={selectedTraining.title} onBack={()=>setScreen('training')}/>
      <View style={st.progressBarBg}><View style={[st.progressBarFill,{width:prog+'%'}]}/></View>
      <Text style={[st.rowSub,{textAlign:'center',marginVertical:8}]}>{lessonBlock+1} / {tot}</Text>
      <ScrollView contentContainerStyle={{padding:16,flexGrow:1}}>
        {!isQ&&cb&&<View>{cb.type==='text'&&<Text style={st.lessonText}>{cb.content}</Text>}{cb.type==='checklist'&&<View><Text style={[st.secTitle,{marginBottom:8}]}>CHECKLIST</Text>{cb.content.split('|').map((item:string,idx:number)=>(<View key={idx} style={st.row}><CheckCircle color={COLORS.emeraldGreen} size={16}/><Text style={[st.rowText,{marginLeft:10}]}>{item.trim()}</Text></View>))}</View>}</View>}
        {isQ&&<View><Text style={[st.secTitle,{marginBottom:12}]}>QUIZ</Text>
          {qz.map((q:any,qi:number)=>(<View key={qi} style={{marginBottom:20}}><Text style={st.rowText}>{qi+1}. {q.question}</Text>{q.options.map((o:string,oi:number)=>(<TouchableOpacity key={oi} style={[st.row,{marginTop:6},quizAnswers[qi]===oi&&{borderColor:COLORS.moltenGold,borderWidth:2}]} onPress={()=>setQuizAnswers(p=>({...p,[qi]:oi}))}><Text style={st.rowText}>{o}</Text></TouchableOpacity>))}</View>))}
          <TouchableOpacity style={st.actionBtn} onPress={submitQuiz}><Award color={COLORS.deepBlack} size={18}/><Text style={st.actionBtnText}>Submit Quiz</Text></TouchableOpacity>
        </View>}
      </ScrollView>
      <View style={st.lessonNav}>
        <TouchableOpacity style={[st.lessonNavBtn,lessonBlock===0&&{opacity:0.3}]} onPress={()=>lessonBlock>0&&setLessonBlock(lessonBlock-1)} disabled={lessonBlock===0}><Text style={st.lessonNavText}>Previous</Text></TouchableOpacity>
        {lessonBlock<tot-1&&<TouchableOpacity style={st.lessonNavBtn} onPress={()=>setLessonBlock(lessonBlock+1)}><Text style={st.lessonNavText}>{lessonBlock===bl.length-1&&qz.length>0?'Take Quiz':'Next'}</Text></TouchableOpacity>}
      </View>
    </SafeAreaView></View>);
  }

  // CHAT
  if (screen === 'chat') {
    const si = (sc:string) => { if(sc==='global') return <Globe color={COLORS.moltenGold} size={18}/>; if(sc==='location') return <MapPin color={COLORS.electricBlue} size={18}/>; if(sc==='managers') return <Shield color={COLORS.emeraldGreen} size={18}/>; if(sc==='hq') return <Building color={COLORS.platinum} size={18}/>; return <MessageSquare color={COLORS.lightGray} size={18}/>; };
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}>
      <BackHeader title="Team Chat" onBack={()=>setScreen('home')} rightAction={<TouchableOpacity onPress={()=>setShowCreateChannel(true)} style={st.plusBtn}><Plus color={COLORS.deepBlack} size={18}/></TouchableOpacity>}/>
      <ScrollView contentContainerStyle={{padding:16}}>
        {channels?.map((ch:any,i:number)=>(<TouchableOpacity key={i} style={st.row} onPress={()=>{setSelectedChannel(ch);setScreen('chat_channel');}}>{si(ch.scope||ch.type)}<View style={{flex:1,marginLeft:12}}><Text style={st.rowText}>#{ch.name}</Text><Text style={st.rowSub}>{ch.scope||ch.type}{ch.min_role&&ch.min_role!=='employee'?' · '+ch.min_role+'+':''}</Text></View><ChevronRight color={COLORS.lightGray} size={16}/></TouchableOpacity>))}
      </ScrollView>
      <Modal visible={showCreateChannel} transparent animationType="slide"><View style={st.modalOverlay}><View style={st.modalContent}>
        <Text style={st.modalTitle}>New Channel</Text><TextInput style={st.modalInput} placeholder="Channel name..." placeholderTextColor={COLORS.lightGray} value={newChannelName} onChangeText={setNewChannelName}/>
        <Text style={[st.rowSub,{marginBottom:8}]}>Scope:</Text>
        <View style={{flexDirection:'row',gap:6,marginBottom:16,flexWrap:'wrap'}}>{['global','location','managers','hq'].map(sc=>(<TouchableOpacity key={sc} style={[st.filterChip,newChannelScope===sc&&st.filterChipActive]} onPress={()=>setNewChannelScope(sc)}><Text style={[st.filterChipText,newChannelScope===sc&&st.filterChipTextActive]}>{sc}</Text></TouchableOpacity>))}</View>
        <View style={{flexDirection:'row',gap:8}}><TouchableOpacity style={[st.actionBtn,{flex:1}]} onPress={createChannel}><Text style={st.actionBtnText}>Create</Text></TouchableOpacity><TouchableOpacity style={[st.actionBtn,{flex:1,backgroundColor:COLORS.darkCharcoal}]} onPress={()=>setShowCreateChannel(false)}><Text style={[st.actionBtnText,{color:COLORS.pureWhite}]}>Cancel</Text></TouchableOpacity></View>
      </View></View></Modal>
    </SafeAreaView></View>);
  }

  // CHAT CHANNEL
  if (screen === 'chat_channel' && selectedChannel) {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top','bottom']}>
      <BackHeader title={'#'+selectedChannel.name} onBack={()=>setScreen('chat')}/>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>{chatMessages?.map((m:any,i:number)=>(<View key={i} style={st.msgBubble}><Text style={st.msgBody}>{m.body}</Text><Text style={st.msgTime}>{new Date(m.created_at).toLocaleString()}</Text></View>))}{(!chatMessages||chatMessages.length===0)&&<Text style={st.rowSub}>No messages yet.</Text>}</ScrollView>
      <View style={st.chatInputRow}><TextInput style={st.chatInput} placeholder="Type a message..." placeholderTextColor={COLORS.lightGray} value={chatInput} onChangeText={setChatInput}/><TouchableOpacity style={st.sendBtn} onPress={sendMessage}><Send color={COLORS.deepBlack} size={18}/></TouchableOpacity></View>
    </SafeAreaView></View>);
  }

  // ALERTS
  if (screen === 'alerts') {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title="Alerts" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={{padding:16}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>refetchAlerts()} tintColor={COLORS.moltenGold}/>}>
      {alerts?.map((a:any,i:number)=>(<View key={i} style={[st.row,{borderLeftWidth:3,borderLeftColor:a.severity==='critical'?COLORS.alertRed:a.severity==='warning'?COLORS.warning:COLORS.info}]}><AlertTriangle color={a.severity==='critical'||a.severity==='error'?COLORS.alertRed:COLORS.warning} size={16}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{a.title}</Text><Text style={st.rowSub}>{a.severity.toUpperCase()} · {a.source||'System'} · {a.status}</Text></View></View>))}
    </ScrollView></SafeAreaView></View>);
  }

  // REPORTS
  if (screen === 'reports') {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title="Reports" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={{padding:16}}>
      <View style={{flexDirection:'row',gap:6,marginBottom:12}}>{(['today','week','month'] as const).map(p=>(<TouchableOpacity key={p} style={[st.filterChip,reportPeriod===p&&st.filterChipActive]} onPress={()=>setReportPeriod(p)}><Text style={[st.filterChipText,reportPeriod===p&&st.filterChipTextActive]}>{p==='today'?'Today':p==='week'?'7 Days':'30 Days'}</Text></TouchableOpacity>))}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}} contentContainerStyle={{gap:6}}>
        <TouchableOpacity style={[st.filterChip,!reportLocationFilter&&st.filterChipActive]} onPress={()=>setReportLocationFilter(null)}><Text style={[st.filterChipText,!reportLocationFilter&&st.filterChipTextActive]}>National</Text></TouchableOpacity>
        {locations?.map((l:any)=>(<TouchableOpacity key={l.id} style={[st.filterChip,reportLocationFilter===l.id&&st.filterChipActive]} onPress={()=>setReportLocationFilter(l.id)}><Text style={[st.filterChipText,reportLocationFilter===l.id&&st.filterChipTextActive]}>{l.name}</Text></TouchableOpacity>))}
      </ScrollView>
      {reportAgg&&<View style={st.kpiGrid}>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.moltenGold}]}>${(reportAgg.tRev/1000).toFixed(1)}K</Text><Text style={st.kpiLbl}>Revenue</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.electricBlue}]}>{reportAgg.tOrd.toLocaleString()}</Text><Text style={st.kpiLbl}>Orders</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.emeraldGreen}]}>${reportAgg.avgT.toFixed(2)}</Text><Text style={st.kpiLbl}>Avg Ticket</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.platinum}]}>{reportAgg.avgR.toFixed(1)}</Text><Text style={st.kpiLbl}>Rating</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.alertRed}]}>${(reportAgg.tLab/1000).toFixed(1)}K</Text><Text style={st.kpiLbl}>Labor</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.warning}]}>${(reportAgg.tFood/1000).toFixed(1)}K</Text><Text style={st.kpiLbl}>Food Cost</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.emeraldGreen}]}>{reportAgg.avgS.toFixed(1)}%</Text><Text style={st.kpiLbl}>SLA</Text></View>
        <View style={st.kpiCard}><Text style={[st.kpiVal,{color:COLORS.lightGray}]}>{reportAgg.days}</Text><Text style={st.kpiLbl}>Days</Text></View>
      </View>}
      {reportByLoc.length>0&&<View style={{marginTop:16}}><Text style={st.secTitle}>BY LOCATION</Text>{reportByLoc.map((l:any,i:number)=>(<View key={i} style={st.row}><MapPin color={COLORS.electricBlue} size={14}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{l.name}</Text><Text style={st.rowSub}>${(l.rev/1000).toFixed(1)}K · {l.ord} orders</Text></View></View>))}</View>}
      {!reportAgg&&<Text style={[st.rowSub,{textAlign:'center',marginTop:40}]}>No data for this period.</Text>}
    </ScrollView></SafeAreaView></View>);
  }

  // SCHEDULE
  if (screen === 'schedule') {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const ws = new Date(scheduleWeekOf);
    const pw = () => {const d=new Date(scheduleWeekOf);d.setDate(d.getDate()-7);setScheduleWeekOf(d.toISOString().split('T')[0]);};
    const nw = () => {const d=new Date(scheduleWeekOf);d.setDate(d.getDate()+7);setScheduleWeekOf(d.toISOString().split('T')[0]);};
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}>
      <BackHeader title="Schedule" onBack={()=>{setScheduleLocationId(null);setScreen('home');}}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxHeight:44,paddingHorizontal:16}} contentContainerStyle={{gap:6,alignItems:'center'}}>
        {locations?.map((l:any)=>(<TouchableOpacity key={l.id} style={[st.filterChip,effSchedLoc===l.id&&st.filterChipActive]} onPress={()=>setScheduleLocationId(l.id)}><Text style={[st.filterChipText,effSchedLoc===l.id&&st.filterChipTextActive]}>{l.name}</Text></TouchableOpacity>))}
      </ScrollView>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12}}>
        <TouchableOpacity onPress={pw}><ArrowLeft color={COLORS.pureWhite} size={20}/></TouchableOpacity>
        <Text style={st.rowText}>Week of {scheduleWeekOf}</Text>
        <TouchableOpacity onPress={nw}><ChevronRight color={COLORS.pureWhite} size={20}/></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{padding:16}}>
        {days.map((day,idx)=>{const d=new Date(ws);d.setDate(d.getDate()+idx);const k=d.toISOString().split('T')[0];const ds=(scheduleShifts??[]).filter((sh:any)=>sh.start_time?.startsWith(k));return(
          <View key={day} style={{marginBottom:12}}><Text style={st.secTitle}>{day} · {d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</Text>
            {ds.length===0&&<Text style={[st.rowSub,{marginLeft:4,marginBottom:4}]}>No shifts</Text>}
            {ds.map((sh:any,si:number)=>(<View key={si} style={st.row}><Clock color={COLORS.electricBlue} size={14}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{new Date(sh.start_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – {new Date(sh.end_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text><Text style={st.rowSub}>{sh.role||'Staff'}{sh.station?' · '+sh.station:''}</Text></View></View>))}
          </View>);})}
      </ScrollView>
    </SafeAreaView></View>);
  }

  // SETTINGS
  if (screen === 'settings') {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title="Settings" onBack={()=>setScreen('home')}/><ScrollView contentContainerStyle={{padding:16}}>
      <View style={st.row}><Shield color={COLORS.moltenGold} size={18}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{profile?.full_name||'Admin'}</Text><Text style={st.rowSub}>{(profile?.role||'admin').toUpperCase()}</Text></View></View>
      <Text style={st.secTitle}>LOCATIONS ({locations?.length})</Text>
      {locations?.map((l:any,i:number)=>(<View key={i} style={st.row}><MapPin color={COLORS.electricBlue} size={14}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{l.name}</Text><Text style={st.rowSub}>{l.city}, {l.state}</Text></View><View style={[st.tagBadge,{backgroundColor:l.status==='active'?COLORS.emeraldGreen:COLORS.alertRed}]}><Text style={st.tagText}>{(l.status||'ACTIVE').toUpperCase()}</Text></View></View>))}
      <Text style={st.secTitle}>BRANDS ({brands?.length})</Text>
      {brands?.map((b:any,i:number)=>(<View key={i} style={st.row}><View style={[st.dot,{backgroundColor:b.color_primary||COLORS.moltenGold}]}/><Text style={[st.rowText,{marginLeft:10}]}>{b.name}</Text></View>))}
      <TouchableOpacity onPress={()=>setScreen('users')}><Text style={[st.secTitle,{color:COLORS.electricBlue}]}>USER MANAGEMENT →</Text></TouchableOpacity>
      <Text style={st.secTitle}>SYSTEM</Text>
      <View style={st.row}><Text style={st.rowSub}>Supabase: qhgmukwoennurwuvmbhy</Text></View>
      <View style={st.row}><Text style={st.rowSub}>Platform: Rork (Expo Router)</Text></View>
      <TouchableOpacity style={[st.row,{marginTop:20}]} onPress={signOut}><Text style={[st.rowText,{color:COLORS.alertRed}]}>Sign Out</Text></TouchableOpacity>
    </ScrollView></SafeAreaView></View>);
  }

  // USERS
  if (screen === 'users') {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe} edges={['top']}><BackHeader title="Users" onBack={()=>setScreen('settings')}/><ScrollView contentContainerStyle={{padding:16}}>
      {allProfiles?.map((u:any,i:number)=>(<View key={i} style={st.row}><Users color={COLORS.electricBlue} size={16}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{u.full_name||u.id?.slice(0,8)}</Text><Text style={st.rowSub}>{(u.role||'employee').toUpperCase()}{u.role_level!=null?' · L'+u.role_level:''}</Text></View><View style={[st.tagBadge,{backgroundColor:u.role==='admin'?COLORS.moltenGold:COLORS.darkCharcoal}]}><Text style={st.tagText}>{(u.role||'EMP').toUpperCase()}</Text></View></View>))}
      {(!allProfiles||allProfiles.length===0)&&<Text style={st.rowSub}>No users found.</Text>}
    </ScrollView></SafeAreaView></View>);
  }

  // HOME
  return (
    <View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/>
      <SafeAreaView style={st.safe} edges={['top']}><ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.moltenGold}/>}>
        <View style={st.header}><LinearGradient colors={[COLORS.moltenGold,COLORS.darkGold]} style={st.headerIcon}><Shield color={COLORS.deepBlack} size={20}/></LinearGradient><View style={{flex:1}}><Text style={st.title}>ADMIN COMMAND</Text><Text style={st.subtitle}>Welcome back, {profile?.full_name||'Admin'}</Text></View><TouchableOpacity onPress={()=>router.back()} style={st.closeBtn}><XIcon color={COLORS.pureWhite} size={20}/></TouchableOpacity></View>
        <View style={st.statsRow}>
          <View style={st.statBox}><Text style={st.statNum}>{revenueKpi?'$'+(Number(revenueKpi.value)/1000).toFixed(0)+'K':'—'}</Text><Text style={st.statLbl}>REVENUE</Text></View>
          <View style={st.statBox}><Text style={st.statNum}>{ordersKpi?.value??'—'}</Text><Text style={st.statLbl}>ORDERS</Text></View>
          <View style={st.statBox}><Text style={[st.statNum,criticalCount>0&&{color:COLORS.alertRed}]}>{activeAlerts.length}</Text><Text style={st.statLbl}>ALERTS</Text></View>
          <View style={st.statBox}><Text style={st.statNum}>{ratingKpi?.value??'—'}</Text><Text style={st.statLbl}>RATING</Text></View>
        </View>
        <View style={{paddingHorizontal:16,marginTop:16}}><Text style={st.secTitle}>LOCATIONS</Text>
          {locations?.map((loc:any,i:number)=>(<TouchableOpacity key={i} style={st.locCard} onPress={()=>{setSelectedLocation(loc);setScreen('location');}}><MapPin color={COLORS.electricBlue} size={18}/><View style={{flex:1,marginLeft:12}}><Text style={st.rowText}>{loc.name}</Text><Text style={st.rowSub}>{loc.city}, {loc.state}</Text></View><ChevronRight color={COLORS.lightGray} size={18}/></TouchableOpacity>))}
        </View>
        <View style={{paddingHorizontal:16,marginTop:20}}><Text style={st.secTitle}>OPERATIONS</Text>
          <View style={st.grid}>{[
            {title:'Tasks',sub:pendingTasks.length+' pending',icon:ClipboardList,color:COLORS.electricBlue,go:'tasks' as Screen},
            {title:'SOPs & Docs',sub:(sops?.length??0)+' documents',icon:FileText,color:COLORS.emeraldGreen,go:'sops' as Screen},
            {title:'Training',sub:(training?.length??0)+' modules',icon:BookOpen,color:COLORS.moltenGold,go:'training' as Screen},
            {title:'Team Chat',sub:(channels?.length??0)+' channels',icon:MessageSquare,color:COLORS.platinum,go:'chat' as Screen},
            {title:'Schedule',sub:'Manage shifts',icon:Calendar,color:COLORS.electricBlue,go:'schedule' as Screen},
            {title:'Reports',sub:'Analytics',icon:BarChart3,color:COLORS.moltenGold,go:'reports' as Screen},
            {title:'Alerts',sub:activeAlerts.length+' active',icon:AlertTriangle,color:COLORS.alertRed,go:'alerts' as Screen},
            {title:'Command',sub:'Live dashboard',icon:Activity,color:COLORS.electricBlue,go:'command' as any},
            {title:'Settings',sub:'Access & roles',icon:Settings,color:COLORS.lightGray,go:'settings' as Screen},
          ].map((a,i)=>(<TouchableOpacity key={i} style={st.gridCard} onPress={()=>a.go==='command'?router.push('/command'):setScreen(a.go)}><a.icon color={a.color} size={22}/><Text style={st.gridTitle}>{a.title}</Text><Text style={st.gridSub}>{a.sub}</Text></TouchableOpacity>))}</View>
        </View>
        <View style={{height:40}}/>
      </ScrollView></SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container:{flex:1},safe:{flex:1},
  header:{flexDirection:'row',alignItems:'center',padding:16,gap:12},
  headerIcon:{width:42,height:42,borderRadius:12,alignItems:'center',justifyContent:'center'},
  title:{fontSize:18,fontWeight:'900',color:COLORS.pureWhite,letterSpacing:2},
  subtitle:{fontSize:12,color:COLORS.lightGray,marginTop:2},
  closeBtn:{width:36,height:36,borderRadius:18,backgroundColor:COLORS.darkCharcoal,alignItems:'center',justifyContent:'center'},
  statsRow:{flexDirection:'row',paddingHorizontal:16,gap:6},
  statBox:{flex:1,backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:12,alignItems:'center',borderWidth:1,borderColor:COLORS.borderGray},
  statNum:{fontSize:18,fontWeight:'800',color:COLORS.moltenGold},
  statLbl:{fontSize:8,color:COLORS.lightGray,letterSpacing:1.5,marginTop:4},
  secTitle:{fontSize:10,fontWeight:'700',color:COLORS.lightGray,letterSpacing:2,marginBottom:10,marginTop:4},
  locCard:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:14,marginBottom:6,borderWidth:1,borderColor:COLORS.borderGray},
  locCity:{fontSize:14,color:COLORS.lightGray,marginBottom:16},
  row:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:14,marginBottom:6,borderWidth:1,borderColor:COLORS.borderGray},
  rowText:{fontSize:14,fontWeight:'600',color:COLORS.pureWhite},
  rowSub:{fontSize:11,color:COLORS.lightGray,marginTop:2},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  gridCard:{width:'48%',backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:14,borderWidth:1,borderColor:COLORS.borderGray,gap:6},
  gridTitle:{fontSize:13,fontWeight:'700',color:COLORS.pureWhite},
  gridSub:{fontSize:10,color:COLORS.lightGray},
  kpiGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  kpiCard:{width:'48%',backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:14,borderWidth:1,borderColor:COLORS.borderGray},
  kpiVal:{fontSize:20,fontWeight:'800'},
  kpiLbl:{fontSize:11,color:COLORS.lightGray,marginTop:4},
  badge:{backgroundColor:COLORS.electricBlue,borderRadius:4,paddingHorizontal:8,paddingVertical:3,marginBottom:12},
  badgeText:{fontSize:9,fontWeight:'800',color:COLORS.deepBlack,letterSpacing:1},
  tagBadge:{backgroundColor:COLORS.darkCharcoal,borderRadius:4,paddingHorizontal:6,paddingVertical:2,borderWidth:1,borderColor:COLORS.borderGray},
  tagText:{fontSize:8,fontWeight:'700',color:COLORS.platinum,letterSpacing:1},
  sopContent:{fontSize:14,color:COLORS.pureWhite,lineHeight:22,fontFamily:'monospace'},
  dot:{width:8,height:8,borderRadius:4},
  backHeader:{flexDirection:'row',alignItems:'center',padding:16,gap:12},
  backBtn:{width:36,height:36,borderRadius:18,backgroundColor:COLORS.darkCharcoal,alignItems:'center',justifyContent:'center'},
  backTitle:{fontSize:18,fontWeight:'800',color:COLORS.pureWhite,flex:1},
  msgBubble:{backgroundColor:COLORS.darkCharcoal,borderRadius:12,padding:14,marginBottom:8,borderWidth:1,borderColor:COLORS.borderGray},
  msgBody:{fontSize:14,color:COLORS.pureWhite,lineHeight:20},
  msgTime:{fontSize:10,color:COLORS.lightGray,marginTop:6},
  chatInputRow:{flexDirection:'row',padding:12,gap:8,borderTopWidth:1,borderTopColor:COLORS.borderGray},
  chatInput:{flex:1,backgroundColor:COLORS.darkCharcoal,borderRadius:20,paddingHorizontal:16,paddingVertical:10,color:COLORS.pureWhite,fontSize:14,borderWidth:1,borderColor:COLORS.borderGray},
  sendBtn:{width:40,height:40,borderRadius:20,backgroundColor:COLORS.moltenGold,alignItems:'center',justifyContent:'center'},
  quickActions:{flexDirection:'row',gap:8,marginBottom:16},
  quickBtn:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:12,borderWidth:1,borderColor:COLORS.borderGray},
  quickBtnText:{fontSize:12,fontWeight:'600',color:COLORS.pureWhite},
  plusBtn:{width:32,height:32,borderRadius:16,backgroundColor:COLORS.moltenGold,alignItems:'center',justifyContent:'center'},
  filterChip:{paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:COLORS.darkCharcoal,borderWidth:1,borderColor:COLORS.borderGray},
  filterChipActive:{backgroundColor:COLORS.moltenGold,borderColor:COLORS.moltenGold},
  filterChipText:{fontSize:11,fontWeight:'600',color:COLORS.lightGray},
  filterChipTextActive:{color:COLORS.deepBlack},
  actionBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,backgroundColor:COLORS.moltenGold,borderRadius:10,padding:14},
  actionBtnText:{fontSize:14,fontWeight:'700',color:COLORS.deepBlack},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.8)',justifyContent:'flex-end'},
  modalContent:{backgroundColor:COLORS.darkCharcoal,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  modalTitle:{fontSize:18,fontWeight:'800',color:COLORS.pureWhite,marginBottom:16},
  modalInput:{backgroundColor:COLORS.deepBlack,borderRadius:10,padding:14,color:COLORS.pureWhite,fontSize:14,borderWidth:1,borderColor:COLORS.borderGray,marginBottom:12},
  progressBarBg:{height:4,backgroundColor:COLORS.darkCharcoal,marginHorizontal:16,borderRadius:2},
  progressBarFill:{height:4,backgroundColor:COLORS.moltenGold,borderRadius:2},
  lessonText:{fontSize:16,color:COLORS.pureWhite,lineHeight:26},
  lessonNav:{flexDirection:'row',justifyContent:'space-between',padding:16,borderTopWidth:1,borderTopColor:COLORS.borderGray},
  lessonNavBtn:{paddingHorizontal:20,paddingVertical:10,backgroundColor:COLORS.darkCharcoal,borderRadius:10,borderWidth:1,borderColor:COLORS.borderGray},
  lessonNavText:{fontSize:14,fontWeight:'600',color:COLORS.pureWhite},
});

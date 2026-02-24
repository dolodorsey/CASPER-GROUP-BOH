import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Calendar, BookOpen, FileText, MessageSquare, Clock, CheckCircle, Circle, ShieldAlert, ChevronRight, ArrowLeft, Send, Award } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";
import { useChannels, useChatMessages, useTrainingModules, useSops, useTasks, useMyShifts } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

export default function EmployeePortal() {
  const router = useRouter();
  const { profile, isBooting, userId } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const { data: channels } = useChannels();
  const { data: trainingModules } = useTrainingModules();
  const { data: liveSops } = useSops();
  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: myShifts } = useMyShifts(userId);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const { data: chatMessages, refetch: refetchChat } = useChatMessages(selectedChannel?.id);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [lessonBlock, setLessonBlock] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number,number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedChannel || !userId) return;
    await supabase.from('cg_messages').insert({ channel_id: selectedChannel.id, actor_id: userId, body: chatInput.trim() });
    setChatInput(''); refetchChat();
  };

  if (isBooting) return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><View style={st.gate}><ActivityIndicator size="large" color={COLORS.electricBlue}/></View></View>);

  if (!profile || !['employee','admin'].includes(profile.role)) {
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe}><View style={st.gate}><ShieldAlert color={COLORS.alertRed} size={64}/><Text style={st.gateTitle}>ACCESS DENIED</Text><Text style={st.gateSub}>Employee or Admin role required.</Text><TouchableOpacity style={st.gateBtn} onPress={()=>router.back()}><Text style={st.gateBtnText}>Go Back</Text></TouchableOpacity></View></SafeAreaView></View>);
  }

  const myTasks = tasks?.filter((t:any) => t.status === 'pending' || t.status === 'in_progress') ?? [];
  const todayShift = myShifts?.find((s:any) => s.start_time?.startsWith(new Date().toISOString().split('T')[0]));
  const upcomingShifts = myShifts?.filter((s:any) => new Date(s.start_time) >= new Date()).slice(0, 7) ?? [];
  const requiredTraining = trainingModules?.filter((t:any) => t.is_required) ?? [];

  const handleRefresh = async () => { setIsRefreshing(true); await refetchTasks(); setIsRefreshing(false); };

  // TRAINING LESSON
  if (activeTab === 'training_lesson' && selectedTraining) {
    const bl = selectedTraining.content_blocks ?? []; const qz = selectedTraining.quiz_questions ?? [];
    const tot = bl.length+(qz.length>0?1:0); const isQ = lessonBlock>=bl.length&&qz.length>0;
    const prog = tot>0?((lessonBlock+1)/tot)*100:0; const cb = !isQ?bl[lessonBlock]:null;
    const submitQuiz = async()=>{let c=0;qz.forEach((q:any,i:number)=>{if(quizAnswers[i]===q.correct_answer_index)c++;});const sc=Math.round((c/qz.length)*100);if(userId){await supabase.from('cg_training_progress').upsert({module_id:selectedTraining.id,user_id:userId,status:'completed',quiz_score:sc,quiz_answers:quizAnswers,current_block:bl.length,completed_at:new Date().toISOString()},{onConflict:'module_id,user_id'});}};
    return (<View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/><SafeAreaView style={st.safe}>
      <View style={st.backHeader}><TouchableOpacity onPress={()=>{setActiveTab('training');setSelectedTraining(null);}} style={st.backBtn}><ArrowLeft color={COLORS.pureWhite} size={22}/></TouchableOpacity><Text style={st.backTitle} numberOfLines={1}>{selectedTraining.title}</Text></View>
      <View style={st.progressBg}><View style={[st.progressFill,{width:prog+'%'}]}/></View>
      <Text style={[st.sub,{textAlign:'center',marginVertical:8}]}>{lessonBlock+1}/{tot}</Text>
      <ScrollView contentContainerStyle={{padding:20,flexGrow:1}}>
        {!isQ&&cb&&<View>{cb.type==='text'&&<Text style={st.lessonText}>{cb.content}</Text>}{cb.type==='checklist'&&cb.content.split('|').map((item:string,idx:number)=>(<View key={idx} style={st.row}><CheckCircle color={COLORS.emeraldGreen} size={16}/><Text style={[st.rowText,{marginLeft:10}]}>{item.trim()}</Text></View>))}</View>}
        {isQ&&<View><Text style={[st.secTitle,{marginBottom:12}]}>QUIZ</Text>{qz.map((q:any,qi:number)=>(<View key={qi} style={{marginBottom:20}}><Text style={st.rowText}>{qi+1}. {q.question}</Text>{q.options.map((o:string,oi:number)=>(<TouchableOpacity key={oi} style={[st.row,{marginTop:6},quizAnswers[qi]===oi&&{borderColor:COLORS.moltenGold,borderWidth:2}]} onPress={()=>setQuizAnswers(p=>({...p,[qi]:oi}))}><Text style={st.rowText}>{o}</Text></TouchableOpacity>))}</View>))}<TouchableOpacity style={st.actionBtn} onPress={submitQuiz}><Award color={COLORS.deepBlack} size={18}/><Text style={st.actionBtnText}>Submit</Text></TouchableOpacity></View>}
      </ScrollView>
      <View style={st.lessonNav}>
        <TouchableOpacity style={[st.navBtn,lessonBlock===0&&{opacity:0.3}]} onPress={()=>lessonBlock>0&&setLessonBlock(lessonBlock-1)} disabled={lessonBlock===0}><Text style={st.navBtnText}>Previous</Text></TouchableOpacity>
        {lessonBlock<tot-1&&<TouchableOpacity style={st.navBtn} onPress={()=>setLessonBlock(lessonBlock+1)}><Text style={st.navBtnText}>{lessonBlock===bl.length-1&&qz.length>0?'Take Quiz':'Next'}</Text></TouchableOpacity>}
      </View>
    </SafeAreaView></View>);
  }

  const tabs = [
    {id:'home',label:'Home'},
    {id:'schedule',label:'Schedule'},
    {id:'training',label:'Training'},
    {id:'messages',label:'Messages'},
  ];

  return (
    <View style={st.container}><LinearGradient colors={[COLORS.deepBlack,COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject}/>
      <SafeAreaView style={st.safe}>
        <View style={st.header}><View style={{flex:1}}><Text style={st.title}>EMPLOYEE HUB</Text><Text style={st.headerSub}>{profile?.full_name||'Team Member'}</Text></View><TouchableOpacity onPress={()=>router.back()} style={st.closeBtn}><X color={COLORS.pureWhite} size={20}/></TouchableOpacity></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabBar} contentContainerStyle={{paddingHorizontal:20,gap:6}}>
          {tabs.map(t=>(<TouchableOpacity key={t.id} style={[st.tab,activeTab===t.id&&st.tabActive]} onPress={()=>setActiveTab(t.id)}><Text style={[st.tabText,activeTab===t.id&&st.tabTextActive]}>{t.label}</Text></TouchableOpacity>))}
        </ScrollView>

        <ScrollView style={{flex:1}} contentContainerStyle={{padding:20}} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.electricBlue}/>}>

          {/* HOME - only actionable info */}
          {activeTab==='home'&&<View>
            {/* My Shift Today */}
            {todayShift ? (
              <View style={st.shiftCard}><Clock color={COLORS.electricBlue} size={20}/>
                <View style={{marginLeft:12,flex:1}}><Text style={st.rowText}>Today's Shift</Text>
                  <Text style={st.sub}>{new Date(todayShift.start_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – {new Date(todayShift.end_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text>
                  <Text style={st.sub}>{todayShift.role||'Staff'}{todayShift.station?' · '+todayShift.station:''}</Text>
                </View></View>
            ) : (<View style={st.shiftCard}><Clock color={COLORS.lightGray} size={20}/><Text style={[st.sub,{marginLeft:12}]}>No shift scheduled today</Text></View>)}

            {/* My Tasks */}
            {myTasks.length>0&&<><Text style={[st.secTitle,{marginTop:16}]}>MY TASKS ({myTasks.length})</Text>
              {myTasks.slice(0,5).map((t:any,i:number)=>(<TouchableOpacity key={i} style={st.row} onPress={async()=>{const nx=t.status==='pending'?'in_progress':'completed';await supabase.from('cg_tasks').update({status:nx,...(nx==='completed'?{completed_at:new Date().toISOString()}:{})}).eq('id',t.id);refetchTasks();}}>
                {t.status==='completed'?<CheckCircle color={COLORS.emeraldGreen} size={16}/>:<Circle color={t.priority==='critical'?COLORS.alertRed:COLORS.electricBlue} size={16}/>}
                <View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{t.title}</Text><Text style={st.sub}>{t.priority} · Tap to advance</Text></View>
              </TouchableOpacity>))}</>}

            {/* Required Training */}
            {requiredTraining.length>0&&<><Text style={[st.secTitle,{marginTop:16}]}>REQUIRED TRAINING ({requiredTraining.length})</Text>
              {requiredTraining.map((t:any,i:number)=>(<TouchableOpacity key={i} style={st.row} onPress={()=>{setSelectedTraining(t);setLessonBlock(0);setQuizAnswers({});setActiveTab('training_lesson');}}>
                <BookOpen color={COLORS.moltenGold} size={16}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{t.title}</Text><Text style={st.sub}>{t.estimated_minutes} min</Text></View><ChevronRight color={COLORS.lightGray} size={16}/>
              </TouchableOpacity>))}</>}
          </View>}

          {/* SCHEDULE - real shifts */}
          {activeTab==='schedule'&&<View>
            <Text style={st.secTitle}>UPCOMING SHIFTS</Text>
            {upcomingShifts.length===0&&<Text style={st.sub}>No upcoming shifts scheduled.</Text>}
            {upcomingShifts.map((s:any,i:number)=>{const d=new Date(s.start_time);return(
              <View key={i} style={st.row}><Clock color={COLORS.electricBlue} size={16}/>
                <View style={{flex:1,marginLeft:10}}>
                  <Text style={st.rowText}>{d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</Text>
                  <Text style={st.sub}>{d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – {new Date(s.end_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · {s.role||'Staff'}</Text>
                </View></View>);})}
          </View>}

          {/* TRAINING - real modules */}
          {activeTab==='training'&&<View>
            <Text style={st.secTitle}>TRAINING MODULES</Text>
            {trainingModules?.map((t:any,i:number)=>{const bl=t.content_blocks??[];return(
              <TouchableOpacity key={i} style={st.row} onPress={()=>{if(bl.length>0){setSelectedTraining(t);setLessonBlock(0);setQuizAnswers({});setActiveTab('training_lesson');}}}>
                <BookOpen color={t.is_required?COLORS.moltenGold:COLORS.electricBlue} size={16}/>
                <View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{t.title}</Text>
                  <Text style={st.sub}>{t.estimated_minutes} min{bl.length>0?' · '+bl.length+' sections':''}</Text>
                  {t.is_required&&<View style={[st.tag,{backgroundColor:COLORS.alertRed}]}><Text style={st.tagText}>REQUIRED</Text></View>}
                </View><ChevronRight color={COLORS.lightGray} size={16}/>
              </TouchableOpacity>);})}

            <Text style={[st.secTitle,{marginTop:20}]}>SOPs & DOCUMENTS</Text>
            {liveSops?.map((sop:any,i:number)=>(<View key={i} style={st.row}>
              <FileText color={sop.category==='menu'?COLORS.moltenGold:COLORS.emeraldGreen} size={16}/>
              <View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>{sop.title}</Text><Text style={st.sub} numberOfLines={2}>{sop.content}</Text></View>
            </View>))}
          </View>}

          {/* MESSAGES - real channels */}
          {activeTab==='messages'&&<View>
            {!selectedChannel ? (<View>
              <Text style={st.secTitle}>CHANNELS</Text>
              {channels?.map((ch:any,i:number)=>(<TouchableOpacity key={i} style={st.row} onPress={()=>setSelectedChannel(ch)}>
                <MessageSquare color={COLORS.electricBlue} size={16}/><View style={{flex:1,marginLeft:10}}><Text style={st.rowText}>#{ch.name}</Text><Text style={st.sub}>{ch.type}</Text></View><ChevronRight color={COLORS.lightGray} size={16}/>
              </TouchableOpacity>))}
            </View>) : (<View>
              <TouchableOpacity style={{marginBottom:12}} onPress={()=>setSelectedChannel(null)}><Text style={{color:COLORS.electricBlue,fontSize:13}}>← Back to channels</Text></TouchableOpacity>
              <Text style={[st.secTitle,{marginBottom:8}]}>#{selectedChannel.name}</Text>
              {chatMessages?.map((m:any,i:number)=>(<View key={i} style={st.msgBubble}><Text style={st.msgBody}>{m.body}</Text><Text style={st.msgTime}>{new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text></View>))}
              {(!chatMessages||chatMessages.length===0)&&<Text style={st.sub}>No messages yet.</Text>}
              <View style={st.chatRow}><TextInput style={st.chatInput} placeholder="Message..." placeholderTextColor={COLORS.lightGray} value={chatInput} onChangeText={setChatInput}/><TouchableOpacity style={st.sendBtn} onPress={sendChatMessage}><Send color={COLORS.deepBlack} size={16}/></TouchableOpacity></View>
            </View>)}
          </View>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.deepBlack},
  safe:{flex:1},
  gate:{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32},
  gateTitle:{fontSize:24,fontWeight:'800',color:COLORS.alertRed,marginTop:24,letterSpacing:2},
  gateSub:{fontSize:14,color:COLORS.platinum,textAlign:'center',marginTop:12},
  gateBtn:{marginTop:32,backgroundColor:COLORS.electricBlue,paddingVertical:14,paddingHorizontal:32,borderRadius:12},
  gateBtnText:{fontSize:16,fontWeight:'700',color:COLORS.pureWhite},
  header:{flexDirection:'row',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.borderGray},
  title:{fontSize:20,fontWeight:'800',color:COLORS.pureWhite,letterSpacing:1},
  headerSub:{fontSize:12,color:COLORS.platinum,marginTop:2},
  closeBtn:{width:40,height:40,borderRadius:20,backgroundColor:COLORS.darkCharcoal,justifyContent:'center',alignItems:'center'},
  tabBar:{borderBottomWidth:1,borderBottomColor:COLORS.borderGray,maxHeight:52},
  tab:{paddingVertical:12,paddingHorizontal:16,borderRadius:20,backgroundColor:COLORS.darkCharcoal},
  tabActive:{backgroundColor:COLORS.electricBlue},
  tabText:{fontSize:13,fontWeight:'600',color:COLORS.lightGray},
  tabTextActive:{color:COLORS.pureWhite},
  secTitle:{fontSize:10,fontWeight:'700',color:COLORS.lightGray,letterSpacing:2,marginBottom:10},
  row:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.darkCharcoal,borderRadius:10,padding:14,marginBottom:6,borderWidth:1,borderColor:COLORS.borderGray},
  rowText:{fontSize:14,fontWeight:'600',color:COLORS.pureWhite},
  sub:{fontSize:11,color:COLORS.lightGray,marginTop:2},
  shiftCard:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.darkCharcoal,borderRadius:12,padding:16,borderWidth:1,borderColor:COLORS.electricBlue,borderLeftWidth:4,borderLeftColor:COLORS.electricBlue},
  tag:{borderRadius:4,paddingHorizontal:6,paddingVertical:2,marginTop:4,alignSelf:'flex-start'},
  tagText:{fontSize:8,fontWeight:'700',color:COLORS.pureWhite,letterSpacing:1},
  msgBubble:{backgroundColor:COLORS.darkCharcoal,borderRadius:12,padding:14,marginBottom:8,borderWidth:1,borderColor:COLORS.borderGray},
  msgBody:{fontSize:14,color:COLORS.pureWhite,lineHeight:20},
  msgTime:{fontSize:10,color:COLORS.lightGray,marginTop:4},
  chatRow:{flexDirection:'row',marginTop:12,gap:8},
  chatInput:{flex:1,backgroundColor:'#1a1a1a',borderRadius:20,paddingHorizontal:16,paddingVertical:10,color:COLORS.pureWhite,borderWidth:1,borderColor:COLORS.borderGray},
  sendBtn:{width:40,height:40,borderRadius:20,backgroundColor:COLORS.electricBlue,alignItems:'center',justifyContent:'center'},
  backHeader:{flexDirection:'row',alignItems:'center',padding:16,gap:12},
  backBtn:{width:36,height:36,borderRadius:18,backgroundColor:COLORS.darkCharcoal,alignItems:'center',justifyContent:'center'},
  backTitle:{fontSize:18,fontWeight:'800',color:COLORS.pureWhite,flex:1},
  progressBg:{height:4,backgroundColor:COLORS.darkCharcoal,marginHorizontal:16,borderRadius:2},
  progressFill:{height:4,backgroundColor:COLORS.electricBlue,borderRadius:2},
  lessonText:{fontSize:16,color:COLORS.pureWhite,lineHeight:26},
  lessonNav:{flexDirection:'row',justifyContent:'space-between',padding:16,borderTopWidth:1,borderTopColor:COLORS.borderGray},
  navBtn:{paddingHorizontal:20,paddingVertical:10,backgroundColor:COLORS.darkCharcoal,borderRadius:10,borderWidth:1,borderColor:COLORS.borderGray},
  navBtnText:{fontSize:14,fontWeight:'600',color:COLORS.pureWhite},
  actionBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,backgroundColor:COLORS.electricBlue,borderRadius:10,padding:14},
  actionBtnText:{fontSize:14,fontWeight:'700',color:COLORS.pureWhite},
});

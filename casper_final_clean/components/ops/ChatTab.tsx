import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { COLORS } from '@/constants/colors';
import { PillButton, SectionTitle } from './ui';

type Room = { id: string; location_id: string; name: string; type: string };
type Message = { id: string; room_id: string; user_id: string; body: string; created_at: string };

export default function ChatTab({
  activeLocationId,
}: {
  activeLocationId: string | null;
}) {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');

  const roomQuery = useQuery({
    queryKey: ['ops', 'chat_room', activeLocationId],
    enabled: !!activeLocationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('location_id', activeLocationId)
        .eq('type', 'location')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Room | null;
    },
  });

  const roomId = roomQuery.data?.id ?? null;

  const msgsQuery = useQuery({
    queryKey: ['ops', 'chat_messages', roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    refetchInterval: 2500,
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in');
      if (!roomId) throw new Error('Select a location');
      const payload = { room_id: roomId, user_id: userId, body: message.trim() };
      const { error } = await supabase.from('chat_messages').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setMessage('');
      await qc.invalidateQueries({ queryKey: ['ops', 'chat_messages', roomId] });
    },
  });

  const msgs = msgsQuery.data ?? [];

  if (!activeLocationId) {
    return (
      <View style={styles.center}>
        <SectionTitle title="Location Chat" subtitle="Select an Active Location at the top to chat with that team." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionTitle title="Location Chat" subtitle={roomQuery.data?.name ?? 'Team Chat'} />
      </View>

      <ScrollView style={styles.messages} contentContainerStyle={{ paddingBottom: 16 }}>
        {msgs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet. Start the thread.</Text>
          </View>
        ) : (
          msgs.map((m) => {
            const mine = userId === m.user_id;
            return (
              <View key={m.id} style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={styles.bubbleText}>{m.body}</Text>
                <Text style={styles.time}>{new Date(m.created_at).toLocaleTimeString()}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message the team..."
          placeholderTextColor={COLORS.silver}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => send.mutate()}
          disabled={send.isPending || !message.trim()}
          style={[styles.send, { opacity: send.isPending || !message.trim() ? 0.5 : 1 }]}
        >
          <Text style={styles.sendText}>{send.isPending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 14 },
  messages: { flex: 1, paddingHorizontal: 16, marginTop: 10 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.glassBorder },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: COLORS.moltenGold },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: COLORS.glass },
  bubbleText: { color: COLORS.obsidian, fontWeight: '800' },
  time: { marginTop: 6, fontSize: 10, color: COLORS.obsidian, opacity: 0.7, textAlign: 'right' },
  composer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, gap: 10, backgroundColor: COLORS.darkCharcoal },
  input: { flex: 1, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.pureWhite },
  send: { paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.electricBlue, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: COLORS.pureWhite, fontWeight: '900' },
  center: { flex: 1, padding: 16, justifyContent: 'center' },
  empty: { padding: 18, backgroundColor: COLORS.glass, borderColor: COLORS.glassBorder, borderWidth: 1, borderRadius: 16, marginTop: 20 },
  emptyText: { color: COLORS.platinum, fontWeight: '800' },
});

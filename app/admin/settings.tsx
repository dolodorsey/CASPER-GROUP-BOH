import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChefHat, MapPin, Users, Shield, LogOut } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useBrands, useLocations } from '@/hooks/useSupabaseData';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminSettings() {
  const { profile, signOut, allowedLocations, allowedBrands } = useAuth();
  const { data: brands } = useBrands();
  const { data: locations } = useLocations();

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>SETTINGS & ACCESS</Text>
            <Text style={styles.subtitle}>System configuration</Text>
          </View>

          {/* Current User */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CURRENT USER</Text>
            <View style={styles.userCard}>
              <View style={styles.userIconWrap}>
                <Shield color={COLORS.moltenGold} size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{profile?.full_name || 'Admin'}</Text>
                <Text style={styles.userRole}>{(profile?.role || 'admin').toUpperCase()}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <LogOut color={COLORS.alertRed} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Brands */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BRANDS ({brands?.length ?? 0})</Text>
            {brands?.map((b, i) => (
              <View key={i} style={styles.listRow}>
                <View style={[styles.dot, { backgroundColor: COLORS.moltenGold }]} />
                <Text style={styles.listName}>{b.name}</Text>
                <Text style={styles.listMeta}>{b.category || 'Food'}</Text>
              </View>
            ))}
          </View>

          {/* Locations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LOCATIONS ({locations?.length ?? 0})</Text>
            {locations?.map((l, i) => (
              <View key={i} style={styles.listRow}>
                <MapPin color={COLORS.electricBlue} size={14} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.listName}>{l.name}</Text>
                  <Text style={styles.listMeta}>{l.city}, {l.state}</Text>
                </View>
                <Text style={[styles.statusBadge, { backgroundColor: l.status === 'active' ? COLORS.emeraldGreen : COLORS.warning }]}>
                  {(l.status || 'active').toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          {/* System Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SYSTEM</Text>
            {[
              { label: 'Platform', value: 'Casper Control v1.0' },
              { label: 'Backend', value: 'Supabase (Live)' },
              { label: 'Auth', value: 'Email / Password' },
              { label: 'Access Level', value: (profile?.role || 'admin').toUpperCase() },
              { label: 'Locations Access', value: `${allowedLocations?.length ?? 0} locations` },
              { label: 'Brands Access', value: `${allowedBrands?.length ?? 0} brands` },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 2 },
  subtitle: { fontSize: 13, color: COLORS.lightGray, marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 2, marginBottom: 12 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray, gap: 12 },
  userIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.deepBlack, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.moltenGold },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.pureWhite },
  userRole: { fontSize: 11, color: COLORS.moltenGold, letterSpacing: 1.5, marginTop: 2 },
  logoutBtn: { padding: 10 },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkCharcoal, borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.borderGray, gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  listName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.pureWhite },
  listMeta: { fontSize: 11, color: COLORS.lightGray },
  statusBadge: { fontSize: 9, fontWeight: '800', color: COLORS.deepBlack, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden', letterSpacing: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  infoLabel: { fontSize: 13, color: COLORS.lightGray },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.pureWhite },
});

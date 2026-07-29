import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, KeyRound, LogOut, MapPin, ShieldCheck, UserRound } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function AccountScreen() {
  const router = useRouter();
  const { profile, allowedBrands, allowedLocations, activeBrandId, activeLocationId, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const initials = useMemo(() => {
    const source = profile?.full_name?.trim() || email || 'CG';
    return source.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }, [profile?.full_name, email]);

  const activeBrand = allowedBrands.find((brand) => brand.id === activeBrandId);
  const activeLocation = allowedLocations.find((location) => location.id === activeLocationId);

  const changePassword = async () => {
    if (newPassword.length < 8) {
      setMessage('Use at least 8 characters for the new password.');
      return;
    }
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setNewPassword('');
    setMessage('Password updated.');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={COLORS.pureWhite} size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.eyebrow}>SECURE WORKSPACE</Text>
            <Text style={styles.title}>Account & Access</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.identityCard}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{profile?.full_name || 'Casper team member'}</Text>
              <Text style={styles.email}>{email || 'Verified account'}</Text>
              <View style={styles.roleBadge}>
                <ShieldCheck color={COLORS.emeraldGreen} size={14} />
                <Text style={styles.roleText}>{profile?.role?.toUpperCase() || 'ROLE PENDING'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>CURRENT OPERATING SCOPE</Text>
          <View style={styles.scopeGrid}>
            <View style={styles.scopeCard}>
              <MapPin color={COLORS.electricBlue} size={20} />
              <Text style={styles.scopeLabel}>ACTIVE LOCATION</Text>
              <Text style={styles.scopeValue}>{activeLocation?.name || 'Not assigned'}</Text>
              <Text style={styles.scopeMeta}>{allowedLocations.length} accessible location{allowedLocations.length === 1 ? '' : 's'}</Text>
            </View>
            <View style={styles.scopeCard}>
              <Building2 color={COLORS.moltenGold} size={20} />
              <Text style={styles.scopeLabel}>ACTIVE BRAND</Text>
              <Text style={styles.scopeValue}>{activeBrand?.name || 'Not assigned'}</Text>
              <Text style={styles.scopeMeta}>{allowedBrands.length} accessible brand{allowedBrands.length === 1 ? '' : 's'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>SECURITY</Text>
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <KeyRound color={COLORS.moltenGold} size={20} />
              <View>
                <Text style={styles.securityTitle}>Change password</Text>
                <Text style={styles.securityCopy}>Updates the password for this verified Casper Control account.</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={COLORS.mutedGray}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            {message && <Text style={styles.message}>{message}</Text>}
            <TouchableOpacity style={styles.primaryButton} onPress={changePassword} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.deepBlack} /> : <Text style={styles.primaryButtonText}>Update password</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.noteCard}>
            <UserRound color={COLORS.platinum} size={18} />
            <Text style={styles.noteText}>Role, brand, and location assignments are controlled by Casper administrators. This screen does not allow users to elevate their own access.</Text>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <LogOut color={COLORS.alertRed} size={18} />
            <Text style={styles.signOutText}>Sign out of Casper Control</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.darkCharcoal },
  eyebrow: { color: COLORS.moltenGold, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { color: COLORS.pureWhite, fontSize: 22, fontWeight: '800', marginTop: 3 },
  content: { width: '100%', maxWidth: 860, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 22, backgroundColor: COLORS.darkCharcoal, borderRadius: 18, borderWidth: 1, borderColor: COLORS.borderGray },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.moltenGold },
  avatarText: { color: COLORS.deepBlack, fontSize: 24, fontWeight: '900' },
  identityCopy: { flex: 1 },
  name: { color: COLORS.pureWhite, fontSize: 22, fontWeight: '800' },
  email: { color: COLORS.lightGray, fontSize: 13, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(0, 200, 120, 0.1)' },
  roleText: { color: COLORS.emeraldGreen, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  sectionTitle: { color: COLORS.platinum, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 28, marginBottom: 12 },
  scopeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  scopeCard: { flex: 1, minWidth: 250, padding: 18, backgroundColor: COLORS.darkCharcoal, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderGray },
  scopeLabel: { color: COLORS.lightGray, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 14 },
  scopeValue: { color: COLORS.pureWhite, fontSize: 17, fontWeight: '700', marginTop: 5 },
  scopeMeta: { color: COLORS.lightGray, fontSize: 11, marginTop: 6 },
  securityCard: { padding: 20, backgroundColor: COLORS.darkCharcoal, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderGray },
  securityHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  securityTitle: { color: COLORS.pureWhite, fontSize: 16, fontWeight: '700' },
  securityCopy: { maxWidth: 580, color: COLORS.lightGray, fontSize: 12, lineHeight: 18, marginTop: 3 },
  input: { marginTop: 18, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.pureWhite, backgroundColor: COLORS.deepBlack, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderGray },
  message: { color: COLORS.platinum, fontSize: 12, marginTop: 10 },
  primaryButton: { minHeight: 46, marginTop: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.moltenGold, borderRadius: 10 },
  primaryButtonText: { color: COLORS.deepBlack, fontSize: 13, fontWeight: '800' },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 },
  noteText: { flex: 1, color: COLORS.lightGray, fontSize: 12, lineHeight: 18 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.alertRed },
  signOutText: { color: COLORS.alertRed, fontSize: 13, fontWeight: '700' },
});

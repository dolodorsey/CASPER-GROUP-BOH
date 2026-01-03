import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { portal } = useLocalSearchParams<{ portal?: string }>();
  const requestedPortal = useMemo(() => (portal ?? 'employee').toString(), [portal]);

  const { loading, profile, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const onLogin = async () => {
    setErr(null);
    const res = await signIn(email.trim(), password);
    if (!res.ok) setErr(res.error ?? 'Login failed');
  };

  // If logged in, route to correct portal based on role
  if (profile?.role) {
    const target = profile.role === 'admin' ? 'admin' : profile.role === 'partner' ? 'partner' : 'employee';
    if (target !== requestedPortal) {
      // route to the correct one
      setTimeout(() => router.replace(`/${target}` as any), 50);
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.muted}>Redirecting to your portal…</Text>
          </View>
        </SafeAreaView>
      );
    }
    setTimeout(() => router.replace(`/${requestedPortal}` as any), 50);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Entering portal…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.background, COLORS.card]} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Casper Control Center</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@company.com"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />
            {err ? <Text style={styles.error}>{err}</Text> : null}
            <TouchableOpacity style={styles.btn} onPress={onLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
            </TouchableOpacity>

            <Text style={styles.hint}>
              Portal requested: <Text style={styles.hintBold}>{requestedPortal}</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.replace('/' as any)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  label: { color: COLORS.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  btn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, marginTop: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
  error: { color: COLORS.error, marginTop: 10 },
  hint: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 12 },
  hintBold: { color: COLORS.text, fontWeight: '700' },
  back: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 18 },
  muted: { color: COLORS.textSecondary },
});

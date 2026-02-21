import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { Mail, Lock, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin() {
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data?.session) {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>CASPER</Text>
            <Text style={styles.logoSubtitle}>CONTROL™</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your portal</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail color={COLORS.lightGray} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.mutedGray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color={COLORS.lightGray} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.mutedGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              <LinearGradient colors={[COLORS.moltenGold, COLORS.darkGold]} style={styles.loginButtonGradient}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.deepBlack} />
                ) : (
                  <>
                    <LogIn color={COLORS.deepBlack} size={20} />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.terms}>
              Casper Group Enterprise • Authorized Personnel Only
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 40, fontWeight: '900', color: COLORS.moltenGold, letterSpacing: 8 },
  logoSubtitle: { fontSize: 14, color: COLORS.platinum, letterSpacing: 6, marginTop: 4 },
  formContainer: { backgroundColor: COLORS.darkCharcoal, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: COLORS.borderGray },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.pureWhite, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.lightGray, textAlign: 'center', marginBottom: 24 },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.alertRed },
  errorText: { fontSize: 13, color: COLORS.alertRed, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.deepBlack, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.borderGray, gap: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.pureWhite },
  loginButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  loginButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 12 },
  buttonDisabled: { opacity: 0.7 },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.deepBlack },
  terms: { fontSize: 11, color: COLORS.lightGray, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});

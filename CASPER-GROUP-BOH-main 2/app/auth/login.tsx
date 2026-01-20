import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { Chrome } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[Auth] Starting Google OAuth flow...');

      const redirectTo = Linking.createURL('/auth/callback');
      console.log('[Auth] Redirect URL:', redirectTo);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError) {
        console.error('[Auth] OAuth error:', oauthError);
        setError(oauthError.message);
        return;
      }

      if (!data?.url) {
        console.error('[Auth] No OAuth URL returned');
        setError('Failed to get authentication URL');
        return;
      }

      console.log('[Auth] Opening browser session...');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log('[Auth] Browser result:', result.type);

      if (result.type === 'success' && result.url) {
        console.log('[Auth] Exchanging code for session...');
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
        
        if (exchangeError) {
          console.error('[Auth] Exchange error:', exchangeError);
          setError(exchangeError.message);
          return;
        }

        if (sessionData?.session) {
          console.log('[Auth] Session created successfully');
          router.replace('/');
        }
      } else if (result.type === 'cancel') {
        console.log('[Auth] User cancelled authentication');
      }
    } catch (err) {
      console.error('[Auth] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepBlack, COLORS.darkCharcoal]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
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

            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.deepBlack} />
              ) : (
                <>
                  <Chrome color={COLORS.deepBlack} size={20} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.terms}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.moltenGold,
    letterSpacing: 8,
  },
  logoSubtitle: {
    fontSize: 14,
    color: COLORS.platinum,
    letterSpacing: 6,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.pureWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.alertRed,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.alertRed,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.pureWhite,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepBlack,
  },
  terms: {
    fontSize: 11,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});

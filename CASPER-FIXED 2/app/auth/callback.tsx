import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async (url: string) => {
      console.log('[AuthCallback] Processing URL:', url);
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          console.error('[AuthCallback] Exchange error:', error);
          router.replace('/login' as any);
          return;
        }
        if (data?.session) {
          console.log('[AuthCallback] Session created, redirecting to home');
          router.replace('/');
        }
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        router.replace('/login' as any);
      }
    };

    const initialUrl = Linking.createURL('/auth/callback');
    const currentUrl = params.code ? `${initialUrl}?code=${params.code}` : null;
    
    if (currentUrl && params.code) {
      console.log('[AuthCallback] Processing initial deep link');
      handleAuthCallback(currentUrl);
    }

    const subscription = Linking.addEventListener('url', (event) => {
      console.log('[AuthCallback] URL event received:', event.url);
      handleAuthCallback(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [params.code]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.moltenGold} />
      <Text style={styles.text}>Authenticating...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.platinum,
  },
});

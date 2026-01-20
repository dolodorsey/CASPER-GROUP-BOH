import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  useEffect(() => {
    let isMounted = true;

    const handleUrl = async (url?: string | null) => {
      if (!url || !isMounted) return;
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        console.error('[Auth] callback exchange error:', error);
        return;
      }
      if (data?.session) {
        router.replace('/');
      }
    };

    // If the screen is opened directly via deep link, we need to process the initial URL.
    Linking.getInitialURL().then(handleUrl).catch(() => {});

    // Also listen for subsequent url events.
    const subscription = Linking.addEventListener('url', async (event) => {
      await handleUrl(event.url);
    });
    
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return null;
}

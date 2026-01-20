import { View, Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  async function handleLogin() {
    const redirectTo = Linking.createURL('/auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('[Auth] OAuth start error:', error);
      return;
    }

    if (!data?.url) {
      console.error('[Auth] No OAuth URL returned from Supabase');
      return;
    }

    // Opens the system browser (safe for iOS/Android/Web) and returns a redirect URL on success
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success' && (result as any).url) {
      const callbackUrl = (result as any).url as string;
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(callbackUrl);
      if (exchangeError) {
        console.error('[Auth] Session exchange error:', exchangeError);
        return;
      }
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Sign in with Google" onPress={handleLogin} />
    </View>
  );
}

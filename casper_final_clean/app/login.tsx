import React, { useMemo, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 5 && password.length >= 6, [email, password]);

  const onSignIn = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      await refreshProfile();
      router.dismiss();
    } catch (e: any) {
      Alert.alert("Sign in failed", e?.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSendMagicLink = async () => {
    if (email.trim().length < 6) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo:
            Platform.OS === "web" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      Alert.alert("Check your email", "Magic link sent.");
    } catch (e: any) {
      Alert.alert("Could not send link", e?.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.sub}>Use email/password (recommended) or magic link.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@company.com"
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

        <TouchableOpacity
          onPress={onSignIn}
          disabled={!canSubmit || isLoading}
          style={[styles.primaryBtn, (!canSubmit || isLoading) && { opacity: 0.6 }]}
        >
          <Text style={styles.primaryBtnText}>{isLoading ? "Working..." : "Sign in"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSendMagicLink} disabled={isLoading} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Send magic link</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.dismiss()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "700", marginBottom: 6 },
  sub: { color: COLORS.textSecondary, marginBottom: 16 },
  label: { color: COLORS.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#000", fontWeight: "800" },
  secondaryBtn: { marginTop: 10, paddingVertical: 12, alignItems: "center" },
  secondaryBtnText: { color: COLORS.text, fontWeight: "700" },
  closeBtn: { marginTop: 12, paddingVertical: 12, alignItems: "center" },
  closeBtnText: { color: COLORS.textSecondary, fontWeight: "700" },
});

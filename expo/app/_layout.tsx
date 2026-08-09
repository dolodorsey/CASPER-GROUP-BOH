import { Redirect, Stack, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CasperProvider } from "@/providers/CasperProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { COLORS } from "@/constants/colors";

const releaseSha = process.env.EXPO_PUBLIC_BUILD_SHA ?? "local";

function SessionGate() {
  const segments = useSegments();
  const { userId, profile, isBooting, signOut } = useAuth();
  const isAuthRoute = segments[0] === "auth" || segments[0] === "login";

  if (isBooting) {
    return (
      <View style={styles.gate}>
        <ActivityIndicator size="large" color={COLORS.moltenGold} />
        <Text style={styles.gateEyebrow}>CASPER CONTROL</Text>
        <Text style={styles.gateCopy}>Verifying secure workspace access…</Text>
      </View>
    );
  }

  if (!userId && !isAuthRoute) {
    return <Redirect href="/auth/login" />;
  }

  if (userId && !profile && !isAuthRoute) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateEyebrow}>ACCESS NOT ASSIGNED</Text>
        <Text style={styles.gateTitle}>Your account is valid, but it has no Casper Control role.</Text>
        <Text style={styles.gateCopy}>Ask an administrator to assign a portal role, brand, and location before continuing.</Text>
        <Text style={styles.signOut} onPress={signOut}>Sign out</Text>
      </View>
    );
  }

  if (userId && profile && isAuthRoute) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <View
        testID={`casper-boh-release-${releaseSha}`}
        style={styles.releaseStamp}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <AuthProvider>
        <CasperProvider>
          <SessionGate />
        </CasperProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  releaseStamp: { display: "none" },
  gate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: COLORS.deepBlack,
  },
  gateEyebrow: {
    marginTop: 18,
    color: COLORS.moltenGold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
  },
  gateTitle: {
    maxWidth: 520,
    marginTop: 14,
    color: COLORS.pureWhite,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    textAlign: "center",
  },
  gateCopy: {
    maxWidth: 520,
    marginTop: 12,
    color: COLORS.lightGray,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  signOut: {
    marginTop: 24,
    color: COLORS.electricBlue,
    fontSize: 14,
    fontWeight: "700",
  },
});

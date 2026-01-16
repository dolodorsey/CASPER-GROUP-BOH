import { Stack } from "expo-router";
import { CasperProvider } from "@/providers/CasperProvider";

export default function RootLayout() {
  return (
    <CasperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(brands)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="auth" />
      </Stack>
    </CasperProvider>
  );
}

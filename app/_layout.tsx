import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CasperProvider } from "@/providers/CasperProvider";
import { trpc, trpcClient } from "@/lib/trpc";

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(brands)" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CasperProvider>
          <RootLayoutNav />
        </CasperProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

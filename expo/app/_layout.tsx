import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CasperProvider } from "@/providers/CasperProvider";
import { AuthProvider } from "@/providers/AuthProvider";

function RootLayoutNav() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CasperProvider>
          <RootLayoutNav />
        </CasperProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

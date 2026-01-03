import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CasperProvider } from "@/providers/CasperProvider";
import { AdminProvider } from "@/providers/AdminProvider";


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="admin" options={{ presentation: "modal", animation: "fade" }} />
      <Stack.Screen name="employee" options={{ presentation: "modal", animation: "fade" }} />
      <Stack.Screen name="partner" options={{ presentation: "modal", animation: "fade" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CasperProvider>
        <AdminProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AdminProvider>
      </CasperProvider>
    </QueryClientProvider>
  );
}
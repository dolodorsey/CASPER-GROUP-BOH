import { Stack } from "expo-router";
import { CasperProvider } from "@/providers/CasperProvider";

export default function RootLayout() {
  return (
    <CasperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CasperProvider>
  );
}

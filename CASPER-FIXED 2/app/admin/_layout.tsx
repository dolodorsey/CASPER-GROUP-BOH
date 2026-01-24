import { Stack } from "expo-router";
import { AdminProvider } from "@/providers/AdminProvider";
import { AccessGate } from "@/components/AccessGate";

export default function AdminLayout() {
  return (
    <AccessGate allow={["admin"]}>
      <AdminProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminProvider>
    </AccessGate>
  );
}

import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

export function AccessGate({ allow, children }: { allow: string[]; children: React.ReactNode }) {
  const router = useRouter();
  const { isBooting, profile } = useAuth();

  useEffect(() => {
    if (isBooting) return;

    if (!profile) {
      router.replace("/auth/login" as any);
    } else if (!allow.includes(profile.role)) {
      router.replace(`/${profile.role}` as any);
    }
  }, [isBooting, profile]);

  if (isBooting) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!profile) return null;
  if (!allow.includes(profile.role)) return null;

  return <>{children}</>;
}

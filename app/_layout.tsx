import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Slot, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        // HARD TIMEOUT so it can't hang forever
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Boot timeout (Supabase session check stalled)")), 6000)
        );

        const sessionPromise = supabase.auth.getSession();
        const result: any = await Promise.race([sessionPromise, timeout]);

        if (cancelled) return;

        const session = result?.data?.session ?? null;

        // Route decisions
        if (!session) router.replace("/login");
        else router.replace("/");

        setReady(true);
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.message ?? "Unknown boot error");
        setReady(true); // allow UI to show error screen
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Loading…</Text>
        <Text style={{ marginTop: 8, opacity: 0.7 }}>Booting Casper Control</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Boot Error</Text>
        <Text style={{ marginTop: 10, opacity: 0.85, textAlign: "center" }}>{err}</Text>

        <Pressable
          onPress={() => router.replace("/login")}
          style={{ marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: "black" }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return <Slot />;
}

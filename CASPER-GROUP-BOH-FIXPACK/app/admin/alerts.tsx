import React from 'react';
import { View, Text } from 'react-native';

export default function AdminAlerts() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>Alerts & Incidents</Text>
      <Text style={{ marginTop: 8, opacity: 0.75 }}>
        Next: render alerts + incidents from Supabase.
      </Text>
    </View>
  );
}

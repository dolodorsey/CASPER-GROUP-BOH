import React from 'react';
import { View, Text } from 'react-native';

export default function AdminReports() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>Reports</Text>
      <Text style={{ marginTop: 8, opacity: 0.75 }}>
        Next: KPIs, revenue snapshots, labor, waste, ticket volume.
      </Text>
    </View>
  );
}

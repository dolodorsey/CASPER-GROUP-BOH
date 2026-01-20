import React from 'react';
import { View, Text } from 'react-native';

export default function AdminSettings() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '900' }}>Settings</Text>
      <Text style={{ marginTop: 8, opacity: 0.75 }}>
        Next: manage brands, locations, roles, and access.
      </Text>
    </View>
  );
}

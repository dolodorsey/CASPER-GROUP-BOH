import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PillButton({
  label,
  onPress,
  kind = 'default',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  kind?: 'default' | 'primary' | 'danger' | 'success';
  disabled?: boolean;
}) {
  const bg =
    kind === 'primary'
      ? COLORS.moltenGold
      : kind === 'danger'
      ? COLORS.alertRed
      : kind === 'success'
      ? COLORS.electricBlue
      : COLORS.glass;
  const fg = kind === 'primary' ? COLORS.obsidian : COLORS.pureWhite;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pill,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.silver}
        multiline={multiline}
        style={[styles.input, multiline ? { height: 90, textAlignVertical: 'top' } : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: COLORS.pureWhite, fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { color: COLORS.platinum, fontSize: 12, marginTop: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: COLORS.glassBorder },
  pillText: { fontSize: 12, fontWeight: '800' },
  label: { color: COLORS.platinum, fontSize: 12, marginBottom: 6, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.pureWhite,
    fontSize: 14,
  },
});

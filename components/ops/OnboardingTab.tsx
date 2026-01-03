import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingTabProps {
  color: string;
}

export default function OnboardingTab({ color }: OnboardingTabProps) {
  return <Ionicons name="person-add" size={28} color={color} />;
}

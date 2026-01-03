import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface NeedsTabProps {
  color: string;
}

export default function NeedsTab({ color }: NeedsTabProps) {
  return <Ionicons name="list" size={28} color={color} />;
}

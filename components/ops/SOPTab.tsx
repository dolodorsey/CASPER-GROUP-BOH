import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SOPTabProps {
  color: string;
}

export default function SOPTab({ color }: SOPTabProps) {
  return <Ionicons name="document-text" size={28} color={color} />;
}

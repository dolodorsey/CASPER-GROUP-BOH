import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';

// Blueprint Architecture: Design System & Component Library
// Manages architectural components, design patterns, and system blueprints

interface Blueprint {
  id: string;
  name: string;
  type: 'component' | 'pattern' | 'system';
  status: 'active' | 'draft' | 'deprecated';
  version: string;
  lastModified: string;
}

export default function BlueprintArchitectureScreen() {
  const [totalBlueprints] = useState({
    components: 48,
    patterns: 23,
    systems: 12,
    activeProjects: 7,
  });

  const [blueprints] = useState<Blueprint[]>([
    { id: '1', name: 'Navigation Component', type: 'component', status: 'active', version: '2.1.0', lastModified: '2025-01-15' },
    { id: '2', name: 'Authentication Pattern', type: 'pattern', status: 'active', version: '1.5.0', lastModified: '2025-01-14' },
    { id: '3', name: 'Dashboard Layout System', type: 'system', status: 'active', version: '3.0.0', lastModified: '2025-01-13' },
    { id: '4', name: 'Form Validation Component', type: 'component', status: 'draft', version: '0.8.0', lastModified: '2025-01-12' },
    { id: '5', name: 'API Integration Pattern', type: 'pattern', status: 'active', version: '2.3.0', lastModified: '2025-01-11' },
    { id: '6', name: 'Legacy Modal Component', type: 'component', status: 'deprecated', version: '1.0.0', lastModified: '2024-12-20' },
  ]);

  const GoldBorderContainer = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.goldBorder}>
      {children}
    </View>
  );

  const renderBlueprint = ({ item }: { item: Blueprint }) => (
    <View style={styles.blueprintCard}>
      <View style={styles.blueprintHeader}>
        <Text style={styles.blueprintName}>{item.name}</Text>
        <View style={[styles.statusBadge, 
          item.status === 'active' ? styles.statusActive : 
          item.status === 'draft' ? styles.statusDraft : styles.statusDeprecated]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.blueprintDetails}>
        <Text style={styles.detailText}>Type: {item.type}</Text>
        <Text style={styles.detailText}>Version: {item.version}</Text>
        <Text style={styles.detailText}>Modified: {item.lastModified}</Text>
      </View>
    </View>
  );

  return (
    <GoldBorderContainer>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.highContrastImageArea}>
            <Ionicons name="construct-outline" size={64} color={COLORS.white} />
          </View>
          <Text style={styles.brandTitle}>Blueprint Architecture</Text>
          <Text style={styles.brandSubtitle}>Design System & Component Library</Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalBlueprints.components}</Text>
            <Text style={styles.metricLabel}>Components</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalBlueprints.patterns}</Text>
            <Text style={styles.metricLabel}>Patterns</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalBlueprints.systems}</Text>
            <Text style={styles.metricLabel}>Systems</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalBlueprints.activeProjects}</Text>
            <Text style={styles.metricLabel}>Projects</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blueprint Library</Text>
          <FlatList
            data={blueprints}
            renderItem={renderBlueprint}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.buttonText}>Create New Blueprint</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Export Documentation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GoldBorderContainer>
  );
}

const styles = StyleSheet.create({
  goldBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: COLORS.accent,
    borderRadius: 12,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  highContrastImageArea: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  metricCard: {
    width: '22%',
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  blueprintCard: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  blueprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blueprintName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#10b981',
  },
  statusDraft: {
    backgroundColor: '#f59e0b',
  },
  statusDeprecated: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  blueprintDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 30,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

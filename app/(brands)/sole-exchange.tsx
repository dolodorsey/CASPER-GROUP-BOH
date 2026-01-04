import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

// Sole Exchange: AF1 Drive Dashboard
// Tracks 50/50 split: Domestic vs. Africa

export default function SoleExchangeScreen() {
  const [driveData] = useState({
    totalPairs: 1000,
    domesticPairs: 500,
    africaPairs: 500,
    lastUpdated: new Date().toLocaleDateString(),
  });

  const domesticPercentage = (driveData.domesticPairs / driveData.totalPairs) * 100;
  const africaPercentage = (driveData.africaPairs / driveData.totalPairs) * 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sole Exchange</Text>
        <Text style={styles.headerSubtitle}>AF1 Drive: 50/50 Initiative</Text>
      </View>

      {/* Gold Border Quote Section */}
      <View style={styles.quoteContainer}>
        <View style={styles.goldBorder}>
          <Text style={styles.quoteText}>
            "Every pair tells a story. Half stay home, half change lives across the ocean."
          </Text>
          <Text style={styles.quoteAuthor}>- The Sole Exchange Mission</Text>
        </View>
      </View>

      {/* Total Counter */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total AF1s Collected</Text>
        <Text style={styles.totalNumber}>{driveData.totalPairs}</Text>
        <Text style={styles.lastUpdated}>Last Updated: {driveData.lastUpdated}</Text>
      </View>

      {/* 50/50 Split Display */}
      <View style={styles.splitSection}>
        <Text style={styles.sectionTitle}>Distribution Split</Text>
        
        {/* Domestic */}
        <View style={styles.splitCard}>
          <View style={styles.splitHeader}>
            <Ionicons name="home" size={32} color={COLORS.primary} />
            <Text style={styles.splitTitle}>Domestic USA</Text>
          </View>
          <View style={styles.splitStats}>
            <Text style={styles.splitNumber}>{driveData.domesticPairs}</Text>
            <Text style={styles.splitLabel}>pairs</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${domesticPercentage}%`, backgroundColor: COLORS.primary }]} />
          </View>
          <Text style={styles.percentageText}>{domesticPercentage.toFixed(1)}%</Text>
          <View style={styles.goldBorder}>
            <Text style={styles.impactText}>
              Supporting homeless communities and youth programs across America
            </Text>
          </View>
        </View>

        {/* Africa */}
        <View style={styles.splitCard}>
          <View style={styles.splitHeader}>
            <Ionicons name="earth" size={32} color={COLORS.success} />
            <Text style={styles.splitTitle}>Africa</Text>
          </View>
          <View style={styles.splitStats}>
            <Text style={styles.splitNumber}>{driveData.africaPairs}</Text>
            <Text style={styles.splitLabel}>pairs</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${africaPercentage}%`, backgroundColor: COLORS.success }]} />
          </View>
          <Text style={styles.percentageText}>{africaPercentage.toFixed(1)}%</Text>
          <View style={styles.goldBorder}>
            <Text style={styles.impactText}>
              Empowering communities in Kenya, Ghana, and South Africa
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.buttonText}>Log New Donation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>View Full Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  headerSubtitle: {
    fontSize: 18,
    color: COLORS.gray,
    marginTop: 5,
  },
  quoteContainer: {
    padding: 20,
  },
  goldBorder: {
    borderWidth: 3,
    borderColor: COLORS.secondary, // Gold color
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  totalSection: {
    padding: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  totalNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: COLORS.white,
    marginVertical: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  splitSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  splitCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // High contrast shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  splitTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  splitStats: {
    alignItems: 'center',
    marginVertical: 20,
  },
  splitNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  splitLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 15,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 15,
  },
  impactText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

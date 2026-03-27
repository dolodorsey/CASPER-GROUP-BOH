import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Pinky Promise ATL: Philanthropic Event Tracker
// Manages community events, fundraisers, and impact metrics

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  fundsRaised: number;
  status: 'upcoming' | 'active' | 'completed';
  impactArea: string;
}

export default function PinkyPromiseScreen() {
  const [totalImpact] = useState({
    totalEvents: 24,
    totalAttendees: 3420,
    totalFundsRaised: 127500,
    communitiesServed: 12,
  });

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Youth Empowerment Gala',
      date: '2026-02-15',
      location: 'Atlanta, GA',
      attendees: 250,
      fundsRaised: 25000,
      status: 'upcoming',
      impactArea: 'Youth Education',
    },
    {
      id: '2',
      title: 'Community Care Drive',
      date: '2026-01-28',
      location: 'Decatur, GA',
      attendees: 180,
      fundsRaised: 12500,
      status: 'active',
      impactArea: 'Family Support',
    },
    {
      id: '3',
      title: 'Winter Warmth Campaign',
      date: '2025-12-20',
      location: 'Atlanta, GA',
      attendees: 320,
      fundsRaised: 18000,
      status: 'completed',
      impactArea: 'Homeless Outreach',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return COLORS.info;
      case 'active': return COLORS.success;
      case 'completed': return COLORS.gray;
      default: return COLORS.gray;
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventLocation}>
            <Ionicons name="location" size={14} color={COLORS.gray} /> {item.location}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.goldBorder}>
        <Text style={styles.impactArea}>{item.impactArea}</Text>
      </View>

      <View style={styles.eventStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>{item.date}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>{item.attendees} attendees</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cash" size={20} color={COLORS.success} />
          <Text style={styles.statLabel}>${item.fundsRaised.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pinky Promise ATL</Text>
        <Text style={styles.headerSubtitle}>Philanthropic Impact Tracker</Text>
      </View>

      {/* Gold Border Mission Statement */}
      <View style={styles.missionContainer}>
        <View style={styles.goldBorder}>
          <Text style={styles.missionText}>
            &quot;A promise kept is a life changed. Every event, every dollar, every volunteer hour creates ripples of hope in our community.&quot;
          </Text>
          <Text style={styles.missionAuthor}>- Pinky Promise ATL Mission</Text>
        </View>
      </View>

      {/* Impact Dashboard */}
      <View style={styles.impactDashboard}>
        <Text style={styles.sectionTitle}>Overall Impact</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{totalImpact.totalEvents}</Text>
            <Text style={styles.impactLabel}>Total Events</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{totalImpact.totalAttendees.toLocaleString()}</Text>
            <Text style={styles.impactLabel}>Attendees</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>${(totalImpact.totalFundsRaised / 1000).toFixed(0)}K</Text>
            <Text style={styles.impactLabel}>Funds Raised</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{totalImpact.communitiesServed}</Text>
            <Text style={styles.impactLabel}>Communities</Text>
          </View>
        </View>
      </View>

      {/* Events List */}
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Recent & Upcoming Events</Text>
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.buttonText}>Create New Event</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="document-text" size={24} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Download Impact Report</Text>
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
  missionContainer: {
    padding: 20,
  },
  goldBorder: {
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: 15,
    backgroundColor: COLORS.white,
  },
  missionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  missionAuthor: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  impactDashboard: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '48%',
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    // High contrast shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  impactNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  impactLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
    textAlign: 'center',
  },
  eventsSection: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  impactArea: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 5,
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

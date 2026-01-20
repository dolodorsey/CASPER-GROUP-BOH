import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function SupportScreen() {
  const supportOptions = [
    {
      icon: 'call-outline',
      title: 'Call Support',
      description: '24/7 Emergency Support',
      action: 'tel:+18005551234',
    },
    {
      icon: 'mail-outline',
      title: 'Email Us',
      description: 'support@caspercontrol.com',
      action: 'mailto:support@caspercontrol.com',
    },
    {
      icon: 'chatbubble-outline',
      title: 'Live Chat',
      description: 'Chat with our team',
      action: null,
    },
    {
      icon: 'document-text-outline',
      title: 'Documentation',
      description: 'User guides and tutorials',
      action: null,
    },
  ];

  const handlePress = (action: string | null) => {
    if (action) {
      Linking.openURL(action);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support & Help</Text>
        <Text style={styles.headerSubtitle}>We&apos;re here to help 24/7</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.supportItem}
            onPress={() => handlePress(option.action)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={option.icon as any} size={28} color={COLORS.primary} />
            </View>
            <View style={styles.supportInfo}>
              <Text style={styles.supportTitle}>{option.title}</Text>
              <Text style={styles.supportDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQs</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I add a new property?</Text>
          <Text style={styles.faqAnswer}>
            Go to the Dashboard and tap the &quot;Add Property&quot; button. Follow the guided setup process.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I reset my password?</Text>
          <Text style={styles.faqAnswer}>
            Go to Settings {'->'} Account {'->'} Security and tap &quot;Change Password&quot;.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What are system status alerts?</Text>
          <Text style={styles.faqAnswer}>
            System alerts notify you of important events at your properties, such as maintenance needs or security events.
          </Text>
        </View>
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
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  supportDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});

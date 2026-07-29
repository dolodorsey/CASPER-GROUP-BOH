import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BellRing, BookOpen, KeyRound, MessageSquareWarning } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function SupportScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const incidentRoute = profile?.role === 'admin' ? '/admin' : '/employee';

  const actions = [
    {
      title: 'Find an operating procedure',
      copy: 'Open the live SOP library, choose a brand, and use section search to find the current approved procedure.',
      icon: BookOpen,
      color: COLORS.moltenGold,
      action: () => router.push('/sops'),
      label: 'Open SOP library',
    },
    {
      title: 'Review alerts and incidents',
      copy: 'Use the live operations feed for active alerts. Administrators can acknowledge incidents and apply approved playbooks.',
      icon: BellRing,
      color: COLORS.alertRed,
      action: () => router.push(incidentRoute as any),
      label: 'Open operations',
    },
    {
      title: 'Resolve account access',
      copy: 'Change your password or confirm your assigned role, brands, and locations. Access changes require an administrator.',
      icon: KeyRound,
      color: COLORS.electricBlue,
      action: () => router.push('/account'),
      label: 'Open account controls',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={COLORS.pureWhite} size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.eyebrow}>OPERATING HELP</Text>
            <Text style={styles.title}>Support Center</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.intro}>
            <MessageSquareWarning color={COLORS.moltenGold} size={30} />
            <Text style={styles.introTitle}>Start with the system of record.</Text>
            <Text style={styles.introCopy}>Casper Control routes support through current procedures, live alerts, and verified account assignments. No unverified hotline or response-time promise is displayed here.</Text>
          </View>

          {actions.map(({ title, copy, icon: Icon, color, action, label }) => (
            <View key={title} style={styles.card}>
              <View style={[styles.iconBox, { borderColor: color }]}>
                <Icon color={color} size={22} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardBody}>{copy}</Text>
                <TouchableOpacity style={styles.action} onPress={action}>
                  <Text style={[styles.actionText, { color }]}>{label} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.escalation}>
            <Text style={styles.escalationLabel}>WHEN AN ISSUE IS URGENT</Text>
            <Text style={styles.escalationText}>For safety, security, food-safety, or active operating incidents, follow the location’s published escalation SOP and create an incident in Casper Control. For immediate danger, contact local emergency services.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: COLORS.borderGray },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.darkCharcoal },
  eyebrow: { color: COLORS.moltenGold, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { color: COLORS.pureWhite, fontSize: 22, fontWeight: '800', marginTop: 3 },
  content: { width: '100%', maxWidth: 860, alignSelf: 'center', padding: 20, paddingBottom: 48, gap: 12 },
  intro: { padding: 24, backgroundColor: COLORS.darkCharcoal, borderRadius: 18, borderWidth: 1, borderColor: COLORS.borderGray },
  introTitle: { color: COLORS.pureWhite, fontSize: 22, fontWeight: '800', marginTop: 16 },
  introCopy: { color: COLORS.lightGray, fontSize: 13, lineHeight: 21, marginTop: 8 },
  card: { flexDirection: 'row', gap: 16, padding: 20, backgroundColor: COLORS.darkCharcoal, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderGray },
  iconBox: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardCopy: { flex: 1 },
  cardTitle: { color: COLORS.pureWhite, fontSize: 16, fontWeight: '700' },
  cardBody: { color: COLORS.lightGray, fontSize: 12, lineHeight: 19, marginTop: 5 },
  action: { alignSelf: 'flex-start', marginTop: 12 },
  actionText: { fontSize: 12, fontWeight: '800' },
  escalation: { marginTop: 8, padding: 18, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.35)' },
  escalationLabel: { color: COLORS.alertRed, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  escalationText: { color: COLORS.platinum, fontSize: 12, lineHeight: 19, marginTop: 8 },
});

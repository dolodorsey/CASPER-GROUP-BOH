import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  Shield, Users, TrendingUp, Globe, Activity,
  DollarSign, MapPin, AlertCircle
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { BRANDS } from "../constants/brands";
import { CinematicIntro } from "../components/CinematicIntro";
import { PortalButton } from "../components/PortalButton";
import { MetricsRail } from "../components/MetricsRail";
import { BrandCard } from "../components/BrandCard";
import { GlobalMap } from "../components/GlobalMap";
import { useCasper } from "../providers/CasperProvider";
import { useBrands, useLocations, useKpis, useAlerts, toBrandCardData } from "@/hooks/useSupabaseData";

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();
  const { hasSeenIntro, setHasSeenIntro } = useCasper();
  const [introComplete, setIntroComplete] = useState(hasSeenIntro);

  // Always start visible (1) if intro was already seen, animate in (0→1) after fresh intro
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Live data hooks
  const { data: liveBrands } = useBrands();
  const { data: liveLocations } = useLocations();
  const { data: liveKpis } = useKpis();
  const { data: liveAlerts } = useAlerts();

  // Build metrics from live KPIs or fallback
  const metrics = React.useMemo(() => {
    if (!liveKpis || liveKpis.length === 0) {
      return [
        { label: 'REVENUE (L30D)', value: '—', color: COLORS.moltenGold },
        { label: 'ACTIVE ORDERS', value: '—', color: COLORS.electricBlue },
        { label: 'SLA COMPLIANCE', value: '—', color: COLORS.emeraldGreen },
        { label: 'CUSTOMER RATING', value: '—', color: COLORS.platinum },
      ];
    }
    return liveKpis.slice(0, 6).map(k => ({
      label: k.name.toUpperCase(),
      value: k.unit === 'USD' ? `$${Number(k.value).toLocaleString()}` : k.unit === 'percent' ? `${k.value}%` : k.value,
      trend: k.trend_value !== 0 ? k.trend_value : undefined,
      color: k.status === 'good' ? COLORS.emeraldGreen : k.status === 'warning' ? COLORS.moltenGold : COLORS.alertRed,
    }));
  }, [liveKpis]);

  // Brand cards from live data or fallback
  const brandCards = React.useMemo(() => {
    if (liveBrands && liveBrands.length > 0) {
      return liveBrands.map(toBrandCardData);
    }
    return BRANDS;
  }, [liveBrands]);

  // Snapshot values from live data
  const revenueKpi = liveKpis?.find(k => k.name.includes('Revenue'));
  const ordersKpi = liveKpis?.find(k => k.name.includes('Orders'));
  const alertCount = liveAlerts?.length ?? 0;
  const locationCount = liveLocations?.length ?? 0;

  useEffect(() => {
    if (introComplete) {
      // If coming from fresh intro, do a subtle fade-in
      if (!hasSeenIntro) {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
        ]).start();
      }
      setHasSeenIntro(true);
    }
  }, [introComplete]);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const handlePortalPress = useCallback((portal: string) => router.push(`/${portal}` as any), [router]);

  // Sync introComplete when hasSeenIntro loads from AsyncStorage
  useEffect(() => {
    if (hasSeenIntro) setIntroComplete(true);
  }, [hasSeenIntro]);

  if (!introComplete) return <CinematicIntro onComplete={handleIntroComplete} />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]} style={StyleSheet.absoluteFillObject} />
      
      <View style={StyleSheet.absoluteFillObject}>
        {Platform.OS === 'web' && (
          <View style={styles.veinContainer}>
            <Animated.View style={[styles.vein, { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] }) }]} />
          </View>
        )}
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={[COLORS.moltenGold, COLORS.darkGold]} style={styles.logoContainer}>
                <Text style={styles.logoText}>C</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.title}>CASPER CONTROL™</Text>
                <Text style={styles.subtitle}>ENTERPRISE COMMAND CENTER</Text>
              </View>
            </View>

            {/* Live Metrics */}
            <View style={styles.metricsContainer}>
              <MetricsRail metrics={metrics} />
            </View>

            {/* Portal Gates */}
            <View style={styles.portalSection}>
              <Text style={styles.sectionTitle}>ACCESS PORTALS</Text>
              <View style={styles.portalGrid}>
                <PortalButton title="Admin Command" subtitle="Full Network Control" icon={Shield} colors={[COLORS.moltenGold, COLORS.darkGold]} onPress={() => handlePortalPress('admin')} />
                <PortalButton title="Employee Hub" subtitle="Operations & Training" icon={Users} colors={[COLORS.electricBlue, COLORS.deepBlue]} onPress={() => handlePortalPress('employee')} />
                <PortalButton title="Partner Intelligence" subtitle="Revenue & Analytics" icon={TrendingUp} colors={[COLORS.emeraldGreen, COLORS.deepGreen]} onPress={() => handlePortalPress('partner')} />
                <PortalButton title="Command Dashboard" subtitle="Live Operations Center" icon={Activity} colors={[COLORS.electricBlue, COLORS.deepBlue]} onPress={() => handlePortalPress('command')} />
              </View>
            </View>

            {/* Global Power Snapshot — Live */}
            <View style={styles.snapshotSection}>
              <Text style={styles.sectionTitle}>GLOBAL EMPIRE STATUS</Text>
              <View style={styles.snapshotGrid}>
                <View style={styles.snapshotCard}>
                  <DollarSign color={COLORS.moltenGold} size={24} />
                  <Text style={styles.snapshotValue}>
                    {revenueKpi ? `$${(Number(revenueKpi.value) / 1000).toFixed(0)}K` : '—'}
                  </Text>
                  <Text style={styles.snapshotLabel}>Last 30 Days</Text>
                </View>
                <View style={styles.snapshotCard}>
                  <MapPin color={COLORS.electricBlue} size={24} />
                  <Text style={styles.snapshotValue}>{locationCount}</Text>
                  <Text style={styles.snapshotLabel}>Locations</Text>
                </View>
                <View style={styles.snapshotCard}>
                  <Activity color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.snapshotValue}>{ordersKpi?.value ?? '—'}</Text>
                  <Text style={styles.snapshotLabel}>Active Orders</Text>
                </View>
                <View style={styles.snapshotCard}>
                  <AlertCircle color={COLORS.alertRed} size={24} />
                  <Text style={styles.snapshotValue}>{alertCount}</Text>
                  <Text style={styles.snapshotLabel}>Active Alerts</Text>
                </View>
              </View>
            </View>

            {/* Brand Universe — Live */}
            <View style={styles.brandSection}>
              <Text style={styles.sectionTitle}>BRAND UNIVERSE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
                {brandCards.map((brand, index) => (
                  <BrandCard key={brand.id} brand={brand} index={index} />
                ))}
              </ScrollView>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>LOCATION ATLAS</Text>
              <GlobalMap />
            </View>

            {/* Atlanta HQ Flagship — Live */}
            <View style={styles.flagshipSection}>
              <LinearGradient colors={[COLORS.darkCharcoal, COLORS.deepBlack]} style={styles.flagshipCard}>
                <View style={styles.flagshipHeader}>
                  <View>
                    <Text style={styles.flagshipTitle}>ATLANTA HQ</Text>
                    <Text style={styles.flagshipSubtitle}>FLAGSHIP LOCATION</Text>
                  </View>
                  <View style={styles.flagshipBadge}>
                    <Globe color={COLORS.moltenGold} size={20} />
                  </View>
                </View>
                
                <View style={styles.flagshipStats}>
                  <View style={styles.flagshipStat}>
                    <Text style={styles.flagshipStatValue}>
                      {revenueKpi ? `$${Number(revenueKpi.value).toLocaleString()}` : '—'}
                    </Text>
                    <Text style={styles.flagshipStatLabel}>Revenue (L30D)</Text>
                  </View>
                  <View style={styles.flagshipStat}>
                    <Text style={styles.flagshipStatValue}>{brandCards.length}</Text>
                    <Text style={styles.flagshipStatLabel}>Active Brands</Text>
                  </View>
                  <View style={styles.flagshipStat}>
                    <Text style={styles.flagshipStatValue}>{locationCount}</Text>
                    <Text style={styles.flagshipStatLabel}>Markets</Text>
                  </View>
                </View>

                <View style={styles.flagshipAlerts}>
                  {liveAlerts && liveAlerts.length > 0 ? (
                    liveAlerts.slice(0, 3).map((alert) => (
                      <View key={alert.id} style={styles.alertItem}>
                        <View style={[styles.alertDot, {
                          backgroundColor: alert.severity === 'critical' ? COLORS.alertRed
                            : alert.severity === 'info' ? COLORS.emeraldGreen
                            : COLORS.alertRed
                        }]} />
                        <Text style={styles.alertText}>{alert.title}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.alertItem}>
                      <View style={[styles.alertDot, { backgroundColor: COLORS.emeraldGreen }]} />
                      <Text style={styles.alertText}>All systems operational</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepBlack },
  safeArea: { flex: 1 },
  veinContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  vein: { position: 'absolute', width: width * 2, height: height * 2, backgroundColor: COLORS.moltenGold, transform: [{ rotate: '45deg' }], opacity: 0.1 },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  logoContainer: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 32, fontWeight: '900', color: COLORS.pureWhite },
  headerText: { marginLeft: 16 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.pureWhite, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: COLORS.platinum, letterSpacing: 3, marginTop: 4 },
  metricsContainer: { marginBottom: 30 },
  portalSection: { paddingHorizontal: 20, marginBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.platinum, letterSpacing: 2, marginBottom: 20 },
  portalGrid: { gap: 16 },
  snapshotSection: { paddingHorizontal: 20, marginBottom: 40 },
  snapshotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  snapshotCard: { flex: 1, minWidth: (width - 52) / 2, backgroundColor: COLORS.darkCharcoal, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.borderGray },
  snapshotValue: { fontSize: 24, fontWeight: '800', color: COLORS.pureWhite, marginTop: 8 },
  snapshotLabel: { fontSize: 11, color: COLORS.lightGray, marginTop: 4, letterSpacing: 0.5 },
  brandSection: { marginBottom: 40 },
  brandScroll: { paddingHorizontal: 20, gap: 16 },
  mapSection: { paddingHorizontal: 20, marginBottom: 40 },
  flagshipSection: { paddingHorizontal: 20 },
  flagshipCard: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.borderGray },
  flagshipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  flagshipTitle: { fontSize: 18, fontWeight: '800', color: COLORS.pureWhite, letterSpacing: 1 },
  flagshipSubtitle: { fontSize: 11, color: COLORS.platinum, letterSpacing: 2, marginTop: 4 },
  flagshipBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.darkCharcoal, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.moltenGold },
  flagshipStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  flagshipStat: { flex: 1 },
  flagshipStatValue: { fontSize: 20, fontWeight: '700', color: COLORS.pureWhite },
  flagshipStatLabel: { fontSize: 10, color: COLORS.lightGray, marginTop: 4, letterSpacing: 0.5 },
  flagshipAlerts: { gap: 12 },
  alertItem: { flexDirection: 'row', alignItems: 'center' },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.alertRed, marginRight: 12 },
  alertText: { flex: 1, fontSize: 12, color: COLORS.lightGray, lineHeight: 18 },
});

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
  Shield, 
  Users, 
  TrendingUp,
  Globe,
  Activity,
  DollarSign,
  MapPin,
  AlertCircle
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { BRANDS } from "@/constants/brands";
import { METRICS } from "@/constants/metrics";
import { CinematicIntro } from "@/components/CinematicIntro";
import { PortalButton } from "@/components/PortalButton";
import { MetricsRail } from "@/components/MetricsRail";
import { BrandCard } from "@/components/BrandCard";
import { GlobalMap } from "@/components/GlobalMap";
import { useCasper } from "@/providers/CasperProvider";

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();
  const { hasSeenIntro, setHasSeenIntro } = useCasper();
  const [introComplete, setIntroComplete] = useState(hasSeenIntro);
  const fadeAnim = useRef(new Animated.Value(hasSeenIntro ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(hasSeenIntro ? 1 : 0.95)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (introComplete && !hasSeenIntro) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      setHasSeenIntro(true);
    }
  }, [introComplete, hasSeenIntro, fadeAnim, scaleAnim, setHasSeenIntro]);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  const handlePortalPress = useCallback((portal: string) => {
    router.push(`/${portal}` as any);
  }, [router]);

  if (!introComplete) {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Background Veins */}
      <View style={StyleSheet.absoluteFillObject}>
        {Platform.OS === 'web' && (
          <View style={styles.veinContainer}>
            <Animated.View
              style={[
                styles.vein,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                  }),
                },
              ]}
            />
          </View>
        )}
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={[COLORS.moltenGold, COLORS.darkGold]}
                style={styles.logoContainer}
              >
                <Text style={styles.logoText}>C</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.title}>CASPER CONTROL™</Text>
                <Text style={styles.subtitle}>ENTERPRISE COMMAND CENTER</Text>
              </View>
            </View>

            {/* Live Metrics */}
            <View style={styles.metricsContainer}>
              <MetricsRail metrics={METRICS} />
            </View>

            {/* Portal Gates */}
            <View style={styles.portalSection}>
              <Text style={styles.sectionTitle}>ACCESS PORTALS</Text>
              <View style={styles.portalGrid}>
                <PortalButton
                  title="Admin Command"
                  subtitle="Full Network Control"
                  icon={Shield}
                  colors={[COLORS.moltenGold, COLORS.darkGold]}
                  onPress={() => handlePortalPress('admin')}
                />
                <PortalButton
                  title="Employee Hub"
                  subtitle="Operations & Training"
                  icon={Users}
                  colors={[COLORS.electricBlue, COLORS.deepBlue]}
                  onPress={() => handlePortalPress('employee')}
                />
                <PortalButton
                  title="Partner Intelligence"
                  subtitle="Revenue & Analytics"
                  icon={TrendingUp}
                  colors={[COLORS.emeraldGreen, COLORS.deepGreen]}
                  onPress={() => handlePortalPress('partner')}
                />
              </View>
            </View>

            {/* Global Power Snapshot */}
            <View style={styles.snapshotSection}>
              <Text style={styles.sectionTitle}>GLOBAL EMPIRE STATUS</Text>
              <View style={styles.snapshotGrid}>
                <View style={styles.snapshotCard}>
                  <DollarSign color={COLORS.moltenGold} size={24} />
                  <Text style={styles.snapshotValue}>$4.2M</Text>
                  <Text style={styles.snapshotLabel}>Last 30 Days</Text>
                </View>
                <View style={styles.snapshotCard}>
                  <MapPin color={COLORS.electricBlue} size={24} />
                  <Text style={styles.snapshotValue}>87</Text>
                  <Text style={styles.snapshotLabel}>Locations</Text>
                </View>
                <View style={styles.snapshotCard}>
                  <Activity color={COLORS.emeraldGreen} size={24} />
                  <Text style={styles.snapshotValue}>26,430</Text>
                  <Text style={styles.snapshotLabel}>Active Orders</Text>
                </View>
                <View style={styles.snapshotCard}>
                  <AlertCircle color={COLORS.alertRed} size={24} />
                  <Text style={styles.snapshotValue}>2</Text>
                  <Text style={styles.snapshotLabel}>Active Alerts</Text>
                </View>
              </View>
            </View>

            {/* Brand Universe */}
            <View style={styles.brandSection}>
              <Text style={styles.sectionTitle}>BRAND UNIVERSE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.brandScroll}
              >
                {BRANDS.map((brand, index) => (
                  <BrandCard key={brand.id} brand={brand} index={index} />
                ))}
              </ScrollView>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>LOCATION ATLAS</Text>
              <GlobalMap />
            </View>

            {/* Casper Group Network */}
            <View style={styles.flagshipSection}>
              <LinearGradient
                colors={[COLORS.darkCharcoal, COLORS.midnightBlack]}
                style={styles.flagshipCard}
              >
                <Text style={styles.flagshipTitle}>CASPER GROUP NETWORK</Text>
                <Text style={styles.flagshipSubtitle}>
                  Multi-brand, multi-location operations — unified by one control center.
                </Text>
                <View style={styles.flagshipStats}>
                  <View style={styles.flagshipStat}>
                    <Text style={styles.flagshipStatValue}>10</Text>
                    <Text style={styles.flagshipStatLabel}>BRANDS</Text>
                  </View>
                  <View style={styles.flagshipStat}>
                    <Text style={styles.flagshipStatValue}>7</Text>
                    <Text style={styles.flagshipStatLabel}>LOCATIONS</Text>
                  </View>
                  <View style={styles.flagshipStat}>
                    <Text style={styles.flagshipStatValue}>LIVE</Text>
                    <Text style={styles.flagshipStatLabel}>SUPABASE</Text>
                  </View>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
  },
  veinContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  vein: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    borderRadius: width,
    borderWidth: 1,
    borderColor: COLORS.moltenGold,
    top: -height,
    left: -width / 2,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.deepBlack,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mutedGray,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  metricsContainer: {
    marginBottom: 24,
  },
  portalSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.moltenGold,
    letterSpacing: 2,
    marginBottom: 16,
  },
  portalGrid: {
    gap: 12,
  },
  snapshotSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  snapshotCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  snapshotValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 8,
  },
  snapshotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mutedGray,
    marginTop: 4,
    textAlign: 'center',
  },
  brandSection: {
    marginBottom: 32,
  },
  brandScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  flagshipSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  flagshipCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.moltenGold,
  },
  flagshipTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.moltenGold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  flagshipSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.mutedGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  flagshipStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  flagshipStat: {
    alignItems: 'center',
  },
  flagshipStatValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  flagshipStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedGray,
    marginTop: 4,
    letterSpacing: 1,
  },
});
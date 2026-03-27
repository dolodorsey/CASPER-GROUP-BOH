import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const metricsFadeAnim = useRef(new Animated.Value(0)).current;

  const handleComplete = useCallback(() => {
    console.log('[CinematicIntro] Animation complete');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    console.log('[CinematicIntro] Starting animation sequence');
    const sequence = Animated.sequence([
      // Phase 1: Logo appears (0-3s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 2: Logo transforms (3-6s)
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 3: Text appears (6-9s)
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      
      // Phase 4: Metrics fade in (9-12s)
      Animated.timing(metricsFadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      
      // Hold and fade out
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(handleComplete);
  }, [fadeAnim, scaleAnim, rotateAnim, glowAnim, textFadeAnim, metricsFadeAnim, handleComplete]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepBlack, COLORS.darkCharcoal, COLORS.deepBlack]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.moltenGold, COLORS.darkGold]}
            style={styles.logo}
          >
            <Text style={styles.logoText}>C</Text>
          </LinearGradient>
          
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim,
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>CASPER CONTROL™</Text>
          <Text style={styles.subtitle}>ENTERPRISE COMMAND CENTER</Text>
        </Animated.View>

        {/* Metrics Preview */}
        <Animated.View
          style={[
            styles.metricsPreview,
            {
              opacity: metricsFadeAnim,
            },
          ]}
        >
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>$4.2M</Text>
            <Text style={styles.metricLabel}>Last 30 Days</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>87</Text>
            <Text style={styles.metricLabel}>Locations</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>26,430</Text>
            <Text style={styles.metricLabel}>Active Orders</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.pureWhite,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.moltenGold,
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.pureWhite,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.platinum,
    letterSpacing: 4,
    marginTop: 8,
  },
  metricsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.moltenGold,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.lightGray,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderGray,
    marginHorizontal: 20,
  },
});
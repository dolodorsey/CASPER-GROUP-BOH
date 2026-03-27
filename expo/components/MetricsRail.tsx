import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

interface Metric {
  label: string;
  value: string;
  trend?: number;
  color: string;
}

interface MetricsRailProps {
  metrics: Metric[];
}

export function MetricsRail({ metrics }: MetricsRailProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentIndex((prev) => (prev + 1) % metrics.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [metrics.length, fadeAnim]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: currentIndex * (width - 40),
        animated: true,
      });
    }
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {metrics.map((metric, index) => (
          <Animated.View
            key={index}
            style={[
              styles.metricCard,
              {
                opacity: index === currentIndex ? fadeAnim : 0.5,
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.darkCharcoal, COLORS.deepBlack]}
              style={styles.gradient}
            >
              <View style={styles.metricContent}>
                <Text style={styles.label}>{metric.label}</Text>
                <Text style={[styles.value, { color: metric.color }]}>
                  {metric.value}
                </Text>
                {metric.trend !== undefined && (
                  <View style={styles.trendContainer}>
                    <Text
                      style={[
                        styles.trend,
                        {
                          color:
                            metric.trend > 0
                              ? COLORS.emeraldGreen
                              : COLORS.alertRed,
                        },
                      ]}
                    >
                      {metric.trend > 0 ? '+' : ''}{metric.trend}%
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>
      
      {/* Indicators */}
      <View style={styles.indicators}>
        {metrics.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex
                    ? COLORS.moltenGold
                    : COLORS.borderGray,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
  },
  metricCard: {
    width: width - 40,
    paddingHorizontal: 20,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  metricContent: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.lightGray,
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '900',
  },
  trendContainer: {
    marginTop: 8,
  },
  trend: {
    fontSize: 14,
    fontWeight: '600',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, DollarSign } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;

interface Brand {
  id: string;
  name: string;
  tagline: string;
  mascot: string;
  colors: string[];
  revenue: string;
  growth: number;
  topSeller: string;
  icon: string;
}

interface BrandCardProps {
  brand: Brand;
  index: number;
}

export function BrandCard({ brand, index }: BrandCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index, scaleAnim, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <LinearGradient colors={brand.colors as [string, string, ...string[]]} style={styles.gradient}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{brand.icon}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.name}>{brand.name}</Text>
              <Text style={styles.tagline}>{brand.tagline}</Text>
            </View>
          </View>

          {/* Mascot Section */}
          <View style={styles.mascotSection}>
            <Text style={styles.mascot}>{brand.mascot}</Text>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <DollarSign color={COLORS.pureWhite} size={16} />
              <Text style={styles.statValue}>{brand.revenue}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <TrendingUp color={COLORS.pureWhite} size={16} />
              <Text style={styles.statValue}>+{brand.growth}%</Text>
              <Text style={styles.statLabel}>Growth</Text>
            </View>
          </View>

          {/* Top Seller */}
          <View style={styles.topSeller}>
            <Text style={styles.topSellerLabel}>TOP SELLER</Text>
            <Text style={styles.topSellerValue}>{brand.topSeller}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    height: 280,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.pureWhite,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.pureWhite,
    opacity: 0.9,
    marginTop: 2,
  },
  mascotSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascot: {
    fontSize: 14,
    color: COLORS.pureWhite,
    fontWeight: '600',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.pureWhite,
    opacity: 0.7,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  topSeller: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  topSellerLabel: {
    fontSize: 10,
    color: COLORS.pureWhite,
    opacity: 0.7,
    letterSpacing: 1,
  },
  topSellerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureWhite,
    marginTop: 4,
  },
});
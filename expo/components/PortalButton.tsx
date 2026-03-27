import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

interface PortalButtonProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  colors: string[];
  onPress: () => void;
}

export function PortalButton({
  title,
  subtitle,
  icon: Icon,
  colors,
  onPress,
}: PortalButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient colors={colors as [string, string, ...string[]]} style={styles.gradient}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon color={COLORS.pureWhite} size={32} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
          
          {/* Glow overlay */}
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.pureWhite,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.pureWhite,
    opacity: 0.8,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pureWhite,
  },
});
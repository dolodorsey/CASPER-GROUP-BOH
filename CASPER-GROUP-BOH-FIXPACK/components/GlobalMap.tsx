import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Activity, AlertCircle } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { LOCATIONS } from "@/constants/locations";

export function GlobalMap() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.darkCharcoal, COLORS.deepBlack]}
        style={styles.mapContainer}
      >
        {/* Map Grid Background */}
        <View style={styles.gridOverlay}>
          {[...Array(10)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${i * 10}%` }]} />
          ))}
          {[...Array(10)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${i * 10}%` }]} />
          ))}
        </View>

        {/* Location Pins */}
        {LOCATIONS.map((location, index) => (
          <View
            key={location.id}
            style={[
              styles.pin,
              { left: location.x, top: location.y },
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    scale: location.status === 'surge' ? pulseAnim : 1,
                  },
                ],
              }}
            >
            <TouchableOpacity style={styles.pinButton}>
              <View
                style={[
                  styles.pinDot,
                  {
                    backgroundColor:
                      location.status === 'open'
                        ? COLORS.emeraldGreen
                        : location.status === 'surge'
                        ? COLORS.moltenGold
                        : COLORS.alertRed,
                  },
                ]}
              />
              {location.status === 'surge' && (
                <View style={styles.surgeRing} />
              )}
            </TouchableOpacity>
            </Animated.View>
          </View>
        ))}

        {/* Connection Lines */}
        <View style={styles.connectionLines}>
          <View style={[styles.connectionLine, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.connectionLine, { transform: [{ rotate: '-30deg' }] }]} />
        </View>
      </LinearGradient>

      {/* Location List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.locationList}
        contentContainerStyle={styles.locationListContent}
      >
        {LOCATIONS.slice(0, 5).map((location) => (
          <TouchableOpacity key={location.id} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MapPin
                color={
                  location.status === 'open'
                    ? COLORS.emeraldGreen
                    : location.status === 'surge'
                    ? COLORS.moltenGold
                    : COLORS.alertRed
                }
                size={16}
              />
              <Text style={styles.locationName}>{location.name}</Text>
            </View>
            <Text style={styles.locationRevenue}>{location.revenue}</Text>
            <View style={styles.locationFooter}>
              {location.status === 'surge' ? (
                <Activity color={COLORS.moltenGold} size={12} />
              ) : location.status === 'maintenance' ? (
                <AlertCircle color={COLORS.alertRed} size={12} />
              ) : null}
              <Text style={styles.locationStatus}>
                {location.status.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
  },
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: COLORS.platinum,
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  verticalLine: {
    height: '100%',
    width: 1,
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.pureWhite,
  },
  surgeRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.moltenGold,
    opacity: 0.5,
  },
  connectionLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionLine: {
    position: 'absolute',
    width: 200,
    height: 1,
    backgroundColor: COLORS.moltenGold,
    opacity: 0.2,
  },
  locationList: {
    marginTop: 20,
  },
  locationListContent: {
    gap: 12,
  },
  locationCard: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    padding: 16,
    width: 150,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.pureWhite,
  },
  locationRevenue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.moltenGold,
    marginBottom: 8,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationStatus: {
    fontSize: 10,
    color: COLORS.lightGray,
    letterSpacing: 0.5,
  },
});
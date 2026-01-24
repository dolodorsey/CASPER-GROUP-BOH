import { View, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

interface GoldFrameProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * GoldFrame - Signature Gold Border wrapper component
 * 
 * Enforces the 2026 Control Center aesthetic with consistent molten gold borders.
 * Use this for all hero components, cards, and primary UI elements.
 * 
 * @example
 * <GoldFrame>
 *   <Text>Command Center Online</Text>
 * </GoldFrame>
 */
export function GoldFrame({ children, style }: GoldFrameProps) {
  return (
    <View
      style={[
        {
          borderWidth: 2,
          borderColor: COLORS.moltenGold,
          borderRadius: 12,
          padding: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

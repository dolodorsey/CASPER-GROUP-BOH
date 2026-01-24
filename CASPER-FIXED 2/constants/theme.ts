import { COLORS } from './colors';

/**
 * THEME - 2026 Control Center Design System
 * 
 * Centralized theme constants for consistent spacing, typography,
 * and the signature Gold Border aesthetic throughout the app.
 */
export const THEME = {
  /**
   * Spacing scale - Use these values for margins, padding, and gaps
   * to maintain consistent rhythm across all UI elements
   */
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  /**
   * Border radius scale - Consistent rounding for cards and containers
   */
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },

  /**
   * Signature Gold Border - The defining aesthetic of 2026 Control Center
   * Apply to all hero components, primary cards, and key UI elements
   */
  goldBorder: {
    width: 2,
    color: COLORS.moltenGold,
    style: {
      borderWidth: 2,
      borderColor: COLORS.moltenGold,
    },
  },

  /**
   * Typography scale - Font sizes for hierarchical text
   */
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  /**
   * Font weights - Use sparingly to maintain hierarchy
   */
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  /**
   * Opacity levels for overlays and disabled states
   */
  opacity: {
    disabled: 0.5,
    overlay: 0.8,
    subtle: 0.6,
  },

  /**
   * Shadow presets for depth and elevation
   */
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    gold: {
      shadowColor: COLORS.moltenGold,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
  },
} as const;

/**
 * GameLog design system — "Arcade Neon" (solid-color edition).
 *
 * Rules:
 *  - The ONLY gradient in the app is the screen background (`gradients.screen`).
 *    Everything else uses flat, single colors.
 *  - No purple / pink / fuchsia. The accent set is teal-led and colorful:
 *    teal, cyan, blue, sky, green, lime, gold, amber, orange, coral, red, yellow.
 */
import type { ColorValue } from 'react-native';

export const colors = {
  // Layered base (cool slate-black)
  void: '#06090D',
  bg: '#0A0E13',
  surface: '#12171E',
  surfaceAlt: '#1A212A',
  elevated: '#232C37',

  // Hairline borders
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',

  // Text
  text: '#F2F6F8',
  textDim: '#AEB9C4',
  textMuted: '#6E7B88',

  // Accents (no purple/pink)
  teal: '#14C8B0',
  tealBright: '#2DD4BF',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  sky: '#38BDF8',
  green: '#34D399',
  lime: '#A3E635',
  gold: '#FBBF24',
  amber: '#F59E0B',
  orange: '#FB923C',
  coral: '#FF7A5C',
  red: '#EF4444',
  yellow: '#FACC15',

  // Semantic
  primary: '#14C8B0',
  success: '#34D399',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

type Grad = readonly [ColorValue, ColorValue, ...ColorValue[]];

// The single permitted gradient: the app background.
export const gradients = {
  screen: ['#0A0E13', '#0C1218', '#0E151C'] as Grad,
};

/** A solid, semi-transparent dark overlay to keep text legible over cover art. */
export const coverOverlay = 'rgba(6,9,13,0.72)';

/** Per-section flat accent color. */
export const accents: Record<string, { color: string }> = {
  featured: { color: colors.coral },
  trending: { color: colors.orange },
  popular: { color: colors.gold },
  top: { color: colors.teal },
  upcoming: { color: colors.blue },
  indie: { color: colors.green },
  recent: { color: colors.cyan },
  anticipated: { color: colors.yellow },
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
};

/** Build a React Native glow shadow for a given accent color. */
export function glow(color: string, opacity = 0.5, r = 14) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: r,
    elevation: 10,
  };
}

/** Convert a 6-digit hex + alpha (0-1) to an rgba string. */
export function alpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

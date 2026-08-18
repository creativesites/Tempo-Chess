/**
 * Tempo's app-chrome theme tokens (navigation, cards, text). Board square
 * colors are a separate concern, owned by the board component itself —
 * see src/components/board — so a player can pick a board skin
 * independently of light/dark app chrome.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111318',
    textSecondary: '#5B6270',
    background: '#F7F7F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E7E9E4',
    border: '#E2E4DF',
    accent: '#1E8F5F',
    accentMuted: '#DCEFE5',
    danger: '#C1443B',
    warning: '#B8842D',
  },
  dark: {
    text: '#EDEFEC',
    textSecondary: '#9AA0AC',
    background: '#0B0E13',
    backgroundElement: '#151A22',
    backgroundSelected: '#1E2530',
    border: '#232A35',
    accent: '#3ECF8E',
    accentMuted: '#12291F',
    danger: '#E5695F',
    warning: '#E0A94C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'Inter, ui-sans-serif, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

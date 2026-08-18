/**
 * Board skins are a presentation concern local to the mobile app, not
 * shared domain logic — kept out of @tempo/shared deliberately.
 */
export type BoardTheme = 'minimal_light' | 'emerald_modern' | 'classic_wood' | 'nordic_slate' | 'swiss_clean' | 'minimalist_charcoal';

export interface BoardThemeColors {
  light: string;
  dark: string;
  border: string;
  lastMove: string;
  selected: string;
}

/**
 * Board square palettes — hex values carried over from the web
 * prototype's THEME_STYLES so the two products share a visual identity,
 * expressed as plain colors since RN styling has no Tailwind classes.
 */
export const BOARD_THEMES: Record<BoardTheme, BoardThemeColors> = {
  minimal_light: {
    light: '#FAFBFD',
    dark: '#CBD5E1',
    border: '#94A3B8',
    lastMove: 'rgba(251,191,36,0.35)',
    selected: 'rgba(251,191,36,0.55)',
  },
  swiss_clean: {
    light: '#FFFFFF',
    dark: '#E4E4E7',
    border: '#A1A1AA',
    lastMove: 'rgba(251,191,36,0.35)',
    selected: 'rgba(251,191,36,0.55)',
  },
  emerald_modern: {
    light: '#F2F5F0',
    dark: '#4A7C59',
    border: '#2E5A3A',
    lastMove: 'rgba(251,191,36,0.35)',
    selected: 'rgba(251,191,36,0.55)',
  },
  classic_wood: {
    light: '#F7EFE2',
    dark: '#B07D4F',
    border: '#7E4F2B',
    lastMove: 'rgba(251,191,36,0.4)',
    selected: 'rgba(251,191,36,0.6)',
  },
  nordic_slate: {
    light: '#E2E8F0',
    dark: '#64748B',
    border: '#475569',
    lastMove: 'rgba(251,191,36,0.35)',
    selected: 'rgba(251,191,36,0.55)',
  },
  minimalist_charcoal: {
    light: '#94A3B8',
    dark: '#1E293B',
    border: '#0F172A',
    lastMove: 'rgba(251,191,36,0.4)',
    selected: 'rgba(251,191,36,0.6)',
  },
};

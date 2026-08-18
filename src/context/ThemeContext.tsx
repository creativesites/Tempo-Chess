import React, { createContext, useContext, useState, useEffect } from 'react';
import { UIThemeMode, BoardTheme, UIThemeConfig } from '../types';
import { AppStorage, AVAILABLE_UI_THEMES } from '../database/storage';

export interface ThemeTokens {
  // Page container
  appBg: string;
  appShellBg: string;
  appText: string;
  appTextMuted: string;
  appTextSubtle: string;

  // Header & Nav
  headerBg: string;
  headerBorder: string;
  navBg: string;
  navBorder: string;
  navActiveBg: string;
  navActiveText: string;
  navInactiveText: string;

  // Cards
  cardBg: string;
  cardBgHover: string;
  cardBorder: string;
  cardShadow: string;

  // Hero Card
  heroBg: string;
  heroBorder: string;
  heroGlow: string;

  // Interactive controls
  inputBg: string;
  inputBorder: string;
  btnSecondaryBg: string;
  btnSecondaryText: string;
  btnSecondaryBorder: string;
  btnSecondaryHover: string;

  // Accent & Brand
  accentPrimary: string;
  accentPrimaryHover: string;
  accentPrimaryText: string;
  accentBadgeBg: string;
  accentBadgeBorder: string;
  accentBadgeText: string;

  // Stat / Meter containers
  meterTrackBg: string;
  meterBorder: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;

  // Status colors
  positiveBg: string;
  positiveBorder: string;
  positiveText: string;
  warningBg: string;
  warningBorder: string;
  warningText: string;
  negativeBg: string;
  negativeBorder: string;
  negativeText: string;

  // Is light archetype
  isLight: boolean;
}

const THEME_TOKENS_MAP: Record<UIThemeMode, ThemeTokens> = {
  minimal_light: {
    appBg: 'bg-[#F8FAFC]',
    appShellBg: 'bg-[#F8FAFC]',
    appText: 'text-slate-900',
    appTextMuted: 'text-slate-600',
    appTextSubtle: 'text-slate-400',

    headerBg: 'bg-white/90',
    headerBorder: 'border-slate-200/90',
    navBg: 'bg-white/95',
    navBorder: 'border-slate-200/90',
    navActiveBg: 'bg-emerald-50',
    navActiveText: 'text-emerald-700',
    navInactiveText: 'text-slate-500 hover:text-slate-800',

    cardBg: 'bg-white',
    cardBgHover: 'hover:bg-slate-50/80',
    cardBorder: 'border-slate-200/80',
    cardShadow: 'shadow-xs shadow-slate-100',

    heroBg: 'bg-gradient-to-br from-emerald-50/70 via-white to-slate-50/80',
    heroBorder: 'border-emerald-500/30',
    heroGlow: 'bg-emerald-500/10',

    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    btnSecondaryBg: 'bg-slate-100',
    btnSecondaryText: 'text-slate-800',
    btnSecondaryBorder: 'border-slate-200',
    btnSecondaryHover: 'hover:bg-slate-200',

    accentPrimary: 'bg-emerald-600',
    accentPrimaryHover: 'hover:bg-emerald-500',
    accentPrimaryText: 'text-white',
    accentBadgeBg: 'bg-emerald-50',
    accentBadgeBorder: 'border-emerald-200',
    accentBadgeText: 'text-emerald-800',

    meterTrackBg: 'bg-slate-100',
    meterBorder: 'border-slate-200',
    pillBg: 'bg-slate-100/90',
    pillBorder: 'border-slate-200',
    pillText: 'text-slate-700',

    positiveBg: 'bg-emerald-50',
    positiveBorder: 'border-emerald-200',
    positiveText: 'text-emerald-800',
    warningBg: 'bg-amber-50',
    warningBorder: 'border-amber-200',
    warningText: 'text-amber-800',
    negativeBg: 'bg-rose-50',
    negativeBorder: 'border-rose-200',
    negativeText: 'text-rose-800',

    isLight: true
  },
  warm_editorial: {
    appBg: 'bg-[#FAF8F5]',
    appShellBg: 'bg-[#FAF8F5]',
    appText: 'text-stone-900',
    appTextMuted: 'text-stone-600',
    appTextSubtle: 'text-stone-400',

    headerBg: 'bg-[#FFFDF9]/95',
    headerBorder: 'border-stone-200',
    navBg: 'bg-[#FFFDF9]/95',
    navBorder: 'border-stone-200',
    navActiveBg: 'bg-amber-50',
    navActiveText: 'text-amber-900',
    navInactiveText: 'text-stone-500 hover:text-stone-800',

    cardBg: 'bg-white',
    cardBgHover: 'hover:bg-stone-50/80',
    cardBorder: 'border-stone-200',
    cardShadow: 'shadow-xs shadow-stone-100',

    heroBg: 'bg-gradient-to-br from-amber-50/60 via-white to-stone-50',
    heroBorder: 'border-amber-400/40',
    heroGlow: 'bg-amber-500/10',

    inputBg: 'bg-stone-50',
    inputBorder: 'border-stone-200',
    btnSecondaryBg: 'bg-stone-100',
    btnSecondaryText: 'text-stone-800',
    btnSecondaryBorder: 'border-stone-200',
    btnSecondaryHover: 'hover:bg-stone-200',

    accentPrimary: 'bg-[#8B5E3C]',
    accentPrimaryHover: 'hover:bg-[#724C30]',
    accentPrimaryText: 'text-white',
    accentBadgeBg: 'bg-amber-50',
    accentBadgeBorder: 'border-amber-200',
    accentBadgeText: 'text-amber-900',

    meterTrackBg: 'bg-stone-100',
    meterBorder: 'border-stone-200',
    pillBg: 'bg-stone-100',
    pillBorder: 'border-stone-200',
    pillText: 'text-stone-800',

    positiveBg: 'bg-emerald-50',
    positiveBorder: 'border-emerald-200',
    positiveText: 'text-emerald-800',
    warningBg: 'bg-amber-50',
    warningBorder: 'border-amber-200',
    warningText: 'text-amber-800',
    negativeBg: 'bg-rose-50',
    negativeBorder: 'border-rose-200',
    negativeText: 'text-rose-800',

    isLight: true
  },
  nordic_crisp: {
    appBg: 'bg-[#F1F5F9]',
    appShellBg: 'bg-[#F1F5F9]',
    appText: 'text-slate-900',
    appTextMuted: 'text-slate-600',
    appTextSubtle: 'text-slate-400',

    headerBg: 'bg-white/95',
    headerBorder: 'border-slate-200',
    navBg: 'bg-white/95',
    navBorder: 'border-slate-200',
    navActiveBg: 'bg-sky-50',
    navActiveText: 'text-sky-700',
    navInactiveText: 'text-slate-500 hover:text-slate-800',

    cardBg: 'bg-white',
    cardBgHover: 'hover:bg-slate-50',
    cardBorder: 'border-slate-200',
    cardShadow: 'shadow-xs shadow-slate-100',

    heroBg: 'bg-gradient-to-br from-sky-50/70 via-white to-slate-100/60',
    heroBorder: 'border-sky-400/40',
    heroGlow: 'bg-sky-500/10',

    inputBg: 'bg-slate-50',
    inputBorder: 'border-slate-200',
    btnSecondaryBg: 'bg-slate-100',
    btnSecondaryText: 'text-slate-800',
    btnSecondaryBorder: 'border-slate-200',
    btnSecondaryHover: 'hover:bg-slate-200',

    accentPrimary: 'bg-sky-600',
    accentPrimaryHover: 'hover:bg-sky-500',
    accentPrimaryText: 'text-white',
    accentBadgeBg: 'bg-sky-50',
    accentBadgeBorder: 'border-sky-200',
    accentBadgeText: 'text-sky-800',

    meterTrackBg: 'bg-slate-100',
    meterBorder: 'border-slate-200',
    pillBg: 'bg-slate-100',
    pillBorder: 'border-slate-200',
    pillText: 'text-slate-800',

    positiveBg: 'bg-emerald-50',
    positiveBorder: 'border-emerald-200',
    positiveText: 'text-emerald-800',
    warningBg: 'bg-amber-50',
    warningBorder: 'border-amber-200',
    warningText: 'text-amber-800',
    negativeBg: 'bg-rose-50',
    negativeBorder: 'border-rose-200',
    negativeText: 'text-rose-800',

    isLight: true
  },
  swiss_monochrome: {
    appBg: 'bg-[#FAFAFA]',
    appShellBg: 'bg-[#FAFAFA]',
    appText: 'text-zinc-950',
    appTextMuted: 'text-zinc-600',
    appTextSubtle: 'text-zinc-400',

    headerBg: 'bg-white/95',
    headerBorder: 'border-zinc-200',
    navBg: 'bg-white/95',
    navBorder: 'border-zinc-200',
    navActiveBg: 'bg-zinc-100',
    navActiveText: 'text-zinc-950',
    navInactiveText: 'text-zinc-500 hover:text-zinc-900',

    cardBg: 'bg-white',
    cardBgHover: 'hover:bg-zinc-50',
    cardBorder: 'border-zinc-200',
    cardShadow: 'shadow-xs shadow-zinc-100',

    heroBg: 'bg-gradient-to-br from-zinc-100/80 via-white to-zinc-50',
    heroBorder: 'border-zinc-300',
    heroGlow: 'bg-zinc-500/5',

    inputBg: 'bg-zinc-50',
    inputBorder: 'border-zinc-200',
    btnSecondaryBg: 'bg-zinc-100',
    btnSecondaryText: 'text-zinc-900',
    btnSecondaryBorder: 'border-zinc-200',
    btnSecondaryHover: 'hover:bg-zinc-200',

    accentPrimary: 'bg-zinc-900',
    accentPrimaryHover: 'hover:bg-zinc-800',
    accentPrimaryText: 'text-white',
    accentBadgeBg: 'bg-zinc-100',
    accentBadgeBorder: 'border-zinc-200',
    accentBadgeText: 'text-zinc-900',

    meterTrackBg: 'bg-zinc-100',
    meterBorder: 'border-zinc-200',
    pillBg: 'bg-zinc-100',
    pillBorder: 'border-zinc-200',
    pillText: 'text-zinc-900',

    positiveBg: 'bg-zinc-100',
    positiveBorder: 'border-zinc-300',
    positiveText: 'text-zinc-900',
    warningBg: 'bg-zinc-100',
    warningBorder: 'border-zinc-300',
    warningText: 'text-zinc-900',
    negativeBg: 'bg-zinc-100',
    negativeBorder: 'border-zinc-300',
    negativeText: 'text-zinc-900',

    isLight: true
  },
  dark_slate: {
    appBg: 'bg-[#090D14]',
    appShellBg: 'bg-[#090D14]',
    appText: 'text-slate-100',
    appTextMuted: 'text-slate-400',
    appTextSubtle: 'text-slate-500',

    headerBg: 'bg-[#0B111E]/95',
    headerBorder: 'border-slate-800/80',
    navBg: 'bg-[#0B111E]/95',
    navBorder: 'border-slate-800/90',
    navActiveBg: 'bg-emerald-500/10',
    navActiveText: 'text-emerald-400',
    navInactiveText: 'text-slate-400 hover:text-slate-200',

    cardBg: 'bg-slate-900/90',
    cardBgHover: 'hover:bg-slate-850',
    cardBorder: 'border-slate-800',
    cardShadow: 'shadow-md',

    heroBg: 'bg-gradient-to-br from-slate-900 to-slate-950',
    heroBorder: 'border-emerald-500/30',
    heroGlow: 'bg-emerald-500/5',

    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800',
    btnSecondaryBg: 'bg-slate-800',
    btnSecondaryText: 'text-slate-200',
    btnSecondaryBorder: 'border-slate-700',
    btnSecondaryHover: 'hover:bg-slate-750',

    accentPrimary: 'bg-emerald-600',
    accentPrimaryHover: 'hover:bg-emerald-500',
    accentPrimaryText: 'text-white',
    accentBadgeBg: 'bg-emerald-950',
    accentBadgeBorder: 'border-emerald-800/50',
    accentBadgeText: 'text-emerald-400',

    meterTrackBg: 'bg-slate-950',
    meterBorder: 'border-slate-800',
    pillBg: 'bg-slate-900/90',
    pillBorder: 'border-slate-800',
    pillText: 'text-slate-300',

    positiveBg: 'bg-emerald-950/70',
    positiveBorder: 'border-emerald-500/50',
    positiveText: 'text-emerald-300',
    warningBg: 'bg-amber-950/40',
    warningBorder: 'border-amber-500/40',
    warningText: 'text-amber-300',
    negativeBg: 'bg-rose-950/40',
    negativeBorder: 'border-rose-500/40',
    negativeText: 'text-rose-300',

    isLight: false
  }
};

interface ThemeContextValue {
  uiTheme: UIThemeMode;
  boardTheme: BoardTheme;
  tokens: ThemeTokens;
  activeConfig: UIThemeConfig;
  availableThemes: UIThemeConfig[];
  showDesignModal: boolean;
  setUITheme: (theme: UIThemeMode) => void;
  setBoardTheme: (theme: BoardTheme) => void;
  openDesignModal: () => void;
  closeDesignModal: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiTheme, setUiThemeState] = useState<UIThemeMode>(AppStorage.getUITheme());
  const [boardTheme, setBoardThemeState] = useState<BoardTheme>(AppStorage.getBoardTheme());
  const [showDesignModal, setShowDesignModal] = useState<boolean>(false);

  const setUITheme = (theme: UIThemeMode) => {
    setUiThemeState(theme);
    AppStorage.setUITheme(theme);

    // Auto-sync recommended board theme for seamless aesthetic harmony
    const config = AVAILABLE_UI_THEMES.find(t => t.id === theme);
    if (config) {
      setBoardThemeState(config.recommendedBoard);
      AppStorage.setBoardTheme(config.recommendedBoard);
    }
  };

  const setBoardTheme = (theme: BoardTheme) => {
    setBoardThemeState(theme);
    AppStorage.setBoardTheme(theme);
  };

  const tokens = THEME_TOKENS_MAP[uiTheme] || THEME_TOKENS_MAP.minimal_light;
  const activeConfig = AVAILABLE_UI_THEMES.find(t => t.id === uiTheme) || AVAILABLE_UI_THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        uiTheme,
        boardTheme,
        tokens,
        activeConfig,
        availableThemes: AVAILABLE_UI_THEMES,
        showDesignModal,
        setUITheme,
        setBoardTheme,
        openDesignModal: () => setShowDesignModal(true),
        closeDesignModal: () => setShowDesignModal(false)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

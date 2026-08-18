import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UIThemeMode, BoardTheme } from '../../types';
import { Check, Palette, Eye, Sun, Moon, Feather, Compass, Layers, X, ShieldCheck } from 'lucide-react';
import { PieceSvg } from '../chess/PieceSvg';

interface DesignShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BOARD_PREVIEWS: { id: BoardTheme; name: string; lightColor: string; darkColor: string; desc: string }[] = [
  {
    id: 'minimal_light',
    name: 'Minimal Studio',
    lightColor: '#FAFBFD',
    darkColor: '#CBD5E1',
    desc: 'Pure crisp off-white & soft slate'
  },
  {
    id: 'swiss_clean',
    name: 'Swiss Clean',
    lightColor: '#FFFFFF',
    darkColor: '#E4E4E7',
    desc: 'High contrast ivory & neutral zinc'
  },
  {
    id: 'emerald_modern',
    name: 'Modern Emerald',
    lightColor: '#F2F5F0',
    darkColor: '#4A7C59',
    desc: 'Alabaster & deep forest green'
  },
  {
    id: 'classic_wood',
    name: 'Warm Walnut',
    lightColor: '#F7EFE2',
    darkColor: '#B07D4F',
    desc: 'Almond cream & hand-rubbed walnut'
  },
  {
    id: 'nordic_slate',
    name: 'Nordic Slate',
    lightColor: '#E2E8F0',
    darkColor: '#64748B',
    desc: 'Cool cloud & denim slate'
  },
  {
    id: 'minimalist_charcoal',
    name: 'Charcoal Dark',
    lightColor: '#94A3B8',
    darkColor: '#1E293B',
    desc: 'Deep graphite & obsidian'
  }
];

export const DesignShowcaseModal: React.FC<DesignShowcaseModalProps> = ({ isOpen, onClose }) => {
  const { uiTheme, boardTheme, tokens, availableThemes, setUITheme, setBoardTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'app_designs' | 'board_styles'>('app_designs');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl ${tokens.cardBg} ${tokens.cardBorder} border shadow-2xl overflow-hidden`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${tokens.cardBorder}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${tokens.accentBadgeBg} ${tokens.accentBadgeBorder} border flex items-center justify-center`}>
              <Palette className={`w-4 h-4 ${tokens.accentBadgeText}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${tokens.appText}`}>Design & Aesthetic System</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Light & Minimalist
                </span>
              </div>
              <p className={`text-xs ${tokens.appTextMuted}`}>
                Select your preferred visual archetype and chess board palette
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} ${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center justify-center transition`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className={`flex border-b ${tokens.cardBorder} px-6 pt-3 bg-slate-50/50`}>
          <button
            type="button"
            onClick={() => setActiveTab('app_designs')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'app_designs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Application Themes (5 Styles)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('board_styles')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'board_styles'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chess Board Palettes (6 Styles)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'app_designs' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextMuted}`}>
                  Curated Aesthetic Themes
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" />
                  Light minimal styles optimized for focus
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {availableThemes.map(theme => {
                  const isSelected = uiTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setUITheme(theme.id)}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
                          : `${tokens.cardBg} ${tokens.cardBorder} hover:border-slate-300 shadow-xs`
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center ${
                              isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <div>
                            <span className={`text-sm font-bold block ${tokens.appText}`}>
                              {theme.name}
                            </span>
                            <span className={`text-[11px] ${tokens.appTextMuted}`}>
                              {theme.subtitle}
                            </span>
                          </div>
                        </div>

                        {theme.category === 'light' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Sun className="w-2.5 h-2.5 text-amber-500" />
                            Light
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                            <Moon className="w-2.5 h-2.5 text-indigo-400" />
                            Dark
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className={`text-xs ${tokens.appTextMuted} leading-relaxed`}>
                        {theme.description}
                      </p>

                      {/* Live Visual Palette Swatches */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 w-full">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: theme.id === 'warm_editorial' ? '#FAF8F5' : theme.id === 'nordic_crisp' ? '#F1F5F9' : theme.id === 'dark_slate' ? '#090D14' : '#F8FAFC' }}
                            title="Canvas background"
                          />
                          <div
                            className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs bg-white"
                            title="Card surface"
                          />
                          <div
                            className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: theme.id === 'warm_editorial' ? '#8B5E3C' : theme.id === 'nordic_crisp' ? '#0284C7' : theme.id === 'swiss_monochrome' ? '#18181B' : '#059669' }}
                            title="Accent tone"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {theme.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextMuted}`}>
                  Chess Board Colorways
                </span>
                <span className="text-xs text-slate-500">
                  Matches your selected UI aesthetic
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {BOARD_PREVIEWS.map(bp => {
                  const isSelected = boardTheme === bp.id;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => setBoardTheme(bp.id)}
                      className={`relative p-3.5 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 text-center ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-md'
                          : `${tokens.cardBg} ${tokens.cardBorder} hover:border-slate-300 shadow-xs`
                      }`}
                    >
                      {/* Mini 4x4 Chess Board Representation */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-300 shadow-xs grid grid-cols-4 grid-rows-4 relative">
                        {[0, 1, 2, 3].map(row =>
                          [0, 1, 2, 3].map(col => {
                            const isDarkSq = (row + col) % 2 === 1;
                            const isKnightSquare = row === 1 && col === 1;
                            const isPawnSquare = row === 2 && col === 2;
                            return (
                              <div
                                key={`${row}-${col}`}
                                className="w-full h-full flex items-center justify-center relative"
                                style={{ backgroundColor: isDarkSq ? bp.darkColor : bp.lightColor }}
                              >
                                {isKnightSquare && (
                                  <div className="w-3.5 h-3.5">
                                    <PieceSvg type="n" color="w" />
                                  </div>
                                )}
                                {isPawnSquare && (
                                  <div className="w-3.5 h-3.5">
                                    <PieceSvg type="p" color="b" />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div>
                        <span className={`text-xs font-bold block ${tokens.appText}`}>
                          {bp.name}
                        </span>
                        <span className={`text-[10px] ${tokens.appTextMuted} block`}>
                          {bp.desc}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Active Board</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick live preview summary bar */}
          <div className={`p-4 rounded-xl ${tokens.pillBg} ${tokens.pillBorder} border flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className={`text-xs font-bold ${tokens.appText} block`}>
                  Live Preview Active: {availableThemes.find(t => t.id === uiTheme)?.name}
                </span>
                <span className={`text-[11px] ${tokens.appTextMuted}`}>
                  Clean light design applied instantly across all screens.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-bold rounded-xl ${tokens.accentPrimary} ${tokens.accentPrimaryHover} text-white shadow-xs transition`}
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

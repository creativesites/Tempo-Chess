import React from 'react';
import { Volume2, VolumeX, Flame, ShieldCheck, Palette } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  streakDays: number;
  rating: number;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streakDays,
  rating,
  onOpenSettings
}) => {
  const [soundOn, setSoundOn] = React.useState(sounds.isEnabled());
  const { tokens, openDesignModal, activeConfig } = useTheme();

  const toggleSound = () => {
    const next = !soundOn;
    sounds.setEnabled(next);
    setSoundOn(next);
  };

  return (
    <header
      className={`w-full ${tokens.headerBg} border-b ${tokens.headerBorder} px-4 py-3 sticky top-0 z-40 backdrop-blur-md flex items-center justify-between transition-colors duration-200`}
    >
      {/* Brand & Coach Status */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-slate-800 p-0.5 shadow-xs flex items-center justify-center">
          <div className={`w-full h-full ${tokens.cardBg} rounded-[9px] flex items-center justify-center`}>
            <span className="font-mono font-black text-sm text-emerald-600">T</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className={`text-sm font-bold tracking-tight ${tokens.appText} font-sans`}>
              Tempo
            </h1>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${tokens.accentBadgeBg} ${tokens.accentBadgeText} border ${tokens.accentBadgeBorder}`}>
              Offline AI
            </span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] ${tokens.appTextMuted}`}>
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Coach Ready (Qwen3 1.7B)</span>
          </div>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Rating Pill */}
        <div className={`px-2 py-1 ${tokens.pillBg} border ${tokens.pillBorder} rounded-lg flex items-center gap-1 shadow-2xs`}>
          <span className={`text-[10px] font-bold ${tokens.appTextSubtle}`}>EST:</span>
          <span className={`text-xs font-mono font-bold ${tokens.appText}`}>{rating}</span>
        </div>

        {/* Streak */}
        <div className={`px-2 py-1 ${tokens.warningBg} border ${tokens.warningBorder} rounded-lg flex items-center gap-1 shadow-2xs`}>
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className={`text-xs font-mono font-bold ${tokens.warningText}`}>{streakDays}d</span>
        </div>

        {/* Design Selector Button */}
        <button
          type="button"
          onClick={openDesignModal}
          className={`px-2 py-1 rounded-lg ${tokens.btnSecondaryBg} border ${tokens.btnSecondaryBorder} ${tokens.btnSecondaryText} ${tokens.btnSecondaryHover} flex items-center gap-1 text-[11px] font-semibold transition shadow-2xs`}
          title="Change Design Style & Theme"
        >
          <Palette className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Theme</span>
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className={`w-7 h-7 rounded-lg ${tokens.btnSecondaryBg} border ${tokens.btnSecondaryBorder} ${tokens.btnSecondaryHover} flex items-center justify-center transition shadow-2xs`}
          title={soundOn ? 'Sound On' : 'Sound Muted'}
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};

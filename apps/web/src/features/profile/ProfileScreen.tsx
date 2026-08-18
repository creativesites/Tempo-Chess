import React, { useState } from 'react';
import { PlayerModel, BoardTheme } from '../../types';
import { AppStorage } from '../../database/storage';
import { AVAILABLE_MODELS } from '../../ai/providers';
import { useTheme } from '../../context/ThemeContext';
import {
  User,
  Settings,
  Sliders,
  Cpu,
  Palette,
  ShieldCheck,
  RotateCcw,
  Download,
  CheckCircle2,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ProfileScreenProps {
  playerModel: PlayerModel;
  onUpdatePlayerModel: (model: PlayerModel) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  playerModel,
  onUpdatePlayerModel
}) => {
  const { tokens, openDesignModal, setBoardTheme, boardTheme } = useTheme();
  const [verbosity, setVerbosity] = useState<'minimal' | 'balanced' | 'comprehensive'>(
    AppStorage.getCoachVerbosity()
  );
  const [selectedModel, setSelectedModel] = useState<string>(AppStorage.getSelectedAIModel());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());

  const handleVerbosityChange = (val: 'minimal' | 'balanced' | 'comprehensive') => {
    setVerbosity(val);
    AppStorage.setCoachVerbosity(val);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    AppStorage.setSelectedAIModel(modelId);
  };

  const handleThemeChange = (theme: BoardTheme) => {
    setBoardTheme(theme);
  };

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    sounds.setEnabled(val);
  };

  const themes: { id: BoardTheme; label: string; previewClass: string }[] = [
    { id: 'minimal_light', label: 'Minimal Ivory', previewClass: 'bg-[#B0BCCB]' },
    { id: 'swiss_clean', label: 'Swiss Modern', previewClass: 'bg-[#98A8B8]' },
    { id: 'nordic_slate', label: 'Nordic Slate', previewClass: 'bg-[#475569]' },
    { id: 'emerald_modern', label: 'Emerald Modern', previewClass: 'bg-[#2E7D32]' },
    { id: 'classic_wood', label: 'Classic Wood', previewClass: 'bg-[#A47449]' },
    { id: 'minimalist_charcoal', label: 'Charcoal', previewClass: 'bg-[#1E293B]' }
  ];

  const winRate = playerModel.gamesPlayed > 0
    ? Math.round((playerModel.wins / playerModel.gamesPlayed) * 100)
    : 0;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 animate-in fade-in pb-24">
      {/* Profile Header Card */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 ${tokens.cardShadow} space-y-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} p-0.5 shadow-xs flex items-center justify-center`}>
            <div className={`w-full h-full ${tokens.cardBg} rounded-[14px] flex items-center justify-center font-bold text-lg text-emerald-600 font-sans`}>
              {playerModel.playerName.charAt(0)}
            </div>
          </div>
          <div>
            <h2 className={`text-base font-bold ${tokens.appText}`}>{playerModel.playerName}</h2>
            <div className={`flex items-center gap-2 text-xs ${tokens.appTextMuted} mt-0.5`}>
              <span>Rating: <strong className="text-emerald-600 font-mono">{playerModel.ratingEstimate}</strong></span>
              <span>•</span>
              <span>Streak: <strong className="text-amber-500 font-mono">{playerModel.currentStreakDays}d</strong></span>
            </div>
          </div>
        </div>

        {/* Win/Loss Record Grid */}
        <div className={`grid grid-cols-4 gap-2 pt-2 border-t ${tokens.cardBorder} text-center`}>
          <div className={`${tokens.pillBg} p-2 rounded-xl border ${tokens.pillBorder}`}>
            <span className={`text-[10px] uppercase font-bold ${tokens.appTextSubtle} block`}>Games</span>
            <span className={`text-sm font-bold ${tokens.appText} font-mono`}>{playerModel.gamesPlayed}</span>
          </div>
          <div className={`${tokens.pillBg} p-2 rounded-xl border ${tokens.pillBorder}`}>
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Wins</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">{playerModel.wins}</span>
          </div>
          <div className={`${tokens.pillBg} p-2 rounded-xl border ${tokens.pillBorder}`}>
            <span className="text-[10px] uppercase font-bold text-rose-500 block">Losses</span>
            <span className="text-sm font-bold text-rose-500 font-mono">{playerModel.losses}</span>
          </div>
          <div className={`${tokens.pillBg} p-2 rounded-xl border ${tokens.pillBorder}`}>
            <span className={`text-[10px] uppercase font-bold ${tokens.appTextSubtle} block`}>Win Rate</span>
            <span className={`text-sm font-bold ${tokens.appText} font-mono`}>{winRate}%</span>
          </div>
        </div>
      </div>

      {/* Visual Design Style Selector Card */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4.5 ${tokens.cardShadow} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
              Visual Theme & Aesthetic
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono font-bold">
            6 Design Styles
          </span>
        </div>

        <p className={`text-xs ${tokens.appTextMuted} leading-relaxed`}>
          Switch between crisp Minimalist Light, Swiss Precision, Nordic Slate, Warm Studio, or Dark modes.
        </p>

        <button
          type="button"
          onClick={openDesignModal}
          className={`w-full py-2.5 ${tokens.accentPrimary} ${tokens.accentPrimaryHover} text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Open Design & Theme Selector</span>
        </button>
      </div>

      {/* Coach Teaching Style & Verbosity */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 ${tokens.cardShadow} space-y-3`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
            Coach Teaching Style
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['minimal', 'balanced', 'comprehensive'] as const).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => handleVerbosityChange(level)}
              className={`p-2.5 rounded-xl border text-center transition capitalize text-xs font-bold ${
                verbosity === level
                  ? `${tokens.accentBadgeBg} border-emerald-500 text-emerald-700 ring-1 ring-emerald-500/30`
                  : `${tokens.pillBg} ${tokens.pillBorder} ${tokens.appTextMuted} hover:border-slate-300`
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className={`text-[11px] ${tokens.appTextMuted}`}>
          {verbosity === 'minimal' && 'Quiet coach mode: only intervenes on critical tactical blunders.'}
          {verbosity === 'balanced' && 'Standard coach mode: Socratic questions on key strategic and tactical turns.'}
          {verbosity === 'comprehensive' && 'Intensive coach mode: frequent pedagogical notes on opening plans and piece harmony.'}
        </p>
      </div>

      {/* Chess Board Theme Customization */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 ${tokens.cardShadow} space-y-3`}>
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-500" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
            Chess Board Theme
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {themes.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleThemeChange(t.id)}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                boardTheme === t.id
                  ? `${tokens.cardBg} border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs`
                  : `${tokens.pillBg} ${tokens.pillBorder} hover:border-slate-300`
              }`}
            >
              <div className={`w-5 h-5 rounded-md ${t.previewClass} border border-slate-300 shrink-0`} />
              <span className={`text-xs font-semibold ${tokens.appText}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pluggable Local AI Provider Models */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 ${tokens.cardShadow} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
              Offline AI Reasoner
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
            Pluggable Engine
          </span>
        </div>

        <div className="space-y-2">
          {AVAILABLE_MODELS.map(model => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => handleModelChange(model.id)}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                  isSelected
                    ? `${tokens.cardBg} border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs`
                    : `${tokens.pillBg} ${tokens.pillBorder} hover:border-slate-300`
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${tokens.appText}`}>{model.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed`}>
                    {model.description}
                  </p>
                </div>
                <span className={`text-[10px] font-mono ${tokens.appTextSubtle} shrink-0`}>
                  {model.sizeMb} MB
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy & Offline Guarantee */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 space-y-2 text-xs ${tokens.cardShadow}`}>
        <div className="flex items-center gap-2 text-emerald-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Offline & Private</span>
        </div>
        <p className={`${tokens.appTextMuted} leading-relaxed text-[11px]`}>
          Your games, player behavioral model, opening notes, and tactical stats reside exclusively on your local device. No internet connectivity is required.
        </p>
      </div>
    </div>
  );
};

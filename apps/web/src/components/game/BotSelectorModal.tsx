import React, { useState } from 'react';
import { BotProfile, BotCategory } from '../../types';
import { CHESS_BOTS, getBotsByCategory } from '../../chess/bots';
import { BotAdaptiveMemory } from '../../chess/botMemory';
import { useTheme } from '../../context/ThemeContext';
import {
  Bot,
  Zap,
  Shield,
  Swords,
  Trophy,
  Crown,
  ChevronRight,
  Check,
  X,
  Target,
  Brain,
  Sliders,
  Flame,
  Activity,
  History
} from 'lucide-react';

interface BotSelectorModalProps {
  isOpen: boolean;
  selectedBot: BotProfile;
  onSelectBot: (bot: BotProfile) => void;
  onClose: () => void;
}

export const BotSelectorModal: React.FC<BotSelectorModalProps> = ({
  isOpen,
  selectedBot,
  onSelectBot,
  onClose
}) => {
  const { tokens } = useTheme();
  const [activeCategory, setActiveCategory] = useState<BotCategory>(selectedBot.category || 'intermediate');
  const [previewBot, setPreviewBot] = useState<BotProfile>(selectedBot);

  if (!isOpen) return null;

  const categories: { id: BotCategory; label: string; range: string; icon: React.ReactNode }[] = [
    { id: 'beginner', label: 'Beginner', range: '250 - 850', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'intermediate', label: 'Intermediate', range: '1000 - 1500', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'advanced', label: 'Advanced', range: '1600 - 1900', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'master', label: 'Master', range: '2000 - 2200', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'grandmaster', label: 'Grandmaster', range: '2850 - 3000', icon: <Crown className="w-3.5 h-3.5" /> }
  ];

  const categoryBots = getBotsByCategory(activeCategory);

  const handleConfirm = (bot: BotProfile) => {
    onSelectBot(bot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
        {/* Header */}
        <div className={`p-4 border-b ${tokens.cardBorder} flex items-center justify-between ${tokens.pillBg}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center`}>
              <Bot className={`w-4 h-4 ${tokens.accentBadgeText}`} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${tokens.appText}`}>Choose AI Opponent</h2>
              <p className={`text-xs ${tokens.appTextMuted}`}>
                Chess.com-calibrated bots playing strictly at their stated rating
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className={`flex border-b ${tokens.cardBorder} ${tokens.pillBg} p-1.5 gap-1 overflow-x-auto no-scrollbar`}>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                const botsInCat = getBotsByCategory(cat.id);
                if (botsInCat.length > 0) setPreviewBot(botsInCat[0]);
              }}
              className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-xl text-center transition flex flex-col items-center gap-0.5 ${
                activeCategory === cat.id
                  ? `${tokens.cardBg} ${tokens.appText} shadow-2xs border ${tokens.cardBorder} font-bold`
                  : `${tokens.appTextMuted} hover:${tokens.appText} font-medium`
              }`}
            >
              <div className="flex items-center gap-1 text-xs">
                {cat.icon}
                <span>{cat.label}</span>
              </div>
              <span className="text-[9px] opacity-70 font-mono">{cat.range}</span>
            </button>
          ))}
        </div>

        {/* Bot Grid & Preview Section */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Bots in Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryBots.map(bot => {
              const isSelected = previewBot.id === bot.id;
              const isCurrentActive = selectedBot.id === bot.id;

              return (
                <div
                  key={bot.id}
                  onClick={() => setPreviewBot(bot)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? `ring-2 ring-emerald-600 ${tokens.cardBg} border-emerald-500 shadow-sm`
                      : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-slate-300`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shadow-xs ${bot.avatarBg}`}>
                      {bot.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${tokens.appText}`}>{bot.name}</span>
                        {isCurrentActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-black text-emerald-700">
                          {bot.rating}
                        </span>
                        <span className={`text-[10px] ${tokens.appTextMuted}`}>
                          {bot.title || bot.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Bot Deep Bio Card */}
          {previewBot && (
            <div className={`p-4 rounded-2xl border ${tokens.cardBorder} ${tokens.pillBg} space-y-3 shadow-inner`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-base shadow-sm ${previewBot.avatarBg}`}>
                    {previewBot.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${tokens.appText}`}>{previewBot.name}</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300">
                        {previewBot.rating} Elo
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 font-semibold">{previewBot.tagline}</p>
                  </div>
                </div>
              </div>

              <p className={`text-xs ${tokens.appTextMuted} leading-relaxed`}>
                {previewBot.bio}
              </p>

              {/* Bot Tactical Attributes */}
              <div className={`grid grid-cols-3 gap-2 pt-2 border-t ${tokens.cardBorder} text-center`}>
                <div className={`p-2 rounded-xl ${tokens.cardBg} border ${tokens.cardBorder}`}>
                  <span className={`text-[9px] uppercase font-bold ${tokens.appTextSubtle} block`}>
                    Playstyle
                  </span>
                  <span className={`text-[11px] font-bold ${tokens.appText} truncate block mt-0.5`}>
                    {previewBot.playstyle}
                  </span>
                </div>
                <div className={`p-2 rounded-xl ${tokens.cardBg} border ${tokens.cardBorder}`}>
                  <span className={`text-[9px] uppercase font-bold ${tokens.appTextSubtle} block`}>
                    Search Depth
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 block mt-0.5">
                    {previewBot.depth} ply + QSearch
                  </span>
                </div>
                <div className={`p-2 rounded-xl ${tokens.cardBg} border ${tokens.cardBorder}`}>
                  <span className={`text-[9px] uppercase font-bold ${tokens.appTextSubtle} block`}>
                    Blunder Chance
                  </span>
                  <span className="text-[11px] font-mono font-bold text-rose-700 block mt-0.5">
                    {Math.round(previewBot.blunderRate * 100)}%
                  </span>
                </div>
              </div>

              {/* Dynamic Adaptive Memory Card */}
              {(() => {
                const mem = BotAdaptiveMemory.getBotMemory(previewBot.id);
                return (
                  <div className={`p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-700/80 space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Brain className="w-3.5 h-3.5" />
                        <span>Adaptive Learning Engine</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {mem.totalGamesVsUser} games played
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">You Won</span>
                        <span className="font-bold text-emerald-400">{mem.lossesVsUser}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Bot Won</span>
                        <span className="font-bold text-rose-400">{mem.winsVsUser}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Draws</span>
                        <span className="font-bold text-slate-300">{mem.drawsVsUser}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>Adaptation Style:</span>
                      <span className="font-bold text-amber-300 uppercase tracking-wider">
                        {mem.adaptationStyle.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {previewBot.favoriteOpenings && previewBot.favoriteOpenings.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] pt-1">
                  <span className={`font-semibold ${tokens.appTextSubtle}`}>Openings:</span>
                  <span className={`font-medium ${tokens.appText} truncate`}>
                    {previewBot.favoriteOpenings.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 ${tokens.pillBg} border-t ${tokens.cardBorder} flex items-center justify-between`}>
          <div className="text-xs">
            <span className={`${tokens.appTextMuted}`}>Selected: </span>
            <span className={`font-bold ${tokens.appText}`}>{previewBot.name} ({previewBot.rating})</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleConfirm(previewBot)}
              className={`px-4 py-1.5 ${tokens.accentPrimary} text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition flex items-center gap-1.5`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Play vs {previewBot.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

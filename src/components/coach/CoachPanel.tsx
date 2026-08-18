import React, { useState } from 'react';
import { CoachIntervention, SocraticPrompt } from '../../types';
import { Brain, HelpCircle, CheckCircle2, ChevronRight, Lightbulb, Compass, Award, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';

interface CoachPanelProps {
  intervention: CoachIntervention | null;
  openingName?: string;
  onDismiss?: () => void;
  onHintRequested?: () => void;
  onRequestInsight?: () => void;
  isThinking?: boolean;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  intervention,
  openingName,
  onDismiss,
  onHintRequested,
  onRequestInsight,
  isThinking = false
}) => {
  const [socraticStage, setSocraticStage] = useState<'initial' | 'hint1' | 'hint2' | 'revealed' | 'solved'>('initial');
  const { tokens } = useTheme();

  // Reset socratic stage when intervention changes
  React.useEffect(() => {
    setSocraticStage('initial');
  }, [intervention?.id]);

  if (isThinking) {
    return (
      <div className={`w-full ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3.5 flex items-center justify-between ${tokens.cardShadow}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-full ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center animate-spin`}>
            <RefreshCw className={`w-3.5 h-3.5 ${tokens.accentBadgeText}`} />
          </div>
          <span className={`text-xs ${tokens.appText} font-medium tracking-wide`}>
            Tempo Coach is analyzing position...
          </span>
        </div>
      </div>
    );
  }

  // If no active intervention, show calm coach bar
  if (!intervention) {
    return (
      <div className={`w-full ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-2.5 flex items-center justify-between ${tokens.cardShadow}`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center`}>
            <Brain className={`w-3.5 h-3.5 ${tokens.accentBadgeText}`} />
          </div>
          <div className="flex flex-col">
            <span className={`text-xs ${tokens.appText} font-bold`}>
              {openingName || 'Tempo AI Coach'}
            </span>
            <span className={`text-[10px] ${tokens.appTextMuted}`}>
              Observing playstyle & behavioral patterns
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestInsight}
          className={`px-2.5 py-1 text-[11px] font-bold ${tokens.btnSecondaryText} ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} rounded-lg transition flex items-center gap-1 shadow-2xs`}
        >
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Ask Coach</span>
        </button>
      </div>
    );
  }

  const { level, type, title, message, socratic } = intervention;

  // Level 3 / Socratic teaching moment
  if (socratic) {
    return (
      <div className={`w-full ${tokens.cardBg} border-2 border-amber-400/80 rounded-xl p-3.5 shadow-md transition-all duration-200`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5 text-amber-800" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                {title || 'Teaching Moment'}
              </span>
              <span className={`text-xs font-bold ${tokens.appText}`}>
                {socratic.question}
              </span>
            </div>
          </div>
        </div>

        {/* Socratic Interactive Steps */}
        {socraticStage === 'initial' && (
          <div className={`flex flex-wrap gap-2 mt-3 pt-2.5 border-t ${tokens.cardBorder}`}>
            <button
              type="button"
              onClick={() => {
                sounds.playSuccess();
                setSocraticStage('solved');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I see it</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playCoachChime();
                setSocraticStage('hint1');
              }}
              className={`px-3 py-1.5 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} ${tokens.btnSecondaryText} text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-2xs`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Give me a hint</span>
            </button>
            <button
              type="button"
              onClick={() => setSocraticStage('revealed')}
              className={`px-2.5 py-1.5 ${tokens.appTextMuted} hover:${tokens.appText} text-xs font-medium transition`}
            >
              Just tell me
            </button>
          </div>
        )}

        {socraticStage === 'hint1' && (
          <div className="mt-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-start gap-1.5 text-amber-900 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>Hint 1: {socratic.hint1}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSocraticStage('hint2')}
                className={`px-2.5 py-1 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} text-xs font-bold ${tokens.btnSecondaryText} rounded-md border ${tokens.btnSecondaryBorder} transition`}
              >
                Need another hint?
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playSuccess();
                  setSocraticStage('solved');
                }}
                className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md"
              >
                Got it now
              </button>
            </div>
          </div>
        )}

        {socraticStage === 'hint2' && (
          <div className="mt-2.5 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-start gap-1.5 text-amber-900 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>Hint 2: {socratic.hint2}</span>
            </div>
            <button
              type="button"
              onClick={() => setSocraticStage('revealed')}
              className={`px-2.5 py-1 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} text-xs font-bold ${tokens.btnSecondaryText} rounded-md border ${tokens.btnSecondaryBorder} transition`}
            >
              Show solution explanation
            </button>
          </div>
        )}

        {(socraticStage === 'revealed' || socraticStage === 'solved') && (
          <div className={`mt-2.5 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs ${tokens.appText} space-y-1.5 animate-in fade-in`}>
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{socraticStage === 'solved' ? 'Well calculated!' : 'Concept Breakdown:'}</span>
            </div>
            <p className="text-emerald-950 leading-relaxed font-medium">
              {socratic.solutionExplanation}
            </p>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md shadow-2xs"
              >
                Resume Game
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Celebration state
  if (level === 'celebration') {
    return (
      <div className={`w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-xs flex items-start justify-between gap-3 animate-in fade-in`}>
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
              {title || 'Disciplined Move'}
            </span>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed mt-0.5">
              {message}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className={`text-slate-600 hover:text-slate-900 text-xs px-2 py-1 bg-white border border-slate-200 rounded-md font-bold shadow-2xs`}
        >
          Got it
        </button>
      </div>
    );
  }

  // Gentle intervention / Opening concept
  return (
    <div className={`w-full ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3 ${tokens.cardShadow} flex items-start justify-between gap-3 animate-in fade-in`}>
      <div className="flex items-start gap-2.5">
        <div className={`w-6 h-6 rounded-full ${tokens.btnSecondaryBg} border ${tokens.btnSecondaryBorder} flex items-center justify-center shrink-0 mt-0.5`}>
          {type === 'king_safety' || type === 'over_attacking' ? (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
          )}
        </div>
        <div>
          {title && (
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.accentBadgeText} block`}>
              {title}
            </span>
          )}
          <p className={`text-xs ${tokens.appText} font-medium leading-relaxed mt-0.5`}>
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className={`text-xs px-2 py-1 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder} rounded-md font-bold transition shadow-2xs`}
      >
        Dismiss
      </button>
    </div>
  );
};

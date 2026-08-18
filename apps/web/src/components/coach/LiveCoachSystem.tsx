import React, { useState } from 'react';
import {
  CoachIntervention,
  SocraticPrompt,
  Square,
  Color,
  PieceSymbol,
  ChessMove,
  OpeningContext,
  PlayerModel
} from '../../types';
import { CoachStageBanner, GameStage } from './CoachStageBanner';
import { ThreatRadar } from './ThreatRadar';
import { CandidateMoveSpotter } from './CandidateMoveSpotter';
import { BoardArrow } from '../chess/ChessBoard';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import {
  Brain,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  Compass,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronRight,
  Crosshair,
  Award,
  RefreshCw
} from 'lucide-react';

export type CoachMode =
  | 'active_socrates'
  | 'tactical_guardian'
  | 'strategic_master'
  | 'endgame_maestro'
  | 'silent_observer';

interface LiveCoachSystemProps {
  intervention: CoachIntervention | null;
  opening?: OpeningContext;
  playerColor: Color;
  fen: string;
  moveHistory: ChessMove[];
  isThinking?: boolean;
  playerModel?: PlayerModel;
  onDismissIntervention?: () => void;
  onRequestInsight?: () => void;
  onTakeback?: () => void;
  onPreviewArrowsChange?: (arrows: BoardArrow[], dangerSquares?: Square[]) => void;
  onSelectCandidateMove?: (from: Square, to: Square, promotion?: PieceSymbol) => void;
}

export const LiveCoachSystem: React.FC<LiveCoachSystemProps> = ({
  intervention,
  opening,
  playerColor,
  fen,
  moveHistory,
  isThinking = false,
  playerModel,
  onDismissIntervention,
  onRequestInsight,
  onTakeback,
  onPreviewArrowsChange,
  onSelectCandidateMove
}) => {
  const { tokens } = useTheme();
  const [coachMode, setCoachMode] = useState<CoachMode>('active_socrates');
  const [socraticStage, setSocraticStage] = useState<'initial' | 'hint1' | 'hint2' | 'revealed' | 'solved'>('initial');
  const [showToolsTab, setShowToolsTab] = useState<'compass' | 'threats' | 'candidates'>('compass');

  // Determine current game stage
  const moveCount = moveHistory.length;
  const gameStage: GameStage = React.useMemo(() => {
    // If fewer than 14 non-pawn pieces or move > 26 -> endgame
    const fields = fen.split(' ')[0];
    const nonPawnPieces = fields.replace(/[pP/1-8]/g, '').length;
    if (nonPawnPieces <= 6 || moveCount >= 28) return 'endgame';
    if (moveCount <= 10) return 'opening';
    return 'middlegame';
  }, [fen, moveCount]);

  // Reset socratic stage on new intervention
  React.useEffect(() => {
    setSocraticStage('initial');
  }, [intervention?.id]);

  const handleThreatArrows = (arrows: BoardArrow[], dangerSquares: Square[]) => {
    if (onPreviewArrowsChange) {
      onPreviewArrowsChange(arrows, dangerSquares);
    }
  };

  const handleCandidateArrows = (arrows: BoardArrow[]) => {
    if (onPreviewArrowsChange) {
      onPreviewArrowsChange(arrows, []);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* 1. Coach Mode Bar & Persona Controls */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-2.5 sm:p-3 ${tokens.cardShadow} flex flex-wrap items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className={`text-xs font-bold ${tokens.appText} block leading-tight`}>
              Tempo AI Coach
            </span>
            <span className={`text-[10px] ${tokens.appTextMuted}`}>
              Adaptive Socratic Engine
            </span>
          </div>
        </div>

        {/* Coach Mode Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCoachMode('active_socrates')}
            title="Active Socrates: Guided questions and tactical insights"
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
              coachMode === 'active_socrates'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🎓 Socrates
          </button>

          <button
            type="button"
            onClick={() => setCoachMode('tactical_guardian')}
            title="Tactical Guardian: Blunder alarms and threat detection"
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
              coachMode === 'tactical_guardian'
                ? 'bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-400 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🛡️ Guardian
          </button>

          <button
            type="button"
            onClick={() => setCoachMode('strategic_master')}
            title="Strategic Master: Pawn structure, outposts, and king plans"
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
              coachMode === 'strategic_master'
                ? 'bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-400 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🧭 Strategy
          </button>

          <button
            type="button"
            onClick={() => setCoachMode('silent_observer')}
            title="Silent Observer: Tournament mode with zero interruptions"
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
              coachMode === 'silent_observer'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🤫 Silent
          </button>
        </div>
      </div>

      {/* 2. Socratic Active Intervention Banner (if present and not silent) */}
      {coachMode !== 'silent_observer' && intervention && (
        <div className={`${tokens.cardBg} border-2 border-amber-400 dark:border-amber-600/80 rounded-2xl p-3.5 shadow-md space-y-2.5 transition-all duration-200`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <HelpCircle className="w-3.5 h-3.5 text-amber-800" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  {intervention.title || 'Teaching Moment'}
                </span>
                <span className={`text-xs font-bold ${tokens.appText}`}>
                  {intervention.socratic?.question || intervention.message}
                </span>
              </div>
            </div>

            {onTakeback && (intervention.type === 'blunder_alert' || intervention.type === 'over_attacking') && (
              <button
                type="button"
                onClick={onTakeback}
                className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 text-[11px] font-bold flex items-center gap-1 hover:bg-rose-200 transition shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-rose-600" />
                <span>Takeback & Learn</span>
              </button>
            )}
          </div>

          {/* Socratic Steps */}
          {intervention.socratic && (
            <div>
              {socraticStage === 'initial' && (
                <div className={`flex flex-wrap gap-2 pt-2 border-t ${tokens.cardBorder}`}>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSuccess();
                      setSocraticStage('solved');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-2xs"
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
                    className={`px-3 py-1.5 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} ${tokens.btnSecondaryText} text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-2xs`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Give me a hint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocraticStage('revealed')}
                    className={`px-2.5 py-1.5 ${tokens.appTextMuted} hover:${tokens.appText} text-xs font-medium transition`}
                  >
                    Just explain
                  </button>
                </div>
              )}

              {socraticStage === 'hint1' && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                  <div className="flex items-start gap-1.5 font-semibold">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>Hint: {intervention.socratic.hint1}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSocraticStage('hint2')}
                      className={`px-2.5 py-1 ${tokens.btnSecondaryBg} text-xs font-bold ${tokens.btnSecondaryText} rounded-lg border ${tokens.btnSecondaryBorder} transition`}
                    >
                      Need another hint?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSuccess();
                        setSocraticStage('solved');
                      }}
                      className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                    >
                      Got it now
                    </button>
                  </div>
                </div>
              )}

              {socraticStage === 'hint2' && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-2">
                  <div className="flex items-start gap-1.5 font-semibold">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>Hint 2: {intervention.socratic.hint2}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocraticStage('revealed')}
                    className="px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg"
                  >
                    Reveal Solution
                  </button>
                </div>
              )}

              {(socraticStage === 'revealed' || socraticStage === 'solved') && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Key Chess Principle</span>
                  </div>
                  <p className="leading-relaxed">
                    {intervention.socratic.solutionExplanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Coach Tools Navigation (Compass / Threats / Candidate Plans) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setShowToolsTab('compass')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            showToolsTab === 'compass'
              ? `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder} shadow-2xs`
              : `${tokens.appTextMuted} hover:${tokens.appText}`
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Stage Compass</span>
        </button>

        <button
          type="button"
          onClick={() => setShowToolsTab('threats')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            showToolsTab === 'threats'
              ? `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder} shadow-2xs`
              : `${tokens.appTextMuted} hover:${tokens.appText}`
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-rose-500" />
          <span>Threat Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setShowToolsTab('candidates')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            showToolsTab === 'candidates'
              ? `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder} shadow-2xs`
              : `${tokens.appTextMuted} hover:${tokens.appText}`
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>3 Candidate Plans</span>
        </button>
      </div>

      {/* 4. Tab Views */}
      {showToolsTab === 'compass' && (
        <CoachStageBanner
          stage={gameStage}
          moveCount={moveCount}
          opening={opening}
          playerColor={playerColor}
          fen={fen}
          moveHistory={moveHistory}
        />
      )}

      {showToolsTab === 'threats' && (
        <ThreatRadar
          fen={fen}
          playerColor={playerColor}
          onThreatArrowsChange={handleThreatArrows}
        />
      )}

      {showToolsTab === 'candidates' && (
        <CandidateMoveSpotter
          fen={fen}
          playerColor={playerColor}
          onPreviewMoveArrow={handleCandidateArrows}
          onSelectCandidateMove={onSelectCandidateMove}
        />
      )}

      {/* 5. Quick Ask Coach Action Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onRequestInsight}
          disabled={isThinking}
          className={`w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98`}
        >
          {isThinking ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Coach is calculating position...</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask Coach for Instant Strategic Advice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

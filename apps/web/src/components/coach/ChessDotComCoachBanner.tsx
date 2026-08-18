import React, { useState, useEffect } from 'react';
import {
  CoachIntervention,
  Square,
  Color,
  PieceSymbol,
  ChessMove,
  OpeningContext,
  PlayerModel
} from '../../types';
import { BoardArrow } from '../chess/ChessBoard';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import { CoachStageBanner, GameStage } from './CoachStageBanner';
import { ThreatRadar } from './ThreatRadar';
import { CandidateMoveSpotter } from './CandidateMoveSpotter';
import {
  Brain,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  Compass,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Award,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';

export type CoachMode =
  | 'active_socrates'
  | 'tactical_guardian'
  | 'strategic_master'
  | 'silent_observer';

interface ChessDotComCoachBannerProps {
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

export const ChessDotComCoachBanner: React.FC<ChessDotComCoachBannerProps> = ({
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<'compass' | 'threats' | 'candidates' | 'none'>('none');
  const [socraticStage, setSocraticStage] = useState<'initial' | 'hint1' | 'hint2' | 'revealed' | 'solved'>('initial');

  // Determine current game stage
  const moveCount = moveHistory.length;
  const gameStage: GameStage = React.useMemo(() => {
    const fields = fen.split(' ')[0];
    const nonPawnPieces = fields.replace(/[pP/1-8]/g, '').length;
    if (nonPawnPieces <= 6 || moveCount >= 28) return 'endgame';
    if (moveCount <= 10) return 'opening';
    return 'middlegame';
  }, [fen, moveCount]);

  // Reset socratic stage when a new intervention arrives
  useEffect(() => {
    setSocraticStage('initial');
    if (intervention) {
      // Auto open if significant moment
      setIsExpanded(true);
    }
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

  // Get dynamic coach speech bubble text & mood
  const getCoachStatus = () => {
    if (isThinking) {
      return {
        text: 'Analyzing position and formulating key tactical patterns...',
        avatarState: 'thinking',
        accentColor: 'text-emerald-500',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      };
    }

    if (intervention) {
      if (intervention.type === 'blunder_alert') {
        return {
          text: intervention.socratic?.question || intervention.message || 'Caution! That last move created tactical vulnerabilities.',
          avatarState: 'alert',
          accentColor: 'text-rose-600 dark:text-rose-400',
          badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
        };
      }
      if (intervention.type === 'brilliant_find') {
        return {
          text: intervention.message || 'Brilliant move! You found the key thematic idea in this position.',
          avatarState: 'happy',
          accentColor: 'text-amber-500',
          badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
        };
      }
      return {
        text: intervention.socratic?.question || intervention.message,
        avatarState: 'coaching',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      };
    }

    if (moveCount === 0) {
      return {
        text: "Game started! Control the center (e4/d4), develop your minor pieces, and prepare king safety.",
        avatarState: 'ready',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      };
    }

    if (opening && moveCount <= 10) {
      return {
        text: `Playing ${opening.name}${opening.variation ? ' (' + opening.variation + ')' : ''}. ${opening.coreIdea ? opening.coreIdea.slice(0, 110) + '...' : 'Stick to classical opening principles.'}`,
        avatarState: 'ready',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      };
    }

    if (gameStage === 'middlegame') {
      return {
        text: 'Middlegame: Coordinate your pieces toward open files, weak squares, or king attack vectors.',
        avatarState: 'ready',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      };
    }

    return {
      text: 'Endgame reached: Activate your king centrally, push passed pawns, and cut off opponent king.',
      avatarState: 'ready',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
    };
  };

  const status = getCoachStatus();

  return (
    <div className={`w-full rounded-2xl border ${tokens.cardBorder} ${tokens.cardBg} shadow-sm overflow-hidden transition-all duration-200`}>
      {/* 1. Chess.com-style Coach Top Strip */}
      <div className="p-3 sm:p-3.5 flex items-start gap-3 relative">
        {/* Coach Character Avatar with Adaptive Mood Eye/Glow */}
        <div className="relative shrink-0 pt-0.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-0.5 shadow-md flex items-center justify-center">
            <div className={`w-full h-full ${tokens.cardBg} rounded-[14px] flex items-center justify-center relative overflow-hidden`}>
              <Brain className={`w-5 h-5 ${status.accentColor} transition-transform duration-200 hover:scale-110`} />
              {isThinking && (
                <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
              )}
            </div>
          </div>
          {/* Live Status Pip */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isThinking ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-white dark:border-slate-900 ${isThinking ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          </span>
        </div>

        {/* Coach Dialog Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${tokens.appText} tracking-tight`}>
                Coach Daniel
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.badgeBg}`}>
                {isThinking ? 'Calculating' : gameStage}
              </span>
            </div>

            {/* Quick Socratic or Tool Toggle Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRequestInsight}
                disabled={isThinking}
                title="Ask Coach for Hint"
                className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} text-xs font-bold transition flex items-center gap-1 shadow-2xs`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] hidden sm:inline">Insight</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} transition text-slate-500 hover:text-slate-900`}
                title={isExpanded ? "Collapse Coach Tools" : "Expand Coach Tools"}
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Speech Text */}
          <div className="relative">
            <p className={`text-xs ${tokens.appText} font-medium leading-snug line-clamp-2 sm:line-clamp-3`}>
              {status.text}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Active Socratic Question / Blunder Alert Bar (If Present) */}
      {intervention && coachMode !== 'silent_observer' && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 rounded-xl border border-amber-200/90 dark:border-amber-800/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{intervention.title || 'Coaching Moment'}</span>
              </span>

              {onTakeback && (intervention.type === 'blunder_alert' || intervention.type === 'over_attacking') && (
                <button
                  type="button"
                  onClick={onTakeback}
                  className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-200 transition"
                >
                  <RotateCcw className="w-3 h-3 text-rose-600" />
                  <span>Takeback</span>
                </button>
              )}
            </div>

            {/* Socratic Interactive Options */}
            {intervention.socratic && (
              <div>
                {socraticStage === 'initial' && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSuccess();
                        setSocraticStage('solved');
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>I see it</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCoachChime();
                        setSocraticStage('hint1');
                      }}
                      className={`px-2.5 py-1 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} ${tokens.btnSecondaryText} text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-2xs`}
                    >
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Give hint</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSocraticStage('revealed')}
                      className={`px-2 py-1 ${tokens.appTextMuted} hover:${tokens.appText} text-[11px] font-medium transition`}
                    >
                      Explain move
                    </button>
                  </div>
                )}

                {socraticStage === 'hint1' && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold">
                      💡 {intervention.socratic.hint1}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSocraticStage('hint2')}
                        className="px-2 py-0.5 bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 rounded text-[10px] font-bold"
                      >
                        Next hint
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playSuccess();
                          setSocraticStage('solved');
                        }}
                        className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                )}

                {socraticStage === 'hint2' && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold">
                      💡 {intervention.socratic.hint2}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSocraticStage('revealed')}
                      className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold"
                    >
                      Show answer
                    </button>
                  </div>
                )}

                {(socraticStage === 'revealed' || socraticStage === 'solved') && (
                  <div className="p-2 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-lg text-xs text-emerald-950 dark:text-emerald-200 space-y-0.5 mt-1">
                    <span className="font-bold flex items-center gap-1 text-emerald-900 dark:text-emerald-300 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Key Principle:
                    </span>
                    <p className="leading-snug text-emerald-900 dark:text-emerald-200 text-[11px]">
                      {intervention.socratic.solutionExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Expandable Advanced Coach Tools Tray (Stage Compass / Threat Radar / Candidate Moves) */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2.5">
          {/* Tool Selector Tabs */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'compass' ? 'none' : 'compass')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                  activeTool === 'compass'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder}`
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>Stage Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'threats' ? 'none' : 'threats')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                  activeTool === 'threats'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder}`
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>Threat Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool(activeTool === 'candidates' ? 'none' : 'candidates')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
                  activeTool === 'candidates'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder}`
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>3 Key Plans</span>
              </button>
            </div>

            {/* Coach Persona Selector */}
            <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
              <button
                type="button"
                onClick={() => setCoachMode('active_socrates')}
                className={`px-1.5 py-0.5 rounded ${coachMode === 'active_socrates' ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-2xs' : 'text-slate-600'}`}
                title="Active Socrates Mode"
              >
                🎓
              </button>
              <button
                type="button"
                onClick={() => setCoachMode('tactical_guardian')}
                className={`px-1.5 py-0.5 rounded ${coachMode === 'tactical_guardian' ? 'bg-white dark:bg-slate-900 text-rose-700 shadow-2xs' : 'text-slate-600'}`}
                title="Tactical Guardian Mode"
              >
                🛡️
              </button>
              <button
                type="button"
                onClick={() => setCoachMode('silent_observer')}
                className={`px-1.5 py-0.5 rounded ${coachMode === 'silent_observer' ? 'bg-white dark:bg-slate-900 text-slate-800 shadow-2xs' : 'text-slate-600'}`}
                title="Silent Tournament Mode"
              >
                🤫
              </button>
            </div>
          </div>

          {/* Active Tool Subview */}
          {activeTool === 'compass' && (
            <div className="animate-in fade-in">
              <CoachStageBanner
                stage={gameStage}
                moveCount={moveCount}
                opening={opening}
                playerColor={playerColor}
                fen={fen}
                moveHistory={moveHistory}
              />
            </div>
          )}

          {activeTool === 'threats' && (
            <div className="animate-in fade-in">
              <ThreatRadar
                fen={fen}
                playerColor={playerColor}
                onThreatArrowsChange={handleThreatArrows}
              />
            </div>
          )}

          {activeTool === 'candidates' && (
            <div className="animate-in fade-in">
              <CandidateMoveSpotter
                fen={fen}
                playerColor={playerColor}
                onPreviewMoveArrow={handleCandidateArrows}
                onSelectCandidateMove={onSelectCandidateMove}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

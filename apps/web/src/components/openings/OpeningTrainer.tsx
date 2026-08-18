import React, { useState, useEffect } from 'react';
import {
  PlayerModel,
  RepertoireItem,
  OpeningTacticalDrill,
  OpeningReportSummary,
  Square,
  PieceSymbol,
  Color
} from '../../types';
import { OPENING_TACTICAL_DRILLS, getDrillsForWeakestOpenings, generateOpeningReport } from '@tempo/openings';
import { ChessBoard } from '../chess/ChessBoard';
import { ChessGameWrapper } from '@tempo/chess';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import { AppStorage } from '../../database/storage';
import {
  Brain,
  Shield,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Flame,
  Award,
  Zap,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  BookOpen,
  Check,
  Compass,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OpeningTrainerProps {
  playerModel: PlayerModel;
  onUpdatePlayerModel?: (model: PlayerModel) => void;
  initialVariationId?: string;
  initialMode?: 'practice' | 'drill';
  onClose?: () => void;
}

export const OpeningTrainer: React.FC<OpeningTrainerProps> = ({
  playerModel,
  onUpdatePlayerModel,
  initialVariationId,
  initialMode = 'practice',
  onClose
}) => {
  const { tokens, boardTheme } = useTheme();

  // Mode: 'practice' (repertoire variations) or 'drill' (tactical trainer on weakest openings)
  const [activeMode, setActiveMode] = useState<'practice' | 'drill'>(initialMode);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Generate dynamic Opening Report findings
  const openingReport: OpeningReportSummary = generateOpeningReport(playerModel);
  const weakestEcos = openingReport.weakestOpenings.map(o => o.eco);

  // -------------------------------------------------------------
  // VARIATION PRACTICE STATE
  // -------------------------------------------------------------
  const repertoireList = playerModel.openingRepertoire || [];
  const [selectedRepertoireId, setSelectedRepertoireId] = useState<string>(
    initialVariationId || repertoireList[0]?.id || 'rep-white-ruy'
  );

  const activeRepertoire: RepertoireItem =
    repertoireList.find(r => r.id === selectedRepertoireId) || repertoireList[0];

  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [practiceFen, setPracticeFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [practiceFeedback, setPracticeFeedback] = useState<{
    status: 'idle' | 'correct' | 'incorrect' | 'completed';
    message: string;
  }>({ status: 'idle', message: '' });

  // -------------------------------------------------------------
  // TACTICAL DRILL TRAINER STATE (WEAKEST OPENINGS)
  // -------------------------------------------------------------
  const weakestDrills = getDrillsForWeakestOpenings(weakestEcos);
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);
  const [drillFen, setDrillFen] = useState<string>(
    weakestDrills[0]?.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [drillFeedback, setDrillFeedback] = useState<{
    status: 'idle' | 'correct' | 'incorrect';
    message: string;
  }>({ status: 'idle', message: '' });
  const [drillStreak, setDrillStreak] = useState<number>(0);
  const [showDrillHint, setShowDrillHint] = useState<boolean>(false);

  const activeDrill: OpeningTacticalDrill | undefined = weakestDrills[currentDrillIndex];

  // Initialize Practice Position when selection changes
  useEffect(() => {
    resetPracticeVariation();
  }, [selectedRepertoireId]);

  // Reset variation practice
  const resetPracticeVariation = () => {
    setCurrentMoveIndex(0);
    setPracticeFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setPracticeFeedback({
      status: 'idle',
      message: `Practice variation: ${activeRepertoire?.name || 'Opening'}. Play move 1: ${activeRepertoire?.movesSan[0] || 'e4'}`
    });
  };

  // Handle move in Variation Practice
  const handlePracticeMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (!activeRepertoire) return false;

    const game = new ChessGameWrapper(practiceFen);
    const move = game.makeMove(from, to, promotion);
    if (!move) return false;

    const expectedSan = activeRepertoire.movesSan[currentMoveIndex];
    if (!expectedSan) return false;

    const isMatch = move.san.toLowerCase() === expectedSan.toLowerCase();

    if (isMatch) {
      sounds.playMove();
      const nextMoveIndex = currentMoveIndex + 1;
      const nextFen = game.getFen();
      setPracticeFen(nextFen);
      setCurrentMoveIndex(nextMoveIndex);

      if (nextMoveIndex >= activeRepertoire.movesSan.length) {
        // Completed full repertoire variation!
        sounds.playSuccess();
        setPracticeFeedback({
          status: 'completed',
          message: `Variation mastered! You executed the complete ${activeRepertoire.movesSan.length}-move sequence of the ${activeRepertoire.name}.`
        });
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        // Update player model opening stats
        updateRepertoireScore(activeRepertoire.id, +5);
      } else {
        // Play opponent response if next move is opponent's turn
        const opponentMoveSan = activeRepertoire.movesSan[nextMoveIndex];
        setPracticeFeedback({
          status: 'correct',
          message: `Accurate! ${move.san} fits the ${activeRepertoire.name} blueprint.`
        });

        // Automatically make opponent move after brief delay
        setTimeout(() => {
          try {
            const oppGame = new ChessGameWrapper(nextFen);
            const legalMoves = oppGame.getLegalMoves();
            const matchingOppMove = legalMoves.find(m => m.san.toLowerCase() === opponentMoveSan.toLowerCase());
            if (matchingOppMove) {
              oppGame.makeMove(matchingOppMove.from, matchingOppMove.to, matchingOppMove.promotion);
              sounds.playMove();
              setPracticeFen(oppGame.getFen());
              const afterOppIndex = nextMoveIndex + 1;
              setCurrentMoveIndex(afterOppIndex);

              if (afterOppIndex < activeRepertoire.movesSan.length) {
                setPracticeFeedback({
                  status: 'idle',
                  message: `Opponent responded with ${opponentMoveSan}. Your turn: play move ${afterOppIndex + 1} (${activeRepertoire.movesSan[afterOppIndex]}).`
                });
              } else {
                setPracticeFeedback({
                  status: 'completed',
                  message: `Variation complete! Excellent execution of ${activeRepertoire.name}.`
                });
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
              }
            }
          } catch {
            // fallback
          }
        }, 400);
      }
      return true;
    } else {
      sounds.playBlunder();
      setPracticeFeedback({
        status: 'incorrect',
        message: `You played ${move.san}. The line calls for ${expectedSan}. Key plan: ${activeRepertoire.keyPlans[0] || 'Develop purposefully'}.`
      });
      return false;
    }
  };

  // Handle move in Tactical Drill
  const handleDrillMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (!activeDrill) return false;

    const game = new ChessGameWrapper(drillFen);
    const move = game.makeMove(from, to, promotion);
    if (!move) return false;

    setDrillFen(game.getFen());

    const isCorrect = activeDrill.correctMovesSan.some(
      san => san.toLowerCase() === move.san.toLowerCase()
    );

    if (isCorrect) {
      sounds.playSuccess();
      setDrillStreak(prev => prev + 1);
      setDrillFeedback({
        status: 'correct',
        message: activeDrill.coachExplanation
      });
      confetti({ particleCount: 45, spread: 50, origin: { y: 0.6 } });
    } else {
      sounds.playBlunder();
      setDrillStreak(0);
      setDrillFeedback({
        status: 'incorrect',
        message: `You played ${move.san}. Notice the tactical pattern: ${activeDrill.tacticalMotif}. Try again or request a coach hint.`
      });
    }
    return true;
  };

  const handleSelectDrill = (idx: number) => {
    setCurrentDrillIndex(idx);
    const drill = weakestDrills[idx];
    if (drill) {
      setDrillFen(drill.initialFen);
      setDrillFeedback({ status: 'idle', message: '' });
      setShowDrillHint(false);
    }
  };

  const handleResetDrill = () => {
    if (!activeDrill) return;
    setDrillFen(activeDrill.initialFen);
    setDrillFeedback({ status: 'idle', message: '' });
    setShowDrillHint(false);
  };

  const updateRepertoireScore = (repId: string, delta: number) => {
    const model = AppStorage.getPlayerModel();
    if (model.openingRepertoire) {
      const rep = model.openingRepertoire.find(r => r.id === repId);
      if (rep) {
        rep.memorizationPercentage = Math.min(100, rep.memorizationPercentage + delta);
        rep.understandingPercentage = Math.min(100, rep.understandingPercentage + delta);
        AppStorage.savePlayerModel(model);
        if (onUpdatePlayerModel) onUpdatePlayerModel(model);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Mode Bar */}
      <div className={`${tokens.cardBg} p-4 sm:p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Opening Mastery & Adaptive Trainer</span>
              </span>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                <span>View Opening Report</span>
              </button>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${tokens.appText} mt-1`}>
              Opening Variation Trainer
            </h2>
            <p className={`text-xs ${tokens.appTextMuted} mt-0.5`}>
              Practice targeted lines and drill tactical patterns tailored from your recent game evaluations.
            </p>
          </div>

          {/* Mode Switcher & Drill Launcher Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMode('practice')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'practice'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Practice Variations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('drill')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'drill'
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Drill Weakest Openings</span>
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} ${tokens.appTextMuted} hover:${tokens.appText} border ${tokens.btnSecondaryBorder}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Highlighted Weakest Opening Callout Banner */}
        {openingReport.weakestOpenings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <span className="font-bold text-amber-950 block">
                  Report Finding: Weakest System — {openingReport.weakestOpenings[0].name} ({openingReport.weakestOpenings[0].eco})
                </span>
                <span className="text-[11px] text-amber-900">
                  Win Rate: {openingReport.weakestOpenings[0].winRate}% • Priority: {openingReport.weakestOpenings[0].keyInsights[0] || 'Pawn structure timing'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveMode('drill');
              }}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Drill This Weakness Now</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: VARIATION PRACTICE */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Repertoire Variation Selector */}
          <div className="lg:col-span-4 space-y-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
              Repertoire Variations ({repertoireList.length})
            </span>

            <div className="space-y-2">
              {repertoireList.map(rep => {
                const isSelected = rep.id === activeRepertoire?.id;
                const isWeak = weakestEcos.includes(rep.eco);
                return (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => setSelectedRepertoireId(rep.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1 shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20'
                        : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-200`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                          {rep.eco}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {rep.color === 'w' ? 'As White' : 'As Black'}
                        </span>
                      </div>
                      {isWeak && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          Focus Area
                        </span>
                      )}
                    </div>

                    <span className={`text-xs font-bold ${tokens.appText} mt-0.5`}>
                      {rep.name}
                    </span>
                    <span className={`text-[11px] ${tokens.appTextMuted} line-clamp-1`}>
                      {rep.variation || rep.responseTo}
                    </span>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1">
                      <span>Recall Mastery</span>
                      <span className="text-emerald-700 font-mono">{rep.memorizationPercentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Practice Board & Sequence Coach */}
          {activeRepertoire && (
            <div className="lg:col-span-8 space-y-4">
              <div className={`${tokens.cardBg} p-4 sm:p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
                
                {/* Variation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {activeRepertoire.eco}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        {activeRepertoire.responseTo}
                      </span>
                    </div>
                    <h3 className={`text-base font-bold ${tokens.appText} mt-0.5`}>
                      {activeRepertoire.name}
                    </h3>
                  </div>

                  {/* Move Step Indicator */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Sequence Progress
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-700">
                      Move {currentMoveIndex} of {activeRepertoire.movesSan.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Chessboard */}
                  <div className="space-y-2">
                    <div className="aspect-square w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <ChessBoard
                        fen={practiceFen}
                        theme={boardTheme}
                        flipped={activeRepertoire.color === 'b'}
                        onMove={handlePracticeMove}
                        isInteractive={practiceFeedback.status !== 'completed'}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={resetPracticeVariation}
                        className={`px-3 py-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1.5 font-bold transition`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restart Line</span>
                      </button>

                      <span className="text-slate-500 font-medium">
                        Playing as {activeRepertoire.color === 'w' ? 'White' : 'Black'}
                      </span>
                    </div>
                  </div>

                  {/* Sequence Guide & Principle Annotations */}
                  <div className="space-y-3">
                    {/* Full Move Sequence Stepper */}
                    <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-2`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Master Move Sequence:
                      </span>
                      <div className="flex flex-wrap gap-1 font-mono text-xs">
                        {activeRepertoire.movesSan.map((mv, i) => {
                          const isDone = i < currentMoveIndex;
                          const isCurrent = i === currentMoveIndex;
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded border transition ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-2xs animate-pulse'
                                  : isDone
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              {i + 1}. {mv}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback and Coach Guidance */}
                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                      practiceFeedback.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : practiceFeedback.status === 'incorrect'
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : `${tokens.cardBg} border ${tokens.cardBorder} ${tokens.appText}`
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        <Brain className="w-4 h-4 text-emerald-600" />
                        <span>Coach Advice:</span>
                      </div>
                      <p>{practiceFeedback.message}</p>
                    </div>

                    {/* Strategic Directives */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                        Core Directives for this Line
                      </span>
                      <ul className="text-xs space-y-1 list-disc list-inside text-slate-800">
                        {activeRepertoire.keyPlans.map((plan, idx) => (
                          <li key={idx}>{plan}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: SIMPLIFIED TACTICAL TRAINER (WEAKEST OPENINGS) */}
      {/* ------------------------------------------------------------- */}
      {activeMode === 'drill' && (
        <div className="space-y-4">
          <div className={`${tokens.cardBg} p-4 sm:p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
            {/* Tactical Trainer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    Weakness Drill #{currentDrillIndex + 1} of {weakestDrills.length}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {activeDrill?.eco} • {activeDrill?.openingName}
                  </span>
                </div>
                <h3 className={`text-base sm:text-lg font-bold ${tokens.appText} mt-1`}>
                  {activeDrill?.variationName}: {activeDrill?.theme}
                </h3>
              </div>

              {/* Streak Tracker */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Current Drill Streak: {drillStreak}</span>
              </div>
            </div>

            {/* Drill Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {weakestDrills.map((drill, idx) => (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => handleSelectDrill(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    idx === currentDrillIndex
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Drill {idx + 1}: {drill.openingName}
                </button>
              ))}
            </div>

            {activeDrill && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                {/* Chess Board */}
                <div className="space-y-2">
                  <div className="aspect-square w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <ChessBoard
                      fen={drillFen}
                      theme={boardTheme}
                      flipped={activeDrill.playerColor === 'b'}
                      onMove={handleDrillMove}
                      isInteractive={drillFeedback.status !== 'correct'}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={handleResetDrill}
                      className={`px-3 py-1 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1 font-bold`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Position</span>
                    </button>

                    <span className="text-slate-600 font-bold text-xs">
                      Turn: {activeDrill.playerColor === 'w' ? 'White to Move' : 'Black to Move'}
                    </span>
                  </div>
                </div>

                {/* Socratic Drill Challenge & Feedback */}
                <div className="space-y-3">
                  <div className={`${tokens.pillBg} p-4 rounded-xl border ${tokens.pillBorder} space-y-1.5`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                      Tactical Opening Challenge
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {activeDrill.tacticalMotif}
                    </p>
                  </div>

                  {/* Hint Toggle */}
                  <div className="space-y-1.5">
                    {!showDrillHint ? (
                      <button
                        type="button"
                        onClick={() => setShowDrillHint(true)}
                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1.5"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Need a hint? Click here</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
                        💡 Coach Hint: {activeDrill.hint}
                      </div>
                    )}
                  </div>

                  {/* Drill Feedback Result */}
                  {drillFeedback.message && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                      drillFeedback.status === 'correct'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {drillFeedback.status === 'correct' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{drillFeedback.status === 'correct' ? 'Solved!' : 'Coach Reflection'}</span>
                      </div>
                      <p>{drillFeedback.message}</p>

                      {drillFeedback.status === 'correct' && currentDrillIndex < weakestDrills.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleSelectDrill(currentDrillIndex + 1)}
                          className="mt-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Next Weakness Drill</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OPENING REPORT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between bg-emerald-50/80 border-emerald-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${tokens.appText}`}>
                    Your Comprehensive Opening Report
                  </h3>
                  <p className={`text-xs ${tokens.appTextMuted}`}>
                    Diagnostic analysis of your openings across all games
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.appTextMuted} hover:${tokens.appText}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Score Bar */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Overall Score</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">{openingReport.overallScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Win Rate (White)</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{openingReport.winRateAsWhite}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Win Rate (Black)</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{openingReport.winRateAsBlack}%</span>
                </div>
              </div>

              {/* Weakest Openings Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Weakest Openings (Require Urgent Practice)</span>
                </span>
                <div className="space-y-2">
                  {openingReport.weakestOpenings.map((weak, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{weak.name} ({weak.eco})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                          {weak.winRate}% Win Rate
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700">
                        {weak.keyInsights[0] || 'Requires structured understanding of central pawn breaks'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strongest Openings */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Strongest Repertoires</span>
                </span>
                <div className="space-y-2">
                  {openingReport.strongestOpenings.map((strong, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{strong.name} ({strong.eco})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          {strong.winRate}% Win Rate
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700">
                        {strong.keyInsights[0] || 'Solid piece development and harmonious piece coordination'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Vulnerabilities */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Identified Recurring Vulnerabilities
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-800">
                  {openingReport.commonVulnerabilities.map((vuln, i) => (
                    <li key={i}>{vuln}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close Report
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setActiveMode('drill');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Launch Weakest Opening Drills</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

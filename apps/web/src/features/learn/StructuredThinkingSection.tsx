import React, { useState } from 'react';
import { ThinkingFrameworkStep, ThinkingExercise, Square, PieceSymbol } from '../../types';
import { THINKING_FRAMEWORK_STEPS, STRUCTURED_THINKING_EXERCISES } from '@tempo/coaching';
import { ChessBoard } from '../../components/chess/ChessBoard';
import { ChessGameWrapper } from '@tempo/chess';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Shield,
  Layers,
  Award,
  HelpCircle,
  Eye,
  Crosshair,
  Compass,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StructuredThinkingSection: React.FC = () => {
  const { tokens, boardTheme } = useTheme();
  const [activeStepTab, setActiveStepTab] = useState<number>(0);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);
  const [exerciseFen, setExerciseFen] = useState<string>(STRUCTURED_THINKING_EXERCISES[0]?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'correct' | 'incorrect';
    message: string;
  }>({ status: 'idle', message: '' });

  const activeExercise = STRUCTURED_THINKING_EXERCISES[selectedExerciseIndex];

  const handleSelectExercise = (index: number) => {
    setSelectedExerciseIndex(index);
    setExerciseFen(STRUCTURED_THINKING_EXERCISES[index].fen);
    setSelectedOptionIndex(null);
    setSelectedCandidateIndex(null);
    setFeedback({ status: 'idle', message: '' });
  };

  const handleOptionSelect = (idx: number) => {
    setSelectedOptionIndex(idx);
    if (!activeExercise) return;

    if (idx === activeExercise.correctOptionIndex) {
      sounds.playSuccess();
      setFeedback({
        status: 'correct',
        message: activeExercise.coachExplanation
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      sounds.playBlunder();
      setFeedback({
        status: 'incorrect',
        message: `Look closer at what changes on the board. ${activeExercise.question}`
      });
    }
  };

  const handleCandidateSelect = (idx: number) => {
    setSelectedCandidateIndex(idx);
    if (!activeExercise || !activeExercise.candidateMoves) return;
    const cand = activeExercise.candidateMoves[idx];

    if (cand.quality === 'best') {
      sounds.playSuccess();
      setFeedback({
        status: 'correct',
        message: `Master Choice! ${cand.moveSan}: ${cand.description} Takeaway: ${cand.strategicValue}`
      });
    } else {
      sounds.playMove();
      setFeedback({
        status: 'incorrect',
        message: `${cand.moveSan} is ${cand.quality}: ${cand.description} Counter-threat: ${cand.counterThreats}`
      });
    }
  };

  const handleBoardMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (!activeExercise) return;

    const game = new ChessGameWrapper(exerciseFen);
    const move = game.makeMove(from, to, promotion);
    if (!move) return;

    setExerciseFen(game.getFen());

    if (activeExercise.correctMovesSan) {
      const isCorrect = activeExercise.correctMovesSan.some(
        m => m.toLowerCase() === move.san.toLowerCase()
      );

      if (isCorrect) {
        sounds.playSuccess();
        setFeedback({
          status: 'correct',
          message: activeExercise.coachExplanation
        });
      } else {
        sounds.playBlunder();
        setFeedback({
          status: 'incorrect',
          message: `You played ${move.san}. Remember the rule: ${activeExercise.mentalTakeaway}`
        });
      }
    }
  };

  const handleReset = () => {
    if (!activeExercise) return;
    setExerciseFen(activeExercise.fen);
    setSelectedOptionIndex(null);
    setSelectedCandidateIndex(null);
    setFeedback({ status: 'idle', message: '' });
  };

  return (
    <div className="space-y-5">
      {/* Title Banner */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className={`text-base font-bold ${tokens.appText} flex items-center gap-2`}>
          <Brain className="w-5 h-5 text-emerald-600" />
          <span>Structured Thinking Framework (7-Step Method)</span>
        </h2>
        <p className={`text-xs ${tokens.appTextMuted} mt-0.5`}>
          Replace impulsive intuition with the deliberate cognitive checklist of master chess players.
        </p>
      </div>

      {/* 7-Step Framework Carousel / Accordion */}
      <div className="space-y-2">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
          The 7-Step Thinking Algorithm
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {THINKING_FRAMEWORK_STEPS.map((step, idx) => {
            const isActive = idx === activeStepTab;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepTab(idx)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between min-h-[78px] shadow-2xs ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-300`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    #{step.stepNumber}
                  </span>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-xs font-bold leading-tight line-clamp-2 mt-1 ${
                  isActive ? 'text-white' : tokens.appText
                }`}>
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Details */}
        <div className={`${tokens.cardBg} p-4 rounded-xl border ${tokens.cardBorder} space-y-2 shadow-2xs`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Step {THINKING_FRAMEWORK_STEPS[activeStepTab].stepNumber}: {THINKING_FRAMEWORK_STEPS[activeStepTab].name}
            </span>
            <span className="text-xs font-bold text-slate-500">
              "{THINKING_FRAMEWORK_STEPS[activeStepTab].shortPrompt}"
            </span>
          </div>
          <p className={`text-xs ${tokens.appText} leading-relaxed`}>
            {THINKING_FRAMEWORK_STEPS[activeStepTab].guidance}
          </p>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Question to ask yourself: "{THINKING_FRAMEWORK_STEPS[activeStepTab].questionToAskSelf}"</span>
          </div>
        </div>
      </div>

      {/* Interactive Thinking Exercises */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
            Interactive Thinking Drills ({STRUCTURED_THINKING_EXERCISES.length})
          </span>
          <div className="flex gap-1">
            {STRUCTURED_THINKING_EXERCISES.map((ex, i) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(i)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  i === selectedExerciseIndex
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder}`
                }`}
              >
                Drill {i + 1}
              </button>
            ))}
          </div>
        </div>

        {activeExercise && (
          <div className={`${tokens.cardBg} p-4 sm:p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {activeExercise.theme.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeExercise.scenarioDescription}
                </span>
              </div>
              <h3 className={`text-sm sm:text-base font-bold ${tokens.appText} mt-1`}>
                {activeExercise.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Chessboard */}
              <div className="space-y-2">
                <div className="aspect-square w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <ChessBoard
                    fen={exerciseFen}
                    theme={boardTheme}
                    flipped={activeExercise.playerColor === 'b'}
                    onMove={handleBoardMove}
                    isInteractive={activeExercise.correctMovesSan !== undefined}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`px-3 py-1 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1 font-bold`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Board</span>
                  </button>
                  <span className="text-slate-500 font-medium text-[11px]">
                    Turn: {activeExercise.playerColor === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
              </div>

              {/* Drill Question & Option Selector */}
              <div className="space-y-3">
                <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Structured Thinking Question
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {activeExercise.question}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                {activeExercise.options && (
                  <div className="space-y-2">
                    {activeExercise.options.map((opt, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const isCorrect = isSelected && idx === activeExercise.correctOptionIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center justify-between shadow-2xs ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                : 'bg-rose-50 border-rose-400 text-rose-950'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-200'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && (
                            isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Candidate Move Cards */}
                {activeExercise.candidateMoves && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Compare the 3 Candidate Options:
                    </span>
                    {activeExercise.candidateMoves.map((cand, idx) => {
                      const isSelected = selectedCandidateIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCandidateSelect(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition flex flex-col gap-1 shadow-2xs ${
                            isSelected
                              ? cand.quality === 'best'
                                ? 'bg-emerald-50 border-emerald-400'
                                : 'bg-amber-50 border-amber-300'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm text-slate-900">
                              {cand.moveSan}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                              cand.quality === 'best'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cand.quality === 'playable'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {cand.quality}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700">{cand.description}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback Box */}
                {feedback.message && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Brain className="w-4 h-4 text-emerald-600" />
                      <span>{feedback.status === 'correct' ? 'Coach Verdict: Master Choice' : 'Coach Guidance:'}</span>
                    </div>
                    <p>{feedback.message}</p>
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 font-bold text-emerald-900">
                      Mental Rule: "{activeExercise.mentalTakeaway}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

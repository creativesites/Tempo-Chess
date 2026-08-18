import React, { useState } from 'react';
import { DailyTrainingPlan, TrainingExercise, PlayerModel, Square, PieceSymbol } from '../../types';
import { ChessBoard } from '../../components/chess/ChessBoard';
import { ChessGameWrapper } from '../../chess/rules';
import { AppStorage } from '../../database/storage';
import { sounds } from '../../utils/audio';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  CheckCircle2,
  Brain,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Award,
  Flame,
  RefreshCw,
  Compass,
  Layers,
  Shield,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { OpeningAcademySection } from './OpeningAcademySection';
import { StructuredThinkingSection } from './StructuredThinkingSection';
import { RepertoireSection } from './RepertoireSection';
import { OpeningTrainer } from '../../components/openings/OpeningTrainer';
import { OpeningExplorerSection } from './OpeningExplorerSection';

interface LearnScreenProps {
  dailyTraining: DailyTrainingPlan;
  onUpdateDailyTraining: (plan: DailyTrainingPlan) => void;
  playerModel?: PlayerModel;
  onUpdatePlayerModel?: (model: PlayerModel) => void;
}

type LearnTab = 'daily' | 'explorer' | 'openings' | 'trainer' | 'thinking' | 'repertoire';

export const LearnScreen: React.FC<LearnScreenProps> = ({
  dailyTraining,
  onUpdateDailyTraining,
  playerModel = AppStorage.getPlayerModel(),
  onUpdatePlayerModel
}) => {
  const { tokens, boardTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<LearnTab>('daily');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [exerciseFen, setExerciseFen] = useState<string>(
    dailyTraining.exercises[0]?.initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const currentExercise: TrainingExercise | undefined = dailyTraining.exercises[activeExerciseIndex];

  const handleSelectExercise = (index: number) => {
    setActiveExerciseIndex(index);
    setExerciseFen(dailyTraining.exercises[index].initialFen);
    setHintLevel(0);
    setFeedbackState('idle');
    setFeedbackMessage('');
  };

  const handleExerciseMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (!currentExercise) return;

    const game = new ChessGameWrapper(exerciseFen);
    const move = game.makeMove(from, to, promotion);

    if (!move) return;

    // Check if played SAN is in correct moves list
    const isCorrect = currentExercise.correctMovesSan.some(
      san => san.toLowerCase() === move.san.toLowerCase()
    );

    if (isCorrect) {
      sounds.playSuccess();
      setExerciseFen(game.getFen());
      setFeedbackState('correct');
      setFeedbackMessage(currentExercise.explanation);

      // Mark exercise as completed
      if (!dailyTraining.completedExerciseIds.includes(currentExercise.id)) {
        const updatedCompleted = [...dailyTraining.completedExerciseIds, currentExercise.id];
        const isAllDone = updatedCompleted.length === dailyTraining.exercises.length;

        const updatedPlan: DailyTrainingPlan = {
          ...dailyTraining,
          completedExerciseIds: updatedCompleted,
          isCompleted: isAllDone
        };

        AppStorage.saveDailyTraining(updatedPlan);
        onUpdateDailyTraining(updatedPlan);

        if (isAllDone) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } else {
      sounds.playBlunder();
      setFeedbackState('incorrect');
      setFeedbackMessage(
        `Good attempt with ${move.san}, but look closer at the priority: ${currentExercise.weaknessAddressed}. Try again or request a hint.`
      );
    }
  };

  const handleResetCurrent = () => {
    if (!currentExercise) return;
    setExerciseFen(currentExercise.initialFen);
    setFeedbackState('idle');
    setFeedbackMessage('');
  };

  const completedCount = dailyTraining.completedExerciseIds.length;
  const totalCount = dailyTraining.exercises.length;
  const isAllComplete = completedCount === totalCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header & Sub-Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${tokens.pillBg} border ${tokens.pillBorder} text-emerald-800 flex items-center gap-1.5`}>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offline Chess Improvement Academy</span>
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold ${tokens.appText} tracking-tight mt-1`}>
              Training & Master Curriculum
            </h1>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Today’s Coach Plan</span>
            {isAllComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-mono">
                {completedCount}/{totalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>Opening Explorer & Repertoire</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('openings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'openings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Opening Academy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trainer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'trainer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Opening Trainer & Drills</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('thinking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'thinking'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>7-Step Structured Thinking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repertoire')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'repertoire'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>My Repertoire</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY COACH PLAN */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-4 sm:p-5 rounded-2xl shadow-2xs space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tokens.pillBg} border ${tokens.pillBorder} text-emerald-800`}>
                    Personalized Session • ~{dailyTraining.estimatedMinutes} min
                  </span>
                  <span className={`text-xs ${tokens.appTextMuted}`}>{dailyTraining.date}</span>
                </div>
                <h2 className={`text-lg font-bold ${tokens.appText} mt-1`}>
                  {dailyTraining.themeTitle}
                </h2>
                <p className={`text-xs ${tokens.appTextMuted} mt-0.5 leading-relaxed`}>
                  {dailyTraining.themeDescription}
                </p>
              </div>

              {/* Progress Pill */}
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${tokens.pillBg} border ${tokens.pillBorder} shrink-0`}>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                    Session Progress
                  </span>
                  <span className={`text-sm font-bold ${tokens.appText} font-mono`}>
                    {completedCount} of {totalCount} drills
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {Math.round((completedCount / totalCount) * 100)}%
                </div>
              </div>
            </div>

            {/* Exercise Selector Carousel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {dailyTraining.exercises.map((ex, idx) => {
                const isSelected = idx === activeExerciseIndex;
                const isDone = dailyTraining.completedExerciseIds.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleSelectExercise(idx)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20'
                        : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-200`
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
                        Drill #{idx + 1}
                      </span>
                      <span className={`text-xs font-bold ${tokens.appText} line-clamp-1`}>
                        {ex.title}
                      </span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Training Board & Socratic Card */}
          {currentExercise && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Chess Board Column */}
              <div className="lg:col-span-6 flex flex-col items-center space-y-3">
                <div className="w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-md border border-slate-200">
                  <ChessBoard
                    fen={exerciseFen}
                    theme={boardTheme}
                    flipped={currentExercise.playerTurn === 'b'}
                    onMove={handleExerciseMove}
                    isInteractive={feedbackState !== 'correct'}
                  />
                </div>

                <div className="w-full max-w-[420px] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleResetCurrent}
                    className={`px-3 py-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1.5 font-bold transition`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Board</span>
                  </button>

                  <span className={`text-xs font-bold ${tokens.appTextMuted}`}>
                    Turn: {currentExercise.playerTurn === 'w' ? 'White to move' : 'Black to move'}
                  </span>
                </div>
              </div>

              {/* Coach Socratic Card Column */}
              <div className="lg:col-span-6 space-y-4">
                <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-4 sm:p-5 rounded-2xl shadow-2xs space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full`}>
                      Focus: {currentExercise.weaknessAddressed}
                    </span>
                    <span className={`text-xs font-mono font-bold ${tokens.appTextSubtle}`}>
                      Exercise {activeExerciseIndex + 1} of {totalCount}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold ${tokens.appText}`}>
                    {currentExercise.title}
                  </h3>

                  <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-1.5`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                      Coach Question
                    </span>
                    <p className={`text-xs sm:text-sm font-medium ${tokens.appText} leading-relaxed`}>
                      {currentExercise.promptQuestion}
                    </p>
                  </div>

                  {/* Progressive Hint Drawer */}
                  <div className="space-y-2">
                    {hintLevel === 0 ? (
                      <button
                        type="button"
                        onClick={() => setHintLevel(1)}
                        className={`text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1.5 transition`}
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Request Coach Hint</span>
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span className="flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                            <span>Coach Hint</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setHintLevel(0)}
                            className="text-amber-700 hover:text-amber-900 text-[11px]"
                          >
                            Hide
                          </button>
                        </div>
                        <p className="text-amber-950 font-medium leading-relaxed">
                          {currentExercise.hint}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback State Display */}
                  {feedbackState !== 'idle' && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 transition ${
                      feedbackState === 'correct'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {feedbackState === 'correct' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{feedbackState === 'correct' ? 'Master Move Found!' : 'Coach Reflection'}</span>
                      </div>
                      <p>{feedbackMessage}</p>

                      {feedbackState === 'correct' && activeExerciseIndex < totalCount - 1 && (
                        <button
                          type="button"
                          onClick={() => handleSelectExercise(activeExerciseIndex + 1)}
                          className={`mt-2 px-3 py-1.5 ${tokens.accentPrimary} ${tokens.accentPrimaryHover} text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs`}
                        >
                          <span>Proceed to Next Drill</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPENING EXPLORER & PERSONALIZED REPERTOIRE */}
      {activeTab === 'explorer' && (
        <OpeningExplorerSection
          playerModel={playerModel}
          onUpdatePlayerModel={onUpdatePlayerModel}
        />
      )}

      {/* TAB 3: OPENING ACADEMY */}
      {activeTab === 'openings' && (
        <OpeningAcademySection />
      )}

      {/* TAB 3: OPENING TRAINER & DRILLS */}
      {activeTab === 'trainer' && (
        <OpeningTrainer
          playerModel={playerModel}
          onUpdatePlayerModel={onUpdatePlayerModel}
        />
      )}

      {/* TAB 4: STRUCTURED THINKING */}
      {activeTab === 'thinking' && (
        <StructuredThinkingSection />
      )}

      {/* TAB 4: MY REPERTOIRE */}
      {activeTab === 'repertoire' && (
        <RepertoireSection playerModel={playerModel} />
      )}
    </div>
  );
};

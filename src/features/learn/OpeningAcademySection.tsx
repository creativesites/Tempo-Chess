import React, { useState } from 'react';
import { OpeningLesson, OpeningTreeNode, Color, Square, PieceSymbol } from '../../types';
import { STRUCTURED_OPENING_LESSONS } from '../../chess/openingLessons';
import { OPENING_TREES } from '../../chess/openingTree';
import { ChessBoard } from '../../components/chess/ChessBoard';
import { ChessGameWrapper } from '../../chess/rules';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import {
  BookOpen,
  CheckCircle2,
  Brain,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Shield,
  Layers,
  Award,
  Compass,
  Play,
  HelpCircle,
  TrendingUp,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OpeningAcademySection: React.FC = () => {
  const { tokens, boardTheme } = useTheme();
  const [selectedLesson, setSelectedLesson] = useState<OpeningLesson>(STRUCTURED_OPENING_LESSONS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [boardFen, setBoardFen] = useState<string>(STRUCTURED_OPENING_LESSONS[0].steps[0]?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'correct' | 'incorrect';
    message: string;
  }>({ status: 'idle', message: '' });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [selectedTree, setSelectedTree] = useState<OpeningTreeNode>(OPENING_TREES[0]);
  const [academyMode, setAcademyMode] = useState<'lessons' | 'tree'>('lessons');

  const currentStep = selectedLesson.steps[currentStepIndex];

  const handleSelectLesson = (lesson: OpeningLesson) => {
    setSelectedLesson(lesson);
    setCurrentStepIndex(0);
    setBoardFen(lesson.steps[0]?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setFeedback({ status: 'idle', message: '' });
    setShowHint(false);
  };

  const handleStepChange = (index: number) => {
    setCurrentStepIndex(index);
    const step = selectedLesson.steps[index];
    if (step) {
      setBoardFen(step.fen);
      setFeedback({ status: 'idle', message: '' });
      setShowHint(false);
    }
  };

  const handleBoardMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (!currentStep) return;

    const game = new ChessGameWrapper(boardFen);
    const move = game.makeMove(from, to, promotion);
    if (!move) return;

    setBoardFen(game.getFen());

    if (currentStep.expectedMoveSan) {
      const isExpected = currentStep.expectedMoveSan.some(
        san => san.toLowerCase() === move.san.toLowerCase()
      );

      if (isExpected) {
        sounds.playSuccess();
        setFeedback({
          status: 'correct',
          message: currentStep.explanationAfterMove || `Correct! ${move.san} is the principled move.`
        });
        if (currentStepIndex === selectedLesson.steps.length - 1) {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        }
      } else {
        sounds.playBlunder();
        setFeedback({
          status: 'incorrect',
          message: `You played ${move.san}. While legal, look closer at the opening priority: ${currentStep.hint || 'Develop minor pieces and secure the center'}.`
        });
      }
    }
  };

  const handleResetStep = () => {
    if (!currentStep) return;
    setBoardFen(currentStep.fen);
    setFeedback({ status: 'idle', message: '' });
    setShowHint(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Academy Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className={`text-base font-bold ${tokens.appText} flex items-center gap-2`}>
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>Opening Academy (3-Layer Architecture)</span>
          </h2>
          <p className={`text-xs ${tokens.appTextMuted} mt-0.5`}>
            Recognition • Strategic Understanding • Interactive Board Application
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAcademyMode('lessons')}
            className={`px-3 py-1.5 rounded-lg transition ${
              academyMode === 'lessons'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Lessons
          </button>
          <button
            type="button"
            onClick={() => setAcademyMode('tree')}
            className={`px-3 py-1.5 rounded-lg transition ${
              academyMode === 'tree'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Opening Tree Explorer
          </button>
        </div>
      </div>

      {academyMode === 'lessons' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Lesson Selector */}
          <div className="lg:col-span-4 space-y-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
              Available Master Lessons
            </span>
            <div className="space-y-2">
              {STRUCTURED_OPENING_LESSONS.map(lesson => {
                const isSelected = lesson.id === selectedLesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1 shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20'
                        : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-200`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                        {lesson.eco}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Layer {lesson.layer}: Understanding
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${tokens.appText} mt-0.5`}>
                      {lesson.openingName}
                    </span>
                    <span className={`text-[11px] ${tokens.appTextMuted} line-clamp-1`}>
                      {lesson.variationName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Lesson Board & Socratic Steps */}
          <div className="lg:col-span-8 space-y-4">
            <div className={`${tokens.cardBg} p-4 sm:p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
              
              {/* Step Progress Tracker */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    {selectedLesson.openingName} ({selectedLesson.eco})
                  </span>
                  <h3 className={`text-sm font-bold ${tokens.appText}`}>
                    Step {currentStepIndex + 1} of {selectedLesson.steps.length}: {currentStep.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedLesson.steps.map((st, idx) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStepChange(idx)}
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition ${
                        idx === currentStepIndex
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : idx < currentStepIndex
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Chess Board */}
                <div className="space-y-2">
                  <div className="aspect-square w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <ChessBoard
                      fen={boardFen}
                      theme={boardTheme}
                      flipped={currentStep.playerColor === 'b'}
                      onMove={handleBoardMove}
                      isInteractive={currentStep.type === 'interactive_move' || currentStep.type === 'deviation_handling' || currentStep.type === 'socratic_question'}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={handleResetStep}
                      className={`px-3 py-1 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1 font-bold`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Position</span>
                    </button>

                    {currentStep.hint && (
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>{showHint ? 'Hide Hint' : 'Show Coach Hint'}</span>
                      </button>
                    )}
                  </div>

                  {showHint && currentStep.hint && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                      💡 Hint: {currentStep.hint}
                    </div>
                  )}
                </div>

                {/* Socratic Teaching Card */}
                <div className="space-y-3">
                  <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-1.5`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Core Chess Principle
                    </span>
                    <h4 className={`text-xs font-bold ${tokens.appText}`}>
                      {currentStep.heading}
                    </h4>
                    <p className={`text-xs ${tokens.appText} leading-relaxed`}>
                      {currentStep.content}
                    </p>
                  </div>

                  {currentStep.question && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        Your Mission
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {currentStep.question}
                      </p>
                    </div>
                  )}

                  {/* Feedback Box */}
                  {feedback.message && (
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      feedback.status === 'correct'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        {feedback.status === 'correct' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{feedback.status === 'correct' ? 'Master Move!' : 'Coach Reflection'}</span>
                      </div>
                      <p>{feedback.message}</p>
                    </div>
                  )}

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={currentStepIndex === 0}
                      onClick={() => handleStepChange(currentStepIndex - 1)}
                      className={`px-3 py-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} disabled:opacity-30 border ${tokens.btnSecondaryBorder} text-xs font-bold flex items-center gap-1`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentStepIndex === selectedLesson.steps.length - 1}
                      onClick={() => handleStepChange(currentStepIndex + 1)}
                      className={`px-4 py-1.5 ${tokens.accentPrimary} ${tokens.accentPrimaryHover} text-white disabled:opacity-30 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs`}
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Plans & Pawn Breaks Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Strategic Plans for White
                  </span>
                  <ul className="text-xs space-y-0.5 list-disc list-inside text-slate-800">
                    {selectedLesson.keyPlansWhite.map((plan, i) => (
                      <li key={i}>{plan}</li>
                    ))}
                  </ul>
                </div>

                <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Strategic Plans for Black
                  </span>
                  <ul className="text-xs space-y-0.5 list-disc list-inside text-slate-800">
                    {selectedLesson.keyPlansBlack.map((plan, i) => (
                      <li key={i}>{plan}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OPENING TREE EXPLORER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Tree Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
              Opening Tree Archetypes
            </span>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {OPENING_TREES.map(tree => {
                const isSelected = tree.id === selectedTree.id;
                return (
                  <div key={tree.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTree(tree)}
                      className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-0.5 shadow-2xs ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20'
                          : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-200`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{tree.name}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{tree.eco}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{tree.variation}</span>
                    </button>

                    {/* Children branches */}
                    {tree.children && tree.children.length > 0 && (
                      <div className="pl-4 space-y-1 border-l-2 border-slate-200 ml-2">
                        {tree.children.map(child => {
                          const isChildSelected = child.id === selectedTree.id;
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => setSelectedTree(child)}
                              className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition ${
                                isChildSelected
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tree Detail Viewer */}
          <div className="lg:col-span-8 space-y-4">
            <div className={`${tokens.cardBg} p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedTree.eco}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    Moves: {selectedTree.movesSan.join(' ')}
                  </span>
                </div>
                <h3 className={`text-lg font-bold ${tokens.appText} mt-1`}>
                  {selectedTree.name} — {selectedTree.variation}
                </h3>
              </div>

              {/* Core Idea */}
              <div className={`${tokens.pillBg} p-4 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Core Architectural Concept
                </span>
                <p className={`text-xs ${tokens.appText} leading-relaxed`}>
                  {selectedTree.coreIdea}
                </p>
              </div>

              {/* Strategic Battle Plans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    White’s Master Plans
                  </span>
                  <ul className="text-xs space-y-1 list-disc list-inside text-slate-800">
                    {selectedTree.strategicPlans.white.map((plan, idx) => (
                      <li key={idx}>{plan}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Black’s Counter Plans
                  </span>
                  <ul className="text-xs space-y-1 list-disc list-inside text-slate-800">
                    {selectedTree.strategicPlans.black.map((plan, idx) => (
                      <li key={idx}>{plan}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pawn Structure & Tactical Motifs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Pawn Structure & Critical Breaks
                  </span>
                  <p className="text-xs font-semibold text-slate-900">{selectedTree.pawnStructure}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTree.pawnBreaks.map((pb, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                        {pb}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                    Common Tactical Motifs
                  </span>
                  <ul className="text-xs space-y-0.5 list-disc list-inside text-slate-800">
                    {selectedTree.tacticalMotifs.map((motif, i) => (
                      <li key={i}>{motif}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Transition to Middlegame */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Transition to Middlegame
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {selectedTree.transitionToMiddlegame}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

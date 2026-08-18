import React, { useState } from 'react';
import { GameReview, CriticalMoment, Color, Square, PieceSymbol, ChessMove } from '../../types';
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Award,
  Play,
  Copy,
  Check,
  FileText,
  Database,
  RotateCcw,
  ChevronRight,
  HelpCircle,
  BarChart2,
  BookOpen,
  Target,
  Shield,
  Layers,
  ListOrdered,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ChessBoard } from '../chess/ChessBoard';
import { ChessGameWrapper } from '../../chess/rules';
import { InteractiveAnnotatedMoveList } from './InteractiveAnnotatedMoveList';

interface PostGameReviewModalProps {
  review: GameReview;
  onClose: () => void;
  onPlayAgain: () => void;
  onExploreMoment?: (moment: CriticalMoment) => void;
  moveHistory?: ChessMove[];
}

type ReviewTab = 'narrative' | 'moments' | 'movelist' | 'scorecard' | 'repertoire';

export const PostGameReviewModal: React.FC<PostGameReviewModalProps> = ({
  review,
  onClose,
  onPlayAgain,
  onExploreMoment,
  moveHistory = []
}) => {
  const [activeTab, setActiveTab] = useState<ReviewTab>('narrative');
  const [selectedMomentIndex, setSelectedMomentIndex] = useState(0);
  const [showPgn, setShowPgn] = useState(false);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const { tokens, boardTheme } = useTheme();

  // Try Again Interactive Mode State
  const [isTryAgainMode, setIsTryAgainMode] = useState<boolean>(false);
  const [tryAgainFeedback, setTryAgainFeedback] = useState<{
    status: 'idle' | 'success' | 'incorrect';
    message: string;
  }>({ status: 'idle', message: '' });
  const [tryAgainFen, setTryAgainFen] = useState<string>('');

  const isWin = review.result === 'win';
  const isLoss = review.result === 'loss';

  const moments = review.moments || [];
  const activeMoment = moments[selectedMomentIndex];

  const handleCopyPgn = () => {
    if (review.pgn) {
      navigator.clipboard.writeText(review.pgn);
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    }
  };

  const startTryAgain = (moment: CriticalMoment) => {
    setIsTryAgainMode(true);
    setTryAgainFen(moment.fenBefore || moment.position || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setTryAgainFeedback({
      status: 'idle',
      message: `You played ${moment.playedMove}. What move would you play now?`
    });
  };

  const handleTryAgainMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (!activeMoment) return false;
    try {
      const wrapper = new ChessGameWrapper(tryAgainFen);
      const move = wrapper.makeMove(from, to, promotion);
      if (!move) return false;

      setTryAgainFen(wrapper.getFen());

      const bestMoves = activeMoment.bestMoves || [activeMoment.bestMove];
      const isCorrect = bestMoves.some(m => m.toLowerCase() === move.san.toLowerCase()) ||
        (activeMoment.retrySolutionMoves && activeMoment.retrySolutionMoves.some(m => m.toLowerCase() === move.san.toLowerCase()));

      if (isCorrect) {
        setTryAgainFeedback({
          status: 'success',
          message: activeMoment.retrySuccessExplanation ||
            `Brilliant! ${move.san} is the master move. You identified the positional requirement and secured the position.`
        });
      } else {
        setTryAgainFeedback({
          status: 'incorrect',
          message: `You played ${move.san}. Notice the tension on the board: look for ${activeMoment.retryHint || 'a move that develops and secures king safety'}.`
        });
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
        
        {/* Top Header Banner */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isWin ? 'bg-emerald-50/80 border-emerald-200' : isLoss ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              isWin ? 'bg-emerald-600 text-white border-emerald-700' : isLoss ? 'bg-amber-600 text-white border-amber-700' : 'bg-slate-700 text-white border-slate-800'
            }`}>
              {isWin ? <Trophy className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isWin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isWin ? 'Victory Review' : 'Deep Coaching Review'}
                </span>
                <span className={`text-xs ${tokens.appTextMuted}`}>• {review.date}</span>
              </div>
              <h2 className={`text-base sm:text-lg font-bold ${tokens.appText} leading-tight mt-0.5`}>
                {review.headline}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} ${tokens.appTextMuted} hover:${tokens.appText} transition`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b ${tokens.cardBorder} ${tokens.pillBg} px-3 pt-2 gap-1 text-xs font-bold overflow-x-auto`}>
          <button
            type="button"
            onClick={() => { setActiveTab('narrative'); setIsTryAgainMode(false); }}
            className={`px-3 py-2 rounded-t-lg border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'narrative'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : `border-transparent ${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Story of Your Game</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('moments'); }}
            className={`px-3 py-2 rounded-t-lg border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'moments'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : `border-transparent ${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Critical Moments ({moments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('movelist'); setIsTryAgainMode(false); }}
            className={`px-3 py-2 rounded-t-lg border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'movelist'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : `border-transparent ${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Annotated Move List</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('scorecard'); setIsTryAgainMode(false); }}
            className={`px-3 py-2 rounded-t-lg border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'scorecard'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs'
                : `border-transparent ${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Game Scorecard</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm flex-1">
          
          {/* TAB 1: STORY OF YOUR GAME */}
          {activeTab === 'narrative' && (
            <div className="space-y-4">
              {/* Accuracies bar */}
              <div className={`grid grid-cols-2 gap-3 ${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder}`}>
                <div>
                  <span className={`text-[10px] uppercase font-bold ${tokens.appTextSubtle} tracking-wider block`}>
                    Your Accuracy
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      {review.accuracyWhite}%
                    </span>
                    {review.playerModelUpdate?.ratingChange !== undefined && (
                      <span className={`text-xs font-bold ${
                        review.playerModelUpdate.ratingChange >= 0 ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        {review.playerModelUpdate.ratingChange >= 0 ? `+${review.playerModelUpdate.ratingChange}` : review.playerModelUpdate.ratingChange} Elo
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className={`text-[10px] uppercase font-bold ${tokens.appTextSubtle} tracking-wider block`}>
                    Opponent Accuracy
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-2xl font-black ${tokens.appText} font-mono`}>
                      {review.accuracyBlack}%
                    </span>
                    <span className={`text-xs ${tokens.appTextSubtle}`}>({review.opponentName})</span>
                  </div>
                </div>
              </div>

              {/* Coach Narrative Overview */}
              <div className={`${tokens.cardBg} p-4 rounded-xl border ${tokens.cardBorder} space-y-2 shadow-2xs`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-emerald-600" />
                  <span>Coach Narrative Analysis</span>
                </div>
                <p className={`text-xs sm:text-sm ${tokens.appText} leading-relaxed font-normal`}>
                  {review.overviewSummary}
                </p>
              </div>

              {/* Game Phases Narrative Breakdown */}
              {review.phases && review.phases.length > 0 && (
                <div className="space-y-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                    Phase-by-Phase Performance
                  </span>
                  <div className="space-y-2">
                    {review.phases.map((phase, idx) => (
                      <div key={idx} className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${tokens.appText}`}>{phase.title}</span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            phase.score >= 80 ? 'bg-emerald-100 text-emerald-800' : phase.score >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {phase.score}%
                          </span>
                        </div>
                        <p className={`text-xs ${tokens.appTextMuted} leading-relaxed`}>
                          {phase.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Core Takeaway & Frequency Context */}
              <div className="bg-amber-50/90 p-4 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Your Biggest Takeaway</span>
                </div>
                <p className="text-sm font-bold text-amber-950 italic">
                  "{review.biggestLessonDetail?.lessonText || review.biggestLesson}"
                </p>
                {review.biggestLessonDetail?.principleQuote && (
                  <p className="text-xs text-amber-800 font-medium border-l-2 border-amber-400 pl-2 mt-1">
                    Rule of thumb: {review.biggestLessonDetail.principleQuote}
                  </p>
                )}
                {review.biggestLessonDetail?.frequencyPattern && (
                  <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-md inline-block">
                    Pattern Context: {review.biggestLessonDetail.frequencyPattern}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CRITICAL MOMENTS & TRY AGAIN */}
          {activeTab === 'moments' && (
            <div className="space-y-4">
              {moments.length === 0 ? (
                <p className={`text-xs ${tokens.appTextMuted}`}>No critical turning points recorded for this match.</p>
              ) : (
                <>
                  {/* Moment selector stepper */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
                      Turning Point {selectedMomentIndex + 1} of {moments.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={selectedMomentIndex === 0}
                        onClick={() => { setSelectedMomentIndex(prev => prev - 1); setIsTryAgainMode(false); }}
                        className={`px-2.5 py-1 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} disabled:opacity-30 text-xs font-bold ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder} flex items-center gap-1`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Prev</span>
                      </button>
                      <button
                        type="button"
                        disabled={selectedMomentIndex === moments.length - 1}
                        onClick={() => { setSelectedMomentIndex(prev => prev + 1); setIsTryAgainMode(false); }}
                        className={`px-2.5 py-1 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} disabled:opacity-30 text-xs font-bold ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder} flex items-center gap-1`}
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Active Moment Card */}
                  {activeMoment && (
                    <div className="space-y-3">
                      {/* Moment Headline Banner */}
                      <div className={`${tokens.cardBg} p-4 rounded-xl border ${tokens.cardBorder} space-y-2 shadow-2xs`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              Move {activeMoment.moveNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              activeMoment.classification === 'blunder'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : activeMoment.classification === 'mistake'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {activeMoment.classification}
                            </span>
                            {activeMoment.category && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                ({activeMoment.category})
                              </span>
                            )}
                          </div>

                          {!activeMoment.isGoodDecision && (
                            <button
                              type="button"
                              onClick={() => startTryAgain(activeMoment)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg ${
                                isTryAgainMode
                                  ? 'bg-emerald-600 text-white'
                                  : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`
                              } flex items-center gap-1.5 shadow-2xs transition`}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{isTryAgainMode ? 'Restart Try Again' : 'Try Again on Board'}</span>
                            </button>
                          )}
                        </div>

                        <h3 className={`text-sm font-bold ${tokens.appText}`}>
                          {activeMoment.headline}
                        </h3>

                        {/* Interactive Board for Try Again Mode */}
                        {isTryAgainMode ? (
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-center">
                              <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-xl overflow-hidden shadow-md border border-slate-200">
                                <ChessBoard
                                  fen={tryAgainFen}
                                  theme={boardTheme}
                                  flipped={review.playerColor === 'b'}
                                  onMove={handleTryAgainMove}
                                  isInteractive={tryAgainFeedback.status !== 'success'}
                                />
                              </div>
                            </div>

                            {/* Try Again Coach Feedback Box */}
                            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                              tryAgainFeedback.status === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                                : tryAgainFeedback.status === 'incorrect'
                                ? 'bg-amber-50 border-amber-200 text-amber-950'
                                : `${tokens.pillBg} border ${tokens.pillBorder} ${tokens.appText}`
                            }`}>
                              <div className="flex items-center gap-1.5 font-bold mb-1">
                                <Brain className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Coach Feedback:</span>
                              </div>
                              <p>{tryAgainFeedback.message}</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Played vs Best Comparison */}
                            <div className={`grid grid-cols-2 gap-3 font-mono ${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder}`}>
                              <div>
                                <span className={`${tokens.appTextSubtle} text-[10px] uppercase font-bold block`}>What You Played</span>
                                <span className={`text-sm font-bold ${activeMoment.isGoodDecision ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {activeMoment.playedMove}
                                </span>
                              </div>
                              <div>
                                <span className={`${tokens.appTextSubtle} text-[10px] uppercase font-bold block`}>Master Recommendation</span>
                                <span className="text-sm font-bold text-emerald-700">
                                  {activeMoment.bestMove}
                                </span>
                              </div>
                            </div>

                            {/* Coach Principle Explanation */}
                            <div className="space-y-1 pt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-700 block`}>
                                Concept: {activeMoment.conceptTaught}
                              </span>
                              <p className={`text-xs ${tokens.appText} leading-relaxed`}>
                                {activeMoment.coachExplanation}
                              </p>
                            </div>

                            {/* Alternative Variation Line */}
                            {activeMoment.alternativeVariation && (
                              <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1.5`}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                                  Recommended Continuation Line
                                </span>
                                <div className="flex flex-wrap gap-1.5 font-mono text-xs font-bold text-emerald-800">
                                  {activeMoment.alternativeVariation.moves.map((mv, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                                      {i + 1}. {mv}
                                    </span>
                                  ))}
                                </div>
                                <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed`}>
                                  {activeMoment.alternativeVariation.explanation}
                                </p>
                              </div>
                            )}

                            {/* Thinking Failure Diagnostics */}
                            {activeMoment.thinkingFailure && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                                  Cognitive Safety Check
                                </span>
                                <p className="text-slate-800">
                                  {activeMoment.thinkingFailure.explanation}
                                </p>
                                <p className="text-emerald-700 font-semibold text-[11px]">
                                  Mental Check: "{activeMoment.thinkingFailure.mentalCheckToApply}"
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: GAME SCORECARD */}
          {activeTab === 'scorecard' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
                  Performance Breakdown Across 6 Pillars
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(review.scorecard || [
                  { category: 'opening', label: 'Opening Preparation', grade: 'Strong', score: 85, comment: 'Controlled central squares and developed minor pieces.' },
                  { category: 'tactics', label: 'Tactical Vision', grade: 'Good', score: 72, comment: 'Spotted basic pins; missed 1 hidden knight deflection.' },
                  { category: 'calculation', label: 'Calculation Depth', grade: 'Needs work', score: 58, comment: 'Calculated 2 moves ahead; missed opponent counter-threats.' },
                  { category: 'king_safety', label: 'King Safety', grade: 'Needs work', score: 52, comment: 'Delayed castling under central pawn tension.' },
                  { category: 'planning', label: 'Planning & Strategy', grade: 'Improving', score: 68, comment: 'Good initiative; improve worst piece before attacking.' },
                  { category: 'endgame', label: 'Endgame Technique', grade: 'Good', score: 75, comment: 'Active king and clean pawn structure.' }
                ]).map((item, idx) => (
                  <div key={idx} className={`${tokens.cardBg} p-3 rounded-xl border ${tokens.cardBorder} space-y-1 shadow-2xs`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${tokens.appText}`}>{item.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        item.grade === 'Excellent' || item.grade === 'Strong'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.grade === 'Good' || item.grade === 'Improving'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.grade} ({item.score}%)
                      </span>
                    </div>
                    <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed`}>
                      {item.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Observed Player Tendencies */}
              {review.playerModelUpdate?.tendenciesObserved && review.playerModelUpdate.tendenciesObserved.length > 0 && (
                <div className={`p-3.5 ${tokens.cardBg} rounded-xl border ${tokens.cardBorder} text-xs space-y-1.5 shadow-2xs mt-3`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Evidence Stored in Your Player Profile</span>
                  </div>
                  <ul className={`list-disc list-inside ${tokens.appText} space-y-1 font-medium`}>
                    {review.playerModelUpdate.tendenciesObserved.map((tend, idx) => (
                      <li key={idx}>{tend}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SQLite & PGN Export Bar */}
          <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved to Persistent SQLite Game History</span>
              </div>
              {review.pgn && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPgn(!showPgn)}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>{showPgn ? 'Hide PGN' : 'View PGN'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPgn}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${
                      copiedPgn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`
                    } flex items-center gap-1 transition`}
                  >
                    {copiedPgn ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPgn ? 'Copied' : 'Copy PGN'}</span>
                  </button>
                </div>
              )}
            </div>

            {showPgn && review.pgn && (
              <div className="relative mt-2">
                <pre className={`p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all ${tokens.cardBg} border ${tokens.cardBorder} text-slate-700 max-h-32 overflow-y-auto leading-relaxed`}>
                  {review.pgn}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={`p-4 ${tokens.pillBg} border-t ${tokens.cardBorder} flex items-center justify-between gap-3`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold ${tokens.appTextMuted} hover:${tokens.appText} transition`}
          >
            Close Review
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlayAgain();
            }}
            className={`px-5 py-2.5 ${tokens.accentPrimary} ${tokens.accentPrimaryHover} text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Next Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

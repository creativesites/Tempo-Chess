import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Square,
  PieceSymbol,
  Color,
  BoardTheme,
  ChessMove,
  GameContext,
  CoachIntervention,
  BotProfile,
  PlayerModel,
  SavedGameRecord,
  OpeningContext
} from '../../types';
import { ChessGameWrapper } from '../../chess/rules';
import { defaultChessEngine } from '../../chess/engine';
import { TeachingOpportunityDetector } from '../../ai/teaching';
import { AppStorage } from '../../database/storage';
import { sounds } from '../../utils/audio';
import { ChessBoard, BoardArrow } from '../../components/chess/ChessBoard';
import { CapturedPieces } from '../../components/chess/CapturedPieces';
import { MoveHistory } from '../../components/chess/MoveHistory';
import { VisualMoveTimer } from '../../components/chess/VisualMoveTimer';
import { ChessDotComCoachBanner } from '../../components/coach/ChessDotComCoachBanner';
import { CoachInsightOverlay, EvalShiftData } from '../../components/coach/CoachInsightOverlay';
import { EvalShiftDetector } from '../../chess/evalShiftDetector';
import { PostGameReviewModal } from '../../components/game/PostGameReviewModal';
import { BotSelectorModal } from '../../components/game/BotSelectorModal';
import { CHESS_BOTS, DEFAULT_BOT } from '../../chess/bots';
import { BotAdaptiveMemory } from '../../chess/botMemory';
import { useTheme } from '../../context/ThemeContext';
import {
  RotateCcw,
  Sparkles,
  RefreshCw,
  Flag,
  ArrowLeftRight,
  Bot,
  Brain,
  ChevronDown,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';

interface PlayScreenProps {
  playerModel: PlayerModel;
  onUpdatePlayerModel: (model: PlayerModel) => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  playerModel,
  onUpdatePlayerModel
}) => {
  const { tokens } = useTheme();

  // Active Game State
  const [fen, setFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [flipped, setFlipped] = useState<boolean>(false);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('nordic_slate');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [moveHistory, setMoveHistory] = useState<ChessMove[]>([]);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(-1);
  const [isGameActive, setIsGameActive] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Time Controls (10 minutes default)
  const [playerTime, setPlayerTime] = useState<number>(600);
  const [opponentTime, setOpponentTime] = useState<number>(600);
  const [currentTurnTime, setCurrentTurnTime] = useState<number>(0);
  const [playerMoveTimes, setPlayerMoveTimes] = useState<number[]>([]);

  // Selected Bot Opponent
  const [selectedBot, setSelectedBot] = useState<BotProfile>(DEFAULT_BOT);
  const [isBotModalOpen, setIsBotModalOpen] = useState<boolean>(false);

  // AI Coach State
  const [activeIntervention, setActiveIntervention] = useState<CoachIntervention | null>(null);
  const [activeEvalShift, setActiveEvalShift] = useState<EvalShiftData | null>(null);
  const [currentOpening, setCurrentOpening] = useState<OpeningContext | undefined>(undefined);
  const [coachArrows, setCoachArrows] = useState<BoardArrow[]>([]);
  const [coachDangerSquares, setCoachDangerSquares] = useState<Square[]>([]);

  // Post Game Review
  const [gameReview, setGameReview] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Chess Rules Engine Instance
  const chessWrapperRef = useRef<ChessGameWrapper>(new ChessGameWrapper());

  // Material & Advantage calculation
  const material = chessWrapperRef.current.calculateMaterial();
  const currentTurn = chessWrapperRef.current.getTurn();
  const isPlayerTurn = currentTurn === playerColor && isGameActive && !isAiThinking;

  // Sync board theme and bot from storage on mount
  useEffect(() => {
    const savedTheme = AppStorage.getBoardTheme();
    setBoardTheme(savedTheme);

    const savedBotId = AppStorage.getSelectedBotId();
    if (savedBotId) {
      const bot = CHESS_BOTS.find(b => b.id === savedBotId);
      if (bot) setSelectedBot(bot);
    }
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      // Increment current move time tracker
      setCurrentTurnTime(prev => prev + 1);

      if (currentTurn === playerColor) {
        setPlayerTime(prev => {
          if (prev <= 1) {
            handleGameEnd('loss');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setOpponentTime(prev => {
          if (prev <= 1) {
            handleGameEnd('win');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, currentTurn, playerColor]);

  // Handle Game End & Generate AI Review
  const handleGameEnd = useCallback(async (outcome: 'win' | 'loss' | 'draw') => {
    setIsGameActive(false);
    sounds.playSuccess();

    // 1. Record Game Conclusion into Bot Adaptive Memory
    BotAdaptiveMemory.recordGameConclusion(
      selectedBot.id,
      outcome,
      currentOpening?.name,
      moveHistory,
      playerModel
    );

    const pgnString = chessWrapperRef.current.getPgn();
    const currentFen = chessWrapperRef.current.getFen();

    // 2. Generate comprehensive Post-Game Review
    const gameContext: GameContext = {
      gameId: `game_${Date.now()}`,
      currentFen,
      moveHistory,
      whiteMoves: moveHistory.filter(m => m.color === 'w'),
      blackMoves: moveHistory.filter(m => m.color === 'b'),
      opening: currentOpening,
      material: chessWrapperRef.current.calculateMaterial(),
      tacticalState: chessWrapperRef.current.calculateTacticalState(),
      strategicState: chessWrapperRef.current.calculateStrategicState(),
      criticalEvents: [],
      playerContext: {
        color: playerColor,
        timeControlSeconds: 600,
        timeRemainingSeconds: playerTime,
        movesSinceLastMistake: 0,
        materialLostRecently: false
      },
      teachingContext: {
        consecutiveSilentMoves: 0,
        coachVerbosity: 'comprehensive',
        socraticMode: true
      }
    };

    const review = TeachingOpportunityDetector.generateGameReview(
      gameContext,
      outcome,
      playerModel
    );

    setGameReview(review);
    setShowReviewModal(true);

    // 3. Save Game Record to Persistent Storage
    const gameRecord: SavedGameRecord = {
      id: `game_${Date.now()}`,
      pgn: pgnString,
      fen: currentFen,
      result: outcome,
      playerColor,
      playerName: playerModel.playerName || 'Player',
      opponentName: `${selectedBot.name} (${selectedBot.rating})`,
      openingName: currentOpening ? `${currentOpening.name}${currentOpening.variation ? ': ' + currentOpening.variation : ''}` : 'Standard Chess Game',
      headline: review.headline || 'Completed Game',
      accuracyWhite: review.accuracyWhite,
      accuracyBlack: review.accuracyBlack,
      dateIso: new Date().toISOString(),
      timestamp: Date.now(),
      movesCount: moveHistory.length,
      review
    };

    AppStorage.saveGame(gameRecord);
    AppStorage.saveGameReview(review, pgnString, currentFen, moveHistory.length);
    onUpdatePlayerModel(AppStorage.getPlayerModel());
  }, [currentOpening, moveHistory, onUpdatePlayerModel, playerColor, playerModel, playerTime, selectedBot]);

  // AI Opponent Move Execution
  const triggerAiMove = useCallback(async () => {
    if (!isGameActive) return;

    setIsAiThinking(true);
    try {
      const currentFen = chessWrapperRef.current.getFen();

      // Pass selectedBot to engine for rating-calibrated depth, PST, and adaptive book moves
      const aiMove = await defaultChessEngine.getBestMove(currentFen, {
        bot: selectedBot
      });

      // Human-like Thinking Delay calculation
      const isCapture = moveHistory.length > 0 && !!moveHistory[moveHistory.length - 1].captured;
      const isCheck = chessWrapperRef.current.isCheck();
      const legalMovesCount = chessWrapperRef.current.getLegalMoves().length;
      const isOpeningBook = selectedBot.useOpeningBook && moveHistory.length <= 8;
      const humanDelay = BotAdaptiveMemory.calculateHumanThinkingDelay(
        isOpeningBook,
        isCapture,
        isCheck,
        legalMovesCount,
        selectedBot.rating
      );

      await new Promise(r => setTimeout(r, humanDelay));

      const moveResult = chessWrapperRef.current.makeMove(aiMove.from, aiMove.to, aiMove.promotion);
      if (moveResult) {
        if (moveResult.captured) sounds.playCapture();
        else sounds.playMove();

        if (moveResult.isCheck) sounds.playCheck();

        const updatedHistory = [...moveHistory, moveResult];
        setMoveHistory(updatedHistory);
        setFen(chessWrapperRef.current.getFen());
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setSelectedMoveIndex(updatedHistory.length - 1);

        // Check if game over after AI move
        if (chessWrapperRef.current.isCheckmate()) {
          handleGameEnd('loss');
          return;
        }
        if (chessWrapperRef.current.isDraw()) {
          handleGameEnd('draw');
          return;
        }

        // Coach opportunity analysis
        const gameContext: GameContext = {
          gameId: 'current',
          currentFen: chessWrapperRef.current.getFen(),
          moveHistory: updatedHistory,
          whiteMoves: updatedHistory.filter(m => m.color === 'w'),
          blackMoves: updatedHistory.filter(m => m.color === 'b'),
          opening: currentOpening,
          material: chessWrapperRef.current.calculateMaterial(),
          tacticalState: chessWrapperRef.current.calculateTacticalState(),
          strategicState: chessWrapperRef.current.calculateStrategicState(),
          criticalEvents: [],
          playerContext: {
            color: playerColor,
            timeControlSeconds: 600,
            timeRemainingSeconds: playerTime,
            movesSinceLastMistake: 0,
            materialLostRecently: moveResult.captured !== undefined
          },
          teachingContext: {
            consecutiveSilentMoves: 0,
            coachVerbosity: AppStorage.getCoachVerbosity(),
            socraticMode: true
          }
        };

        const opportunity = TeachingOpportunityDetector.evaluateOpportunity(gameContext, moveResult, playerModel);
        if (opportunity) {
          setActiveIntervention(opportunity);
          sounds.playCoachChime();
        }

        // Eval Shift Detection on AI Move
        EvalShiftDetector.checkEvalShift(
          currentFen,
          chessWrapperRef.current.getFen(),
          moveResult,
          playerColor,
          playerModel
        ).then(shift => {
          if (shift) {
            setActiveEvalShift(shift);
          }
        });

        // Reset move timer for player turn
        setCurrentTurnTime(0);
      }
    } catch (err) {
      console.error('Error executing AI move:', err);
    } finally {
      setIsAiThinking(false);
    }
  }, [currentOpening, handleGameEnd, isGameActive, moveHistory, playerColor, playerModel, playerTime, selectedBot]);

  // Handle Player Move
  const handlePlayerMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (!isPlayerTurn) return;

    // Clear active coach arrows on move
    setCoachArrows([]);
    setCoachDangerSquares([]);

    // Record time spent on player move
    if (currentTurnTime > 0) {
      setPlayerMoveTimes(prev => [...prev, currentTurnTime]);
    }
    setCurrentTurnTime(0);

    const fenBefore = chessWrapperRef.current.getFen();
    const moveResult = chessWrapperRef.current.makeMove(from, to, promotion);
    if (!moveResult) return;

    // Play move or capture sound
    if (moveResult.captured) sounds.playCapture();
    else sounds.playMove();

    if (moveResult.isCheck) sounds.playCheck();

    const fenAfter = chessWrapperRef.current.getFen();
    const updatedHistory = [...moveHistory, moveResult];
    setMoveHistory(updatedHistory);
    setFen(fenAfter);
    setLastMove({ from, to });
    setSelectedMoveIndex(updatedHistory.length - 1);

    // Check for significant evaluation shift on player's move
    EvalShiftDetector.checkEvalShift(
      fenBefore,
      fenAfter,
      moveResult,
      playerColor,
      playerModel
    ).then(shift => {
      if (shift) {
        setActiveEvalShift(shift);
      }
    });

    // Identify opening
    const detectedOpening = chessWrapperRef.current.identifyOpening();
    if (detectedOpening) {
      setCurrentOpening(detectedOpening);
    }

    // Dismiss previous coach prompt
    setActiveIntervention(null);

    // Check game over
    if (chessWrapperRef.current.isCheckmate()) {
      handleGameEnd('win');
      return;
    }
    if (chessWrapperRef.current.isDraw()) {
      handleGameEnd('draw');
      return;
    }

    // Trigger AI move response
    setTimeout(() => {
      triggerAiMove();
    }, 150);
  };

  // Reset Game
  const resetGame = (newColor: Color = 'w') => {
    chessWrapperRef.current = new ChessGameWrapper();
    setFen(chessWrapperRef.current.getFen());
    setMoveHistory([]);
    setLastMove(null);
    setSelectedMoveIndex(-1);
    setIsGameActive(true);
    setIsAiThinking(false);
    setPlayerTime(600);
    setOpponentTime(600);
    setCurrentTurnTime(0);
    setPlayerMoveTimes([]);
    setActiveIntervention(null);
    setActiveEvalShift(null);
    setCurrentOpening(undefined);
    setGameReview(null);
    setShowReviewModal(false);
    setPlayerColor(newColor);
    setFlipped(newColor === 'b');
    setCoachArrows([]);
    setCoachDangerSquares([]);

    // If player is Black, trigger AI White opening move
    if (newColor === 'b') {
      setTimeout(() => {
        triggerAiMove();
      }, 500);
    }
  };

  // Select Bot Opponent
  const handleSelectBot = (bot: BotProfile) => {
    setSelectedBot(bot);
    AppStorage.setSelectedBotId(bot.id);
    setIsBotModalOpen(false);
    resetGame(playerColor);
  };

  // Takeback Move
  const handleTakeback = () => {
    if (moveHistory.length === 0 || !isGameActive) return;

    // Undo 2 moves (Bot move + Player move) or 1 move if it was only player move
    chessWrapperRef.current.undoMove();
    if (chessWrapperRef.current.getTurn() !== playerColor) {
      chessWrapperRef.current.undoMove();
    }

    const updatedHistory = moveHistory.slice(0, chessWrapperRef.current.getMoveHistory().length);
    setMoveHistory(updatedHistory);
    setFen(chessWrapperRef.current.getFen());
    setLastMove(
      updatedHistory.length > 0
        ? { from: updatedHistory[updatedHistory.length - 1].from, to: updatedHistory[updatedHistory.length - 1].to }
        : null
    );
    setSelectedMoveIndex(updatedHistory.length - 1);
    setActiveIntervention(null);
    setCoachArrows([]);
    setCoachDangerSquares([]);
    sounds.playMove();
  };

  // Request Coach Insight Manually
  const handleRequestInsight = async () => {
    if (!isGameActive || isAiThinking) return;

    setIsAiThinking(true);
    try {
      const currentFen = chessWrapperRef.current.getFen();
      const analysis = await defaultChessEngine.analyze(currentFen, { depth: 4 });

      const bestMoveSan = analysis.bestMoveSan;
      const gameContext: GameContext = {
        gameId: 'current',
        currentFen,
        moveHistory,
        whiteMoves: moveHistory.filter(m => m.color === 'w'),
        blackMoves: moveHistory.filter(m => m.color === 'b'),
        opening: currentOpening,
        material: chessWrapperRef.current.calculateMaterial(),
        tacticalState: chessWrapperRef.current.calculateTacticalState(),
        strategicState: chessWrapperRef.current.calculateStrategicState(),
        criticalEvents: [],
        playerContext: {
          color: playerColor,
          timeControlSeconds: 600,
          timeRemainingSeconds: playerTime,
          movesSinceLastMistake: 0,
          materialLostRecently: false
        },
        teachingContext: {
          consecutiveSilentMoves: 0,
          coachVerbosity: 'comprehensive',
          socraticMode: true
        }
      };

      const detected = TeachingOpportunityDetector.evaluateOpportunity(
        gameContext,
        moveHistory[moveHistory.length - 1],
        playerModel
      );

      const generated: CoachIntervention = detected || {
        id: `manual-${Date.now()}`,
        level: 'gentle',
        type: 'quiet_observation',
        title: 'Positional Observation',
        message: bestMoveSan
          ? `Engine evaluation is around ${(analysis.evaluationCp / 100).toFixed(1)}. Consider finding harmonious piece squares or exploring candidate move ${bestMoveSan}.`
          : 'Focus on piece activity, centralized rooks, and keeping your king safe.',
        moveIndex: moveHistory.length,
        timestamp: Date.now()
      };

      setActiveIntervention(generated);
      sounds.playCoachChime();
    } catch (e) {
      console.error('Error getting coach insight:', e);
    } finally {
      setIsAiThinking(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-3 space-y-2.5 animate-in fade-in pb-24 select-none">
      {/* 1. Chess.com-style Coach Character Banner at the very top */}
      <ChessDotComCoachBanner
        intervention={activeIntervention}
        opening={currentOpening}
        playerColor={playerColor}
        fen={fen}
        moveHistory={moveHistory}
        isThinking={isAiThinking}
        playerModel={playerModel}
        onDismissIntervention={() => setActiveIntervention(null)}
        onRequestInsight={handleRequestInsight}
        onTakeback={handleTakeback}
        onPreviewArrowsChange={(arrows, dangerSquares) => {
          setCoachArrows(arrows);
          setCoachDangerSquares(dangerSquares || []);
        }}
        onSelectCandidateMove={(from, to, promotion) => {
          handlePlayerMove(from, to, promotion);
        }}
      />

      {/* 2. Opponent Info Bar with Bot Selection Trigger */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2">
          {/* Bot Avatar */}
          <div
            onClick={() => setIsBotModalOpen(true)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs cursor-pointer hover:scale-105 active:scale-95 transition shadow-xs ${selectedBot.avatarBg}`}
            title="Change Bot Opponent"
          >
            {selectedBot.avatar}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsBotModalOpen(true)}
                className="flex items-center gap-1 group text-left"
              >
                <span className={`text-xs font-bold ${tokens.appText} group-hover:text-emerald-700 transition`}>
                  {selectedBot.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-amber-300">
                  {selectedBot.rating}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition" />
              </button>
            </div>
            <CapturedPieces
              captured={playerColor === 'w' ? material.capturedByBlack : material.capturedByWhite}
              pieceColor={playerColor === 'w' ? 'w' : 'b'}
              advantageCount={playerColor === 'w' ? Math.max(0, -material.advantage) : Math.max(0, material.advantage)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Bot Change Button */}
          <button
            type="button"
            onClick={() => setIsBotModalOpen(true)}
            className={`px-2 py-1 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} text-[10px] font-bold transition flex items-center gap-1 shadow-2xs`}
          >
            <Bot className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">Bot</span>
          </button>

          {/* Opponent Clock */}
          <div
            className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition shadow-2xs ${
              currentTurn !== playerColor && isGameActive
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : `${tokens.cardBg} ${tokens.appTextMuted} border ${tokens.cardBorder}`
            }`}
          >
            {formatTime(opponentTime)}
          </div>
        </div>
      </div>

      {/* 3. Main Interactive Chess Board */}
      <div className="w-full flex justify-center py-0.5">
        <ChessBoard
          fen={fen}
          playerColor={playerColor}
          flipped={flipped}
          theme={boardTheme}
          lastMove={lastMove}
          onMove={handlePlayerMove}
          arrows={coachArrows}
          dangerSquares={coachDangerSquares}
          disabled={!isPlayerTurn}
        />
      </div>

      {/* 4. Player Info Bar */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center font-bold text-xs ${tokens.accentBadgeText}`}>
            {playerModel.playerName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${tokens.appText}`}>{playerModel.playerName}</span>
              <span className={`text-[10px] ${tokens.appTextMuted} font-mono`}>{playerModel.ratingEstimate}</span>
            </div>
            <CapturedPieces
              captured={playerColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
              pieceColor={playerColor === 'w' ? 'b' : 'w'}
              advantageCount={playerColor === 'w' ? Math.max(0, material.advantage) : Math.max(0, -material.advantage)}
            />
          </div>
        </div>

        {/* Player Clock */}
        <div
          className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition shadow-2xs ${
            currentTurn === playerColor && isGameActive
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : `${tokens.cardBg} ${tokens.appTextMuted} border ${tokens.cardBorder}`
          }`}
        >
          {formatTime(playerTime)}
        </div>
      </div>

      {/* 5. Real-Time Visual Move Timer & Pacing Management */}
      <VisualMoveTimer
        currentTurnTime={currentTurnTime}
        targetTimePerMove={25}
        isPlayerTurn={isPlayerTurn}
        totalPlayerTime={playerTime}
        totalOpponentTime={opponentTime}
        averageMoveTime={
          playerMoveTimes.length > 0
            ? playerMoveTimes.reduce((a, b) => a + b, 0) / playerMoveTimes.length
            : 0
        }
        moveCount={moveHistory.length}
      />

      {/* 6. Move History Strip */}
      <MoveHistory
        moves={moveHistory}
        currentMoveIndex={selectedMoveIndex}
        onSelectMove={idx => setSelectedMoveIndex(idx)}
      />

      {/* 7. Game Actions Footer Bar */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        <button
          type="button"
          onClick={handleTakeback}
          disabled={moveHistory.length === 0 || !isGameActive}
          className={`flex-1 py-2 ${tokens.cardBg} ${tokens.cardBgHover} disabled:opacity-40 ${tokens.appText} rounded-xl border ${tokens.cardBorder} text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Takeback</span>
        </button>

        <button
          type="button"
          onClick={() => setFlipped(prev => !prev)}
          className={`py-2 px-3 ${tokens.cardBg} ${tokens.cardBgHover} ${tokens.appText} rounded-xl border ${tokens.cardBorder} text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs`}
          title="Flip Board"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleGameEnd('loss')}
          disabled={!isGameActive || moveHistory.length === 0}
          className={`py-2 px-3 ${tokens.cardBg} hover:bg-rose-50 disabled:opacity-40 text-rose-600 rounded-xl border ${tokens.cardBorder} text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs`}
          title="Resign Game"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => resetGame(playerColor)}
          className={`py-2 px-3 ${tokens.cardBg} ${tokens.cardBgHover} ${tokens.appText} rounded-xl border ${tokens.cardBorder} text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs`}
          title="New Game"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Post-Game Review Modal */}
      {showReviewModal && gameReview && (
        <PostGameReviewModal
          review={gameReview}
          onClose={() => setShowReviewModal(false)}
          onPlayAgain={() => resetGame(playerColor)}
        />
      )}

      {/* Rated Bot Opponent Selector Modal */}
      <BotSelectorModal
        isOpen={isBotModalOpen}
        selectedBot={selectedBot}
        onSelectBot={handleSelectBot}
        onClose={() => setIsBotModalOpen(false)}
      />

      {/* AI Coach Insight Evaluation Shift Overlay */}
      <CoachInsightOverlay
        shiftData={activeEvalShift}
        fen={fen}
        onDismiss={() => setActiveEvalShift(null)}
        onTakeback={handleTakeback}
        onHighlightArrows={(arrows, dangerSquares) => {
          setCoachArrows(arrows);
          setCoachDangerSquares(dangerSquares || []);
        }}
      />
    </div>
  );
};

import {
  BotAdaptiveMemory,
  BotProfile,
  CHESS_BOTS,
  ChessGameWrapper,
  DEFAULT_BOT,
  NativeChessEngine,
  OfflineChessEngine,
  defaultChessEngine,
} from '@tempo/chess';
import { CoachIntervention, TeachingOpportunityDetector } from '@tempo/coaching';
import { EvalShiftData, EvalShiftDetector } from '@tempo/game-review';
import { createEmptyPlayerModel, PlayerModel } from '@tempo/player-model';
import { ChessMove, Color, GameContext, OpeningContext, PieceSymbol, Square } from '@tempo/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

import { ChessEngineBackend, getActiveChessEngineBackend, getChessEngine } from '@/native-chess-engine';
import { getPlayerModel, recordGameResult, saveGame, setSetting, SettingsKeys } from '@/storage';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const TIME_CONTROL_SECONDS = 600;
const ANALYSIS_DEPTH = 3;
/** Shallower search on the synchronous JS-thread fallback engine — that
 * path is used on web and on devices where native Stockfish failed to
 * init, precisely the cases most likely to be lower-end. */
const FALLBACK_ANALYSIS_DEPTH = 2;

export type GameResult = 'win' | 'loss' | 'draw';

export interface LiveGameSummary {
  result: GameResult;
  /** % of the player's own moves classified best/great/good/book — computed
   * from real engine eval deltas on every move, never fabricated. */
  playerAccuracyPercent: number;
  totalPlayerMoves: number;
  blunderCount: number;
  mistakeCount: number;
}

/** Recovers a White-perspective centipawn value from the engine's
 * side-to-move-relative evaluation, so before/after deltas compare
 * apples to apples regardless of whose turn a given FEN represents. */
function toWhitePerspective(evalCp: number, fen: string): number {
  const sideToMove = fen.split(' ')[1];
  return sideToMove === 'w' ? evalCp : -evalCp;
}

export function useLiveGame(playerName: string) {
  const wrapperRef = useRef(new ChessGameWrapper());
  const processingRef = useRef(false);

  // Resolved once (native Stockfish if it initializes, the TS fallback
  // otherwise) and reused for every analysis call — see
  // @/native-chess-engine. Never used for bot move *selection*, which
  // stays on OfflineChessEngine so bot personalities (blunder rates,
  // opening books) keep working; only for the before/after evaluations
  // used to classify moves and detect eval shifts.
  const engineRef = useRef<NativeChessEngine | null>(null);
  const engineBackendRef = useRef<ChessEngineBackend | null>(null);
  const engineReadyPromiseRef = useRef<Promise<NativeChessEngine> | null>(null);

  const ensureEngine = useCallback(async (): Promise<NativeChessEngine> => {
    if (engineRef.current) return engineRef.current;
    if (!engineReadyPromiseRef.current) engineReadyPromiseRef.current = getChessEngine();
    const engine = await engineReadyPromiseRef.current;
    engineRef.current = engine;
    engineBackendRef.current = getActiveChessEngineBackend();
    return engine;
  }, []);

  useEffect(() => {
    ensureEngine().catch((e) => console.error('Failed to resolve chess engine', e));
  }, [ensureEngine]);

  // Caches the most recent position's evaluation so consecutive moves
  // don't re-analyze a FEN the previous move's "after" analysis already
  // covered — move N's "before" is always move N-1's "after". Cleared on
  // takeback, since the cached fen would no longer match the position.
  const analysisCacheRef = useRef<{ fen: string; evaluationCp: number; bestMoveSan: string } | null>(null);

  const [fen, setFen] = useState(START_FEN);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [moveHistory, setMoveHistory] = useState<ChessMove[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotProfile>(DEFAULT_BOT);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentOpening, setCurrentOpening] = useState<OpeningContext | undefined>(undefined);
  const [activeIntervention, setActiveIntervention] = useState<CoachIntervention | null>(null);
  const [activeEvalShift, setActiveEvalShift] = useState<EvalShiftData | null>(null);
  const [summary, setSummary] = useState<LiveGameSummary | null>(null);
  const [playerTimeSec, setPlayerTimeSec] = useState(TIME_CONTROL_SECONDS);
  const [opponentTimeSec, setOpponentTimeSec] = useState(TIME_CONTROL_SECONDS);

  // Real, persisted player model — loaded from SQLite on mount. Starts as
  // a genuinely empty model (never fabricated demo stats) while the
  // async load resolves, then swaps in whatever is actually on disk.
  const [playerModel, setPlayerModel] = useState<PlayerModel>(() => createEmptyPlayerModel(playerName));
  const [isPlayerModelLoaded, setIsPlayerModelLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPlayerModel(playerName).then((loaded) => {
      if (!cancelled) {
        setPlayerModel(loaded);
        setIsPlayerModelLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [playerName]);

  const turn = wrapperRef.current.getTurn();
  const isPlayerTurn = isGameActive && !isBotThinking && turn === playerColor;
  const material = wrapperRef.current.calculateMaterial();
  const isCheck = wrapperRef.current.isCheck();

  useEffect(() => {
    if (!isGameActive) return;
    const id = setInterval(() => {
      if (turn === playerColor) {
        setPlayerTimeSec((prev) => Math.max(0, prev - 1));
      } else {
        setOpponentTimeSec((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isGameActive, turn, playerColor]);

  const buildGameContext = useCallback(
    (history: ChessMove[]): GameContext => ({
      gameId: 'live',
      currentFen: wrapperRef.current.getFen(),
      moveHistory: history,
      whiteMoves: history.filter((m) => m.color === 'w'),
      blackMoves: history.filter((m) => m.color === 'b'),
      opening: currentOpening,
      material: wrapperRef.current.calculateMaterial(),
      tacticalState: wrapperRef.current.calculateTacticalState(),
      strategicState: wrapperRef.current.calculateStrategicState(),
      criticalEvents: [],
      playerContext: {
        color: playerColor,
        timeControlSeconds: TIME_CONTROL_SECONDS,
        timeRemainingSeconds: playerTimeSec,
        movesSinceLastMistake: 0,
        materialLostRecently: false,
      },
      teachingContext: {
        consecutiveSilentMoves: 0,
        coachVerbosity: 'balanced',
        socraticMode: true,
      },
    }),
    [currentOpening, playerColor, playerTimeSec]
  );

  const finishGame = useCallback(
    (result: GameResult, history: ChessMove[]) => {
      setIsGameActive(false);
      BotAdaptiveMemory.recordGameConclusion(selectedBot.id, result, currentOpening?.name, history, playerModel);

      const playerMoves = history.filter((m) => m.color === playerColor);
      const goodClassifications = new Set(['best', 'great', 'good', 'book']);
      const goodCount = playerMoves.filter((m) => m.classification && goodClassifications.has(m.classification)).length;
      const blunderCount = playerMoves.filter((m) => m.classification === 'blunder').length;
      const mistakeCount = playerMoves.filter((m) => m.classification === 'mistake').length;
      const accuracy = playerMoves.length > 0 ? Math.round((goodCount / playerMoves.length) * 100) : 100;

      setSummary({
        result,
        playerAccuracyPercent: accuracy,
        totalPlayerMoves: playerMoves.length,
        blunderCount,
        mistakeCount,
      });

      const openingName = currentOpening
        ? `${currentOpening.name}${currentOpening.variation ? `: ${currentOpening.variation}` : ''}`
        : null;

      saveGame({
        id: `game_${Date.now()}`,
        pgn: wrapperRef.current.getPgn(),
        fen: wrapperRef.current.getFen(),
        result,
        playerColor,
        playerName,
        opponentBotId: selectedBot.id,
        opponentName: selectedBot.name,
        opponentRating: selectedBot.rating,
        openingName,
        playerAccuracyPercent: accuracy,
        blunderCount,
        mistakeCount,
        dateIso: new Date().toISOString(),
        timestamp: Date.now(),
        moveHistory: history,
      }).catch((e) => console.error('Failed to save game', e));

      recordGameResult(playerName, result)
        .then((updated) => setPlayerModel(updated))
        .catch((e) => console.error('Failed to record game result', e));
    },
    [currentOpening, playerColor, playerModel, playerName, selectedBot]
  );

  /**
   * Analyzes a position, reusing the previous move's "after" evaluation
   * when the requested fen matches it (move N's "before" is always move
   * N-1's "after" — recomputing it is pure waste) and deferring the
   * actual search until after any pending interaction/animation when
   * running on the synchronous JS-thread fallback engine, so the move's
   * own render commits before the JS thread gets tied up.
   */
  const analyzeCached = useCallback(
    async (fen: string) => {
      if (analysisCacheRef.current?.fen === fen) {
        return analysisCacheRef.current;
      }

      const engine = await ensureEngine();
      const isFallback = engineBackendRef.current === 'fallback_ts_engine';
      const depth = isFallback ? FALLBACK_ANALYSIS_DEPTH : ANALYSIS_DEPTH;
      const run = () => engine.analyze(fen, { depth });

      const result = isFallback
        ? await new Promise<Awaited<ReturnType<typeof run>>>((resolve, reject) => {
            InteractionManager.runAfterInteractions(() => {
              run().then(resolve, reject);
            });
          })
        : await run();

      const cached = { fen, evaluationCp: result.evaluationCp, bestMoveSan: result.bestMoveSan };
      analysisCacheRef.current = cached;
      return cached;
    },
    [ensureEngine]
  );

  /**
   * Classifies the move and checks for a coaching-worthy eval shift, then
   * evaluates coaching opportunities — gated to the player's own moves
   * only, see the @tempo/coaching fix: the coach must never praise or
   * scold the player for a move the bot opponent made.
   *
   * Analysis is skipped entirely for moves that are still known opening
   * theory (identifyOpening() still resolves after this move) — the
   * highest-frequency, lowest-value phase to be spending engine time on,
   * right when first-impression responsiveness matters most.
   */
  const enrichAndReactToMove = useCallback(
    async (rawMove: ChessMove, fenBefore: string, historyBeforeThisMove: ChessMove[]) => {
      const detectedOpening = wrapperRef.current.identifyOpening();
      if (detectedOpening) setCurrentOpening(detectedOpening);

      let enrichedMove: ChessMove = rawMove;
      let evalShift: EvalShiftData | null = null;

      if (detectedOpening) {
        enrichedMove = { ...rawMove, classification: 'book' };
      } else {
        try {
          const before = await analyzeCached(fenBefore);
          const after = await analyzeCached(rawMove.fenAfter);
          const evalBefore = toWhitePerspective(before.evaluationCp, fenBefore);
          const evalAfter = toWhitePerspective(after.evaluationCp, rawMove.fenAfter);
          const classification = OfflineChessEngine.classifyMove(evalBefore, evalAfter, rawMove.color === 'w', false);
          enrichedMove = { ...rawMove, evalBefore, evalAfter, classification };
          evalShift = EvalShiftDetector.evaluateShift(
            before.evaluationCp,
            after.evaluationCp,
            after.bestMoveSan,
            rawMove.fenAfter,
            enrichedMove,
            playerColor,
            playerModel
          );
        } catch (e) {
          console.error('Move analysis failed', e);
        }
      }

      const updatedHistory = [...historyBeforeThisMove, enrichedMove];
      setMoveHistory(updatedHistory);

      if (enrichedMove.color === playerColor) {
        const ctx = buildGameContext(updatedHistory);
        const opportunity = TeachingOpportunityDetector.evaluateOpportunity(ctx, enrichedMove, playerModel);
        if (opportunity) setActiveIntervention(opportunity);
      }

      if (evalShift) setActiveEvalShift(evalShift);

      return updatedHistory;
    },
    [analyzeCached, buildGameContext, playerColor, playerModel]
  );

  const checkGameOver = useCallback(
    (history: ChessMove[]): boolean => {
      if (wrapperRef.current.isCheckmate()) {
        const winnerColor: Color = wrapperRef.current.getTurn() === 'w' ? 'b' : 'w';
        finishGame(winnerColor === playerColor ? 'win' : 'loss', history);
        return true;
      }
      if (wrapperRef.current.isDraw()) {
        finishGame('draw', history);
        return true;
      }
      return false;
    },
    [finishGame, playerColor]
  );

  /**
   * Takes the authoritative history as an explicit parameter rather than
   * reading the `moveHistory` state — this is called synchronously right
   * after a state update that hasn't re-rendered yet, so the closed-over
   * state would still be stale and the bot's reply would silently drop
   * the move that was just played instead of appending to it.
   */
  const triggerBotMove = useCallback(
    async (historyBeforeBotMove: ChessMove[]) => {
      if (!isGameActive || processingRef.current) return;
      processingRef.current = true;
      setIsBotThinking(true);
      try {
        const fenBefore = wrapperRef.current.getFen();
        const botMove = await defaultChessEngine.getBestMove(fenBefore, { bot: selectedBot });

        const legalMoves = wrapperRef.current.getLegalMoves();
        const isCapture = legalMoves.some((m) => m.from === botMove.from && m.to === botMove.to && m.captured);
        const humanDelay = BotAdaptiveMemory.calculateHumanThinkingDelay(
          selectedBot.useOpeningBook && historyBeforeBotMove.length <= 8,
          isCapture,
          wrapperRef.current.isCheck(),
          legalMoves.length,
          selectedBot.rating
        );
        await new Promise((resolve) => setTimeout(resolve, humanDelay));

        const moveResult = wrapperRef.current.makeMove(botMove.from, botMove.to, botMove.promotion);
        if (!moveResult) return;

        setFen(moveResult.fenAfter);
        setLastMove({ from: moveResult.from, to: moveResult.to });

        const updatedHistory = await enrichAndReactToMove(moveResult, fenBefore, historyBeforeBotMove);
        checkGameOver(updatedHistory);
      } catch (e) {
        console.error('Bot move failed', e);
      } finally {
        setIsBotThinking(false);
        processingRef.current = false;
      }
    },
    [checkGameOver, enrichAndReactToMove, isGameActive, selectedBot]
  );

  const makePlayerMove = useCallback(
    async (from: Square, to: Square, promotion?: PieceSymbol) => {
      if (!isPlayerTurn || processingRef.current) return;
      processingRef.current = true;
      try {
        setActiveIntervention(null);
        const fenBefore = wrapperRef.current.getFen();
        const moveResult = wrapperRef.current.makeMove(from, to, promotion ?? 'q');
        if (!moveResult) return;

        setFen(moveResult.fenAfter);
        setLastMove({ from, to });

        const updatedHistory = await enrichAndReactToMove(moveResult, fenBefore, moveHistory);
        const isOver = checkGameOver(updatedHistory);
        if (!isOver) {
          processingRef.current = false;
          triggerBotMove(updatedHistory);
          return;
        }
      } finally {
        processingRef.current = false;
      }
    },
    [checkGameOver, enrichAndReactToMove, isPlayerTurn, moveHistory, triggerBotMove]
  );

  const takeback = useCallback(() => {
    if (!isGameActive || processingRef.current || moveHistory.length === 0) return;

    wrapperRef.current.undoMove();
    if (wrapperRef.current.getTurn() !== playerColor) {
      wrapperRef.current.undoMove();
    }

    const remaining = wrapperRef.current.getMoveCount();
    const updatedHistory = moveHistory.slice(0, remaining);
    setMoveHistory(updatedHistory);
    setFen(wrapperRef.current.getFen());
    const newLast = updatedHistory[updatedHistory.length - 1];
    setLastMove(newLast ? { from: newLast.from, to: newLast.to } : null);
    setActiveIntervention(null);
    setActiveEvalShift(null);
    // The cached "after" eval no longer corresponds to the current
    // position now that a move's been undone.
    analysisCacheRef.current = null;
  }, [isGameActive, moveHistory, playerColor]);

  const resign = useCallback(() => {
    if (!isGameActive) return;
    finishGame('loss', moveHistory);
  }, [finishGame, isGameActive, moveHistory]);

  const newGame = useCallback(
    (color: Color, bot?: BotProfile) => {
      wrapperRef.current = new ChessGameWrapper();
      processingRef.current = false;
      setFen(wrapperRef.current.getFen());
      setPlayerColor(color);
      setMoveHistory([]);
      setLastMove(null);
      setIsBotThinking(false);
      setIsGameActive(true);
      setCurrentOpening(undefined);
      setActiveIntervention(null);
      setActiveEvalShift(null);
      setSummary(null);
      setPlayerTimeSec(TIME_CONTROL_SECONDS);
      setOpponentTimeSec(TIME_CONTROL_SECONDS);
      // Starting fresh — any cached eval belongs to the previous game's position.
      analysisCacheRef.current = null;
      if (bot) {
        setSelectedBot(bot);
        setSetting(SettingsKeys.SELECTED_BOT_ID, bot.id).catch((e) => console.error('Failed to persist selected bot', e));
      }

      if (color === 'b') {
        setTimeout(() => triggerBotMove([]), 400);
      }
    },
    [triggerBotMove]
  );

  return {
    fen,
    playerColor,
    playerName,
    playerModel,
    isPlayerModelLoaded,
    moveHistory,
    lastMove,
    selectedBot,
    availableBots: CHESS_BOTS,
    isBotThinking,
    isGameActive,
    isPlayerTurn,
    isCheck,
    currentOpening,
    material,
    playerTimeSec,
    opponentTimeSec,
    activeIntervention,
    activeEvalShift,
    summary,
    dismissIntervention: () => setActiveIntervention(null),
    dismissEvalShift: () => setActiveEvalShift(null),
    makePlayerMove,
    takeback,
    resign,
    newGame,
    setSelectedBot,
  };
}

export type LiveGame = ReturnType<typeof useLiveGame>;

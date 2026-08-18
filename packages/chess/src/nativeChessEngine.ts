import { PieceSymbol, Square } from '@tempo/shared';
import { EngineAnalysis } from './types';

// -------------------------------------------------------------
// Native Chess Engine — the boundary a real UCI engine (Stockfish) sits
// behind. The product layer talks to this interface only; it never
// depends on how the search actually runs.
//
// OfflineChessEngine (engine.ts) is a genuine, working implementation of
// this same shape of contract in pure TypeScript — it's the automatic
// fallback on platforms where the native module isn't available (web,
// or a native init failure), not a placeholder. Chess is the source of
// truth for chess calculation either way; the LLM never computes moves.
// -------------------------------------------------------------

export interface NativeEngineOptions {
  /** Search depth in plies. */
  depth?: number;
  /** Alternative to depth: a time budget in milliseconds. */
  movetimeMs?: number;
  /** UCI_Elo-style strength limiting, when the backend supports it. */
  skillLevel?: number;
}

export interface NativeBestMoveResult {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san: string;
}

export interface NativeChessEngine {
  /** Starts the engine process/module. Must not throw on a platform
   * without a native implementation — isReady() reports that instead. */
  initialize(): Promise<void>;
  isReady(): boolean;
  analyze(fen: string, options?: NativeEngineOptions): Promise<EngineAnalysis>;
  bestMove(fen: string, options?: NativeEngineOptions): Promise<NativeBestMoveResult>;
  /** Cancels an in-flight search without tearing down the engine. */
  stop(): void;
  /** Shuts the engine process/module down entirely. */
  terminate(): Promise<void>;
}

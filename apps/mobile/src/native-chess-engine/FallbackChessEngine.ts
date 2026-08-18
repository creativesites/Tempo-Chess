import {
  EngineAnalysis,
  NativeBestMoveResult,
  NativeChessEngine,
  NativeEngineOptions,
  defaultChessEngine,
} from '@tempo/chess';

/**
 * Wraps the existing pure-TypeScript minimax engine (real, tested since
 * Phase 5 — not a placeholder) behind the NativeChessEngine contract.
 * This is what the app uses on web, and the automatic fallback on
 * native if the Stockfish module fails to initialize (unsupported ABI,
 * device without a required instruction set, etc.) — the player always
 * gets a working engine, just not always the strongest one available.
 */
export class FallbackChessEngine implements NativeChessEngine {
  async initialize(): Promise<void> {
    // Nothing to start — the TS engine has no process/module lifecycle.
  }

  isReady(): boolean {
    return true;
  }

  async analyze(fen: string, options?: NativeEngineOptions): Promise<EngineAnalysis> {
    return defaultChessEngine.analyze(fen, { depth: options?.depth });
  }

  async bestMove(fen: string, options?: NativeEngineOptions): Promise<NativeBestMoveResult> {
    const move = await defaultChessEngine.getBestMove(fen, { depth: options?.depth });
    return move;
  }

  stop(): void {
    // The TS search is synchronous per call and already depth-bounded;
    // there is nothing in flight to cancel.
  }

  async terminate(): Promise<void> {
    // No-op — see initialize().
  }
}

import { NativeChessEngine } from '@tempo/chess';

import { FallbackChessEngine } from './FallbackChessEngine';

export type ChessEngineBackend = 'native_stockfish' | 'fallback_ts_engine';

// Web has no native Stockfish binding at all (see StockfishEngine.ts's
// docblock) — this file exists so Metro's platform resolution never
// even attempts to bundle that import chain for the web target. The
// pure-TS engine is a real, working engine, not a placeholder.
const engine = new FallbackChessEngine();

export async function getChessEngine(): Promise<NativeChessEngine> {
  return engine;
}

export function getActiveChessEngineBackend(): ChessEngineBackend | null {
  return 'fallback_ts_engine';
}

export { StockfishRuntime } from './StockfishRuntime';

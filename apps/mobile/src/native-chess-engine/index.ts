import { NativeChessEngine } from '@tempo/chess';

import { FallbackChessEngine } from './FallbackChessEngine';
import { QueuedChessEngine } from './QueuedChessEngine';
import { StockfishEngine } from './StockfishEngine';

export type ChessEngineBackend = 'native_stockfish' | 'fallback_ts_engine';

let resolvedEngine: NativeChessEngine | null = null;
let resolvedBackend: ChessEngineBackend | null = null;
let initPromise: Promise<{ engine: NativeChessEngine; backend: ChessEngineBackend }> | null = null;

/**
 * Real native chess engine boundary (Android/iOS): tries the actual
 * Stockfish process first, and only falls back to the pure-TS engine if
 * native init genuinely fails (unsupported device ABI, module not
 * linked in this build, etc.) — never a silent fake, always logged and
 * reported via getActiveChessEngineBackend(). Wrapped in QueuedChessEngine
 * so callers never have to serialize calls themselves — see
 * StockfishEngine's single-search-at-a-time constraint.
 */
async function resolveEngine(): Promise<{ engine: NativeChessEngine; backend: ChessEngineBackend }> {
  try {
    await StockfishEngine.initialize();
    return { engine: new QueuedChessEngine(StockfishEngine), backend: 'native_stockfish' };
  } catch (e) {
    console.warn('Native Stockfish engine unavailable, using the TypeScript fallback engine:', e);
    return { engine: new QueuedChessEngine(new FallbackChessEngine()), backend: 'fallback_ts_engine' };
  }
}

export async function getChessEngine(): Promise<NativeChessEngine> {
  if (resolvedEngine) return resolvedEngine;
  if (!initPromise) initPromise = resolveEngine();
  const { engine, backend } = await initPromise;
  resolvedEngine = engine;
  resolvedBackend = backend;
  return engine;
}

/** For UI (Profile screen) to show which engine is actually active —
 * real status, not a guess. Null until getChessEngine() has resolved. */
export function getActiveChessEngineBackend(): ChessEngineBackend | null {
  return resolvedBackend;
}

export { StockfishRuntime } from './StockfishRuntime';

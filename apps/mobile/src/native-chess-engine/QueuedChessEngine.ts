import { EngineAnalysis, NativeBestMoveResult, NativeChessEngine, NativeEngineOptions } from '@tempo/chess';

/**
 * Serializes analyze()/bestMove() calls against the wrapped engine so
 * overlapping callers queue instead of racing. This matters for
 * StockfishEngine specifically — its underlying UCI process can only run
 * one search at a time and throws if a second one starts mid-search — but
 * wrapping every backend uniformly means callers never have to know or
 * care which engine is actually behind this interface.
 */
export class QueuedChessEngine implements NativeChessEngine {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly inner: NativeChessEngine) {}

  private enqueue<T>(run: () => Promise<T>): Promise<T> {
    const result = this.queue.then(run, run);
    this.queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  initialize(): Promise<void> {
    return this.inner.initialize();
  }

  isReady(): boolean {
    return this.inner.isReady();
  }

  analyze(fen: string, options?: NativeEngineOptions): Promise<EngineAnalysis> {
    return this.enqueue(() => this.inner.analyze(fen, options));
  }

  bestMove(fen: string, options?: NativeEngineOptions): Promise<NativeBestMoveResult> {
    return this.enqueue(() => this.inner.bestMove(fen, options));
  }

  stop(): void {
    this.inner.stop();
  }

  terminate(): Promise<void> {
    return this.inner.terminate();
  }
}

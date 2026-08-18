import { EngineAnalysis, NativeBestMoveResult, NativeChessEngine, NativeEngineOptions } from '@tempo/chess';
import { Square, PieceSymbol } from '@tempo/shared';
import { Chess } from 'chess.js';

type Bridge = {
  stockfishLoop: () => void;
  stopStockfish: () => void;
  sendCommandToStockfish: (command: string) => void;
};

interface PendingSearch {
  fen: string;
  bestScoreCp: number;
  bestScoreIsMate: boolean;
  bestMateIn?: number;
  depthReached: number;
  pv: string[];
  resolve: (result: { bestMoveUci: string; analysis: Omit<EngineAnalysis, 'bestMoveSan' | 'bestMoveLan'> }) => void;
  reject: (err: Error) => void;
}

const DEFAULT_DEPTH = 12;
const INIT_TIMEOUT_MS = 8000;

/**
 * Imperative singleton that speaks the UCI protocol to the real
 * Stockfish process running behind @udaychauhan/react-native-stockfish.
 * The npm package only exposes a React hook (useStockfish), so
 * StockfishRuntime.tsx mounts that hook once at the app root and wires
 * its callbacks into this class via attachBridge()/handleOutput() —
 * everything else in the app talks to this singleton, not the hook.
 */
class StockfishEngineImpl implements NativeChessEngine {
  private bridge: Bridge | null = null;
  private uciReady = false;
  private engineReady = false;
  private readyWaiters: Array<() => void> = [];
  private pendingSearch: PendingSearch | null = null;
  private initPromise: Promise<void> | null = null;

  attachBridge(bridge: Bridge) {
    this.bridge = bridge;
    this.bridge.stockfishLoop();
    this.bridge.sendCommandToStockfish('uci');
  }

  detachBridge() {
    this.bridge?.stopStockfish();
    this.bridge = null;
    this.uciReady = false;
    this.engineReady = false;
  }

  handleOutput(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed === 'uciok') {
      this.uciReady = true;
      this.bridge?.sendCommandToStockfish('isready');
      return;
    }
    if (trimmed === 'readyok') {
      this.engineReady = true;
      this.readyWaiters.forEach((resolve) => resolve());
      this.readyWaiters = [];
      return;
    }
    if (trimmed.startsWith('info') && this.pendingSearch) {
      this.parseInfoLine(trimmed, this.pendingSearch);
      return;
    }
    if (trimmed.startsWith('bestmove') && this.pendingSearch) {
      const search = this.pendingSearch;
      this.pendingSearch = null;
      const parts = trimmed.split(/\s+/);
      const bestMoveUci = parts[1] ?? '';
      search.resolve({
        bestMoveUci,
        analysis: {
          evaluationCp: search.bestScoreCp,
          isMate: search.bestScoreIsMate,
          mateInMoves: search.bestMateIn,
          depth: search.depthReached,
          pv: search.pv,
        },
      });
    }
  }

  handleError(message: string) {
    if (this.pendingSearch) {
      this.pendingSearch.reject(new Error(`Stockfish error: ${message}`));
      this.pendingSearch = null;
    }
  }

  private parseInfoLine(line: string, search: PendingSearch) {
    const depthMatch = line.match(/\bdepth (\d+)/);
    if (depthMatch) search.depthReached = parseInt(depthMatch[1], 10);

    const mateMatch = line.match(/\bscore mate (-?\d+)/);
    const cpMatch = line.match(/\bscore cp (-?\d+)/);
    if (mateMatch) {
      search.bestScoreIsMate = true;
      search.bestMateIn = parseInt(mateMatch[1], 10);
      search.bestScoreCp = search.bestMateIn > 0 ? 30000 : -30000;
    } else if (cpMatch) {
      search.bestScoreIsMate = false;
      search.bestScoreCp = parseInt(cpMatch[1], 10);
    }

    const pvMatch = line.match(/\bpv (.+)$/);
    if (pvMatch) search.pv = pvMatch[1].trim().split(/\s+/);
  }

  async initialize(): Promise<void> {
    if (this.engineReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stockfish did not become ready in time'));
      }, INIT_TIMEOUT_MS);

      this.readyWaiters.push(() => {
        clearTimeout(timeout);
        resolve();
      });

      // If the bridge attaches after initialize() was already called,
      // attachBridge() itself kicks off the uci/isready handshake, so
      // there's nothing more to send here — just wait.
      if (this.bridge && this.uciReady) {
        this.bridge.sendCommandToStockfish('isready');
      }
    });

    return this.initPromise;
  }

  isReady(): boolean {
    return this.engineReady && !!this.bridge;
  }

  private uciMoveToResult(fen: string, uciMove: string): NativeBestMoveResult {
    const chess = new Chess(fen);
    const from = uciMove.slice(0, 2) as Square;
    const to = uciMove.slice(2, 4) as Square;
    const promotion = uciMove.length > 4 ? (uciMove[4] as PieceSymbol) : undefined;
    const move = chess.move({ from, to, promotion: promotion ?? 'q' });
    if (!move) {
      throw new Error(`Stockfish returned an illegal move "${uciMove}" for position ${fen}`);
    }
    return { from, to, promotion, san: move.san };
  }

  private async search(fen: string, options?: NativeEngineOptions): Promise<{
    bestMoveUci: string;
    analysis: Omit<EngineAnalysis, 'bestMoveSan' | 'bestMoveLan'>;
  }> {
    if (!this.isReady()) {
      await this.initialize();
    }
    if (!this.bridge) {
      throw new Error('Stockfish bridge is not attached');
    }
    if (this.pendingSearch) {
      throw new Error('A Stockfish search is already in progress');
    }

    return new Promise((resolve, reject) => {
      this.pendingSearch = {
        fen,
        bestScoreCp: 0,
        bestScoreIsMate: false,
        depthReached: 0,
        pv: [],
        resolve,
        reject,
      };

      this.bridge!.sendCommandToStockfish(`position fen ${fen}`);
      if (options?.skillLevel !== undefined) {
        this.bridge!.sendCommandToStockfish(`setoption name Skill Level value ${options.skillLevel}`);
      }
      if (options?.movetimeMs) {
        this.bridge!.sendCommandToStockfish(`go movetime ${options.movetimeMs}`);
      } else {
        this.bridge!.sendCommandToStockfish(`go depth ${options?.depth ?? DEFAULT_DEPTH}`);
      }
    });
  }

  async analyze(fen: string, options?: NativeEngineOptions): Promise<EngineAnalysis> {
    const { bestMoveUci, analysis } = await this.search(fen, options);
    const bestMove = bestMoveUci && bestMoveUci !== '(none)' ? this.uciMoveToResult(fen, bestMoveUci) : null;
    return {
      ...analysis,
      bestMoveSan: bestMove?.san ?? '',
      bestMoveLan: bestMoveUci,
    };
  }

  async bestMove(fen: string, options?: NativeEngineOptions): Promise<NativeBestMoveResult> {
    const { bestMoveUci } = await this.search(fen, options);
    if (!bestMoveUci || bestMoveUci === '(none)') {
      throw new Error('Stockfish found no legal move (checkmate or stalemate position)');
    }
    return this.uciMoveToResult(fen, bestMoveUci);
  }

  stop(): void {
    this.bridge?.sendCommandToStockfish('stop');
  }

  async terminate(): Promise<void> {
    this.detachBridge();
    this.initPromise = null;
  }
}

export const StockfishEngine = new StockfishEngineImpl();

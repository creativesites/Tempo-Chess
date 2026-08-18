import { Chess, Move as ChessJsMove } from 'chess.js';
import { ChessMove, MoveClassification, Square, PieceSymbol, Color } from '@tempo/shared';
import { EngineAnalysis, EngineOptions, BotProfile } from './types';
import { PIECE_VALUES } from './rules';
import { OPENING_BOOK } from './openingBook';
import { DEFAULT_BOT } from './bots';
import { BotAdaptiveMemory } from './botMemory';

export interface IChessEngine {
  analyze(fen: string, options?: EngineOptions): Promise<EngineAnalysis>;
  getBestMove(fen: string, options?: EngineOptions): Promise<{ from: Square; to: Square; promotion?: PieceSymbol; san: string }>;
}

// -----------------------------------------------------------------------------
// Piece-Square Tables (PST) - Sophisticated Midgame & Endgame Tables
// -----------------------------------------------------------------------------

const PAWN_TABLE_MG: number[][] = [
  [0,   0,   0,   0,   0,   0,   0,   0],
  [50,  50,  50,  50,  50,  50,  50,  50],
  [15,  15,  25,  35,  35,  25,  15,  15],
  [5,   5,  20,  30,  30,  20,   5,   5],
  [0,   0,  10,  25,  25,  10,   0,   0],
  [5,  -5, -10,   5,   5, -10,  -5,   5],
  [5,  10,  10, -25, -25,  10,  10,   5],
  [0,   0,   0,   0,   0,   0,   0,   0]
];

const PAWN_TABLE_EG: number[][] = [
  [0,   0,   0,   0,   0,   0,   0,   0],
  [90,  90,  90,  90,  90,  90,  90,  90],
  [60,  60,  60,  60,  60,  60,  60,  60],
  [40,  40,  40,  40,  40,  40,  40,  40],
  [25,  25,  25,  25,  25,  25,  25,  25],
  [15,  15,  15,  15,  15,  15,  15,  15],
  [5,   5,   5,   5,   5,   5,   5,   5],
  [0,   0,   0,   0,   0,   0,   0,   0]
];

const KNIGHT_TABLE: number[][] = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-30,  5, 20, 25, 25, 20,  5,-30],
  [-30,  5, 25, 30, 30, 25,  5,-30],
  [-30,  5, 25, 30, 30, 25,  5,-30],
  [-30,  5, 20, 25, 25, 20,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE: number[][] = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-10, 10, 15, 20, 20, 15, 10,-10],
  [-10, 10, 20, 25, 25, 20, 10,-10],
  [-10, 10, 20, 25, 25, 20, 10,-10],
  [-10, 15, 15, 20, 20, 15, 15,-10],
  [-10,  5,  5,  5,  5,  5,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE: number[][] = [
  [0,   0,   0,   5,   5,   0,   0,   0],
  [15, 25,  25,  25,  25,  25,  25,  15],
  [-5,  0,   0,   0,   0,   0,   0,  -5],
  [-5,  0,   0,   0,   0,   0,   0,  -5],
  [-5,  0,   0,   0,   0,   0,   0,  -5],
  [-5,  0,   0,   0,   0,   0,   0,  -5],
  [-5,  0,   0,   0,   0,   0,   0,  -5],
  [0,   0,   5,  15,  15,   5,   0,   0]
];

const QUEEN_TABLE: number[][] = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-5,   0,  5, 10, 10,  5,  0, -5],
  [0,    0,  5, 10, 10,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDGAME_TABLE: number[][] = [
  [-40,-50,-50,-60,-60,-50,-50,-40],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20,  20,  0,  -5,  -5,  0,  20,  20],
  [25,  35, 15, -10, -10, 15,  35,  25]
];

const KING_ENDGAME_TABLE: number[][] = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  5,  5,-10,-20,-30],
  [-30,-10, 25, 35, 35, 25,-10,-30],
  [-30,-10, 35, 50, 50, 35,-10,-30],
  [-30,-10, 35, 50, 50, 35,-10,-30],
  [-30,-10, 25, 35, 35, 25,-10,-30],
  [-30,-20,  0, 10, 10,  0,-20,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

// -----------------------------------------------------------------------------
// Transposition Table Entry
// -----------------------------------------------------------------------------
interface TTEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lowerbound' | 'upperbound';
  bestMove?: ChessJsMove;
}

export class OfflineChessEngine implements IChessEngine {
  private transpositionTable: Map<string, TTEntry> = new Map();
  private killerMoves: [ChessJsMove | null, ChessJsMove | null][] = Array(32).fill(null).map(() => [null, null]);
  private historyTable: number[][] = Array(64).fill(0).map(() => Array(64).fill(0));

  /**
   * Fast position evaluation in centipawns (from White perspective)
   */
  public evaluatePosition(chess: Chess, bot?: BotProfile): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -30000 : 30000;
    }
    if (chess.isDraw()) return 0;

    let mgScore = 0;
    let egScore = 0;
    const board = chess.board();

    let totalNonPawnMaterial = 0;
    let whiteBishops = 0;
    let blackBishops = 0;
    let whitePawnsByFile: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    let blackPawnsByFile: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

    // 1. Piece Counting & PST Table Scoring
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;

        const isWhite = p.color === 'w';
        const val = PIECE_VALUES[p.type as PieceSymbol] || 0;

        if (p.type !== 'p' && p.type !== 'k') {
          totalNonPawnMaterial += val;
        }

        const tableR = isWhite ? r : 7 - r;
        const tableC = c;

        let mgVal = val;
        let egVal = val;

        switch (p.type) {
          case 'p':
            mgVal += PAWN_TABLE_MG[tableR][tableC];
            egVal += PAWN_TABLE_EG[tableR][tableC];
            if (isWhite) whitePawnsByFile[c]++;
            else blackPawnsByFile[c]++;
            break;
          case 'n':
            mgVal += KNIGHT_TABLE[tableR][tableC];
            egVal += KNIGHT_TABLE[tableR][tableC];
            // Outpost Knight bonus on ranks 4, 5, 6 (r=4,3,2 for White; r=3,4,5 for Black)
            if (isWhite && r <= 4 && r >= 2 && c >= 2 && c <= 5) mgVal += 18;
            if (!isWhite && r >= 3 && r <= 5 && c >= 2 && c <= 5) mgVal += 18;
            break;
          case 'b':
            mgVal += BISHOP_TABLE[tableR][tableC];
            egVal += BISHOP_TABLE[tableR][tableC];
            if (isWhite) whiteBishops++;
            else blackBishops++;
            break;
          case 'r':
            mgVal += ROOK_TABLE[tableR][tableC];
            egVal += ROOK_TABLE[tableR][tableC];
            // Rook on 7th rank bonus
            if (isWhite && r === 1) { mgVal += 25; egVal += 35; }
            if (!isWhite && r === 6) { mgVal += 25; egVal += 35; }
            break;
          case 'q':
            mgVal += QUEEN_TABLE[tableR][tableC];
            egVal += QUEEN_TABLE[tableR][tableC];
            break;
          case 'k':
            mgVal += KING_MIDGAME_TABLE[tableR][tableC];
            egVal += KING_ENDGAME_TABLE[tableR][tableC];
            break;
        }

        if (isWhite) {
          mgScore += mgVal;
          egScore += egVal;
        } else {
          mgScore -= mgVal;
          egScore -= egVal;
        }
      }
    }

    // 2. Bishop Pair Bonus
    if (whiteBishops >= 2) { mgScore += 35; egScore += 45; }
    if (blackBishops >= 2) { mgScore -= 35; egScore -= 45; }

    // 3. Pawn Structure (Doubled / Isolated Pawns)
    for (let c = 0; c < 8; c++) {
      // Doubled pawns
      if (whitePawnsByFile[c] > 1) { mgScore -= 18 * (whitePawnsByFile[c] - 1); egScore -= 22 * (whitePawnsByFile[c] - 1); }
      if (blackPawnsByFile[c] > 1) { mgScore += 18 * (blackPawnsByFile[c] - 1); egScore += 22 * (blackPawnsByFile[c] - 1); }

      // Isolated pawns (no friendly pawns on adjacent files)
      const leftW = c > 0 ? whitePawnsByFile[c - 1] : 0;
      const rightW = c < 7 ? whitePawnsByFile[c + 1] : 0;
      if (whitePawnsByFile[c] > 0 && leftW === 0 && rightW === 0) {
        mgScore -= 15;
        egScore -= 25;
      }

      const leftB = c > 0 ? blackPawnsByFile[c - 1] : 0;
      const rightB = c < 7 ? blackPawnsByFile[c + 1] : 0;
      if (blackPawnsByFile[c] > 0 && leftB === 0 && rightB === 0) {
        mgScore += 15;
        egScore += 25;
      }
    }

    // 4. Game Phase Interpolation (Tapered Eval)
    // Maximum non-pawn material at start is 2 * (320*2 + 330*2 + 500*2 + 900) = 6400
    const phase = Math.min(1.0, Math.max(0.0, totalNonPawnMaterial / 5800));
    let finalScore = Math.round(mgScore * phase + egScore * (1.0 - phase));

    // 5. Bot Persona Adjustments
    if (bot) {
      if (bot.aggressiveness > 0.7) {
        // Boosts initiative / attack tension
        finalScore += chess.inCheck() ? (chess.turn() === 'w' ? -25 : 25) : 0;
      }
    }

    return finalScore;
  }

  /**
   * Sorts moves to maximize Alpha-Beta cutoffs (TT move, MVV-LVA, Killer, History)
   */
  private sortMoves(moves: ChessJsMove[], ply: number, ttMove?: ChessJsMove): ChessJsMove[] {
    return moves.sort((a, b) => {
      // 1. Transposition table best move
      if (ttMove && a.san === ttMove.san) return -100000;
      if (ttMove && b.san === ttMove.san) return 100000;

      // 2. MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
      if (a.captured || b.captured) {
        const aVictim = a.captured ? (PIECE_VALUES[a.captured as PieceSymbol] || 0) : 0;
        const aAttacker = PIECE_VALUES[a.piece as PieceSymbol] || 0;
        const aScore = aVictim * 10 - aAttacker;

        const bVictim = b.captured ? (PIECE_VALUES[b.captured as PieceSymbol] || 0) : 0;
        const bAttacker = PIECE_VALUES[b.piece as PieceSymbol] || 0;
        const bScore = bVictim * 10 - bAttacker;

        if (aScore !== bScore) return bScore - aScore;
      }

      // 3. Promotions
      if (a.promotion && !b.promotion) return -5000;
      if (!a.promotion && b.promotion) return 5000;

      // 4. Killer Moves
      const killers = this.killerMoves[ply] || [null, null];
      if (killers[0] && a.san === killers[0].san) return -3000;
      if (killers[0] && b.san === killers[0].san) return 3000;
      if (killers[1] && a.san === killers[1].san) return -2000;
      if (killers[1] && b.san === killers[1].san) return 2000;

      // 5. History Heuristic
      const aFromIdx = (a.from.charCodeAt(0) - 97) + (parseInt(a.from[1]) - 1) * 8;
      const aToIdx = (a.to.charCodeAt(0) - 97) + (parseInt(a.to[1]) - 1) * 8;
      const aHist = this.historyTable[aFromIdx]?.[aToIdx] || 0;

      const bFromIdx = (b.from.charCodeAt(0) - 97) + (parseInt(b.from[1]) - 1) * 8;
      const bToIdx = (b.to.charCodeAt(0) - 97) + (parseInt(b.to[1]) - 1) * 8;
      const bHist = this.historyTable[bFromIdx]?.[bToIdx] || 0;

      return bHist - aHist;
    });
  }

  /**
   * Quiescence Search - evaluates noisy moves to prevent the Horizon Effect
   */
  private quiescence(
    chess: Chess,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    bot?: BotProfile,
    qDepth: number = 0
  ): number {
    const standPat = this.evaluatePosition(chess, bot);

    if (qDepth >= 4) return standPat;

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      alpha = Math.max(alpha, standPat);

      const captures = chess.moves({ verbose: true }).filter(m => m.captured || m.promotion || m.san.includes('+'));
      const sortedCaptures = this.sortMoves(captures, 0);

      for (const move of sortedCaptures) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, false, bot, qDepth + 1);
        chess.undo();

        if (score >= beta) return beta;
        alpha = Math.max(alpha, score);
      }
      return alpha;
    } else {
      if (standPat <= alpha) return alpha;
      beta = Math.min(beta, standPat);

      const captures = chess.moves({ verbose: true }).filter(m => m.captured || m.promotion || m.san.includes('+'));
      const sortedCaptures = this.sortMoves(captures, 0);

      for (const move of sortedCaptures) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, true, bot, qDepth + 1);
        chess.undo();

        if (score <= alpha) return alpha;
        beta = Math.min(beta, score);
      }
      return beta;
    }
  }

  /**
   * Principal Minimax with Alpha-Beta Pruning, Transposition Table, and Quiescence
   */
  public minimax(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    bot?: BotProfile,
    ply: number = 0
  ): { score: number; bestMove?: ChessJsMove; rankedMoves?: { move: ChessJsMove; score: number }[] } {
    if (depth <= 0) {
      return { score: this.quiescence(chess, alpha, beta, isMaximizing, bot) };
    }

    if (chess.isGameOver()) {
      return { score: this.evaluatePosition(chess, bot) };
    }

    const fen = chess.fen();
    const ttEntry = this.transpositionTable.get(fen);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'exact') return { score: ttEntry.score, bestMove: ttEntry.bestMove };
      if (ttEntry.flag === 'lowerbound' && ttEntry.score >= beta) return { score: ttEntry.score, bestMove: ttEntry.bestMove };
      if (ttEntry.flag === 'upperbound' && ttEntry.score <= alpha) return { score: ttEntry.score, bestMove: ttEntry.bestMove };
    }

    const rawMoves = chess.moves({ verbose: true });
    if (rawMoves.length === 0) {
      return { score: this.evaluatePosition(chess, bot) };
    }

    const moves = this.sortMoves(rawMoves, ply, ttEntry?.bestMove);
    let bestMove: ChessJsMove | undefined = moves[0];
    const scoredMoves: { move: ChessJsMove; score: number }[] = [];

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const result = this.minimax(chess, depth - 1, alpha, beta, false, bot, ply + 1);
        chess.undo();

        scoredMoves.push({ move, score: result.score });

        if (result.score > maxEval) {
          maxEval = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) {
          // Record killer move
          if (!move.captured && ply < 32) {
            this.killerMoves[ply][1] = this.killerMoves[ply][0];
            this.killerMoves[ply][0] = move;
          }
          break; // Beta cutoff
        }
      }

      // Save to Transposition Table
      let flag: 'exact' | 'lowerbound' | 'upperbound' = 'exact';
      if (maxEval <= alpha) flag = 'upperbound';
      else if (maxEval >= beta) flag = 'lowerbound';

      this.transpositionTable.set(fen, { depth, score: maxEval, flag, bestMove });
      return { score: maxEval, bestMove, rankedMoves: scoredMoves.sort((a, b) => b.score - a.score) };
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const result = this.minimax(chess, depth - 1, alpha, beta, true, bot, ply + 1);
        chess.undo();

        scoredMoves.push({ move, score: result.score });

        if (result.score < minEval) {
          minEval = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, result.score);
        if (beta <= alpha) {
          if (!move.captured && ply < 32) {
            this.killerMoves[ply][1] = this.killerMoves[ply][0];
            this.killerMoves[ply][0] = move;
          }
          break; // Alpha cutoff
        }
      }

      let flag: 'exact' | 'lowerbound' | 'upperbound' = 'exact';
      if (minEval >= beta) flag = 'lowerbound';
      else if (minEval <= alpha) flag = 'upperbound';

      this.transpositionTable.set(fen, { depth, score: minEval, flag, bestMove });
      return { score: minEval, bestMove, rankedMoves: scoredMoves.sort((a, b) => a.score - b.score) };
    }
  }

  public async analyze(fen: string, options?: EngineOptions): Promise<EngineAnalysis> {
    const chess = new Chess(fen);
    const depth = options?.depth || (options?.bot ? Math.min(options.bot.depth, 5) : 3);
    const isWhite = chess.turn() === 'w';

    const result = this.minimax(chess, depth, -Infinity, Infinity, isWhite, options?.bot);
    const evalCp = isWhite ? result.score : -result.score;

    return {
      evaluationCp: evalCp,
      isMate: chess.isCheckmate(),
      bestMoveSan: result.bestMove?.san || '',
      bestMoveLan: result.bestMove?.lan || '',
      depth,
      pv: result.bestMove ? [result.bestMove.san] : []
    };
  }

  public async getBestMove(
    fen: string,
    options?: EngineOptions
  ): Promise<{ from: Square; to: Square; promotion?: PieceSymbol; san: string }> {
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    const bot = options?.bot || DEFAULT_BOT;
    const isWhite = chess.turn() === 'w';

    // 1. Dynamic Adaptive Opening Book Check
    if (bot.useOpeningBook) {
      const bookEntry = OPENING_BOOK[fen];
      if (bookEntry && bookEntry.moves.length > 0) {
        const validBookMoves = bookEntry.moves.filter(san =>
          legalMoves.some(m => m.san === san)
        );
        if (validBookMoves.length > 0) {
          // Use BotAdaptiveMemory to dynamically select opening moves and avoid repeated failures
          const chosenSan = BotAdaptiveMemory.selectAdaptiveBookMove(fen, bot, validBookMoves);
          if (chosenSan) {
            const matchingMove = legalMoves.find(m => m.san === chosenSan);
            if (matchingMove) {
              return {
                from: matchingMove.from as Square,
                to: matchingMove.to as Square,
                promotion: matchingMove.promotion as PieceSymbol | undefined,
                san: matchingMove.san
              };
            }
          }
        }
      }
    }

    // 2. Personality Trait: Early Queen Attackers (e.g. Nelson 1300)
    if (bot.id === 'bot_nelson' && chess.history().length < 8) {
      const queenMoves = legalMoves.filter(m => m.piece === 'q' && !m.san.includes('O-O'));
      if (queenMoves.length > 0 && Math.random() < 0.40) {
        const qMove = queenMoves[Math.floor(Math.random() * queenMoves.length)];
        return {
          from: qMove.from as Square,
          to: qMove.to as Square,
          promotion: qMove.promotion as PieceSymbol | undefined,
          san: qMove.san
        };
      }
    }

    // 3. Search at Calibrated Depth with Alpha-Beta Pruning
    const searchDepth = Math.max(1, bot.depth);
    const result = this.minimax(chess, searchDepth, -Infinity, Infinity, isWhite, bot);
    const ranked = result.rankedMoves || [];

    // 4. Human-like Sub-optimal Move Selection for Lower Rated Bots
    // Rather than completely random nonsensical moves, authentic humans pick slightly inaccurate candidate moves
    const roll = Math.random();
    if (roll < bot.blunderRate && ranked.length > 1) {
      // Blunder: Choose a candidate move with tactical flaw
      const blunderPool = ranked.slice(Math.min(2, ranked.length - 1));
      const chosen = blunderPool[Math.floor(Math.random() * blunderPool.length)]?.move || legalMoves[0];
      return {
        from: chosen.from as Square,
        to: chosen.to as Square,
        promotion: chosen.promotion as PieceSymbol | undefined,
        san: chosen.san
      };
    } else if (roll < bot.blunderRate + bot.inaccuracyRate && ranked.length > 2) {
      // Inaccuracy: Pick 2nd or 3rd best move from evaluated candidate tree
      const candidate = ranked[1]?.move || ranked[0]?.move || legalMoves[0];
      return {
        from: candidate.from as Square,
        to: candidate.to as Square,
        promotion: candidate.promotion as PieceSymbol | undefined,
        san: candidate.san
      };
    }

    // Default to the strongest minimax evaluated move
    const chosenMove = result.bestMove || legalMoves[0];
    return {
      from: chosenMove.from as Square,
      to: chosenMove.to as Square,
      promotion: chosenMove.promotion as PieceSymbol | undefined,
      san: chosenMove.san
    };
  }

  public static classifyMove(
    evalBeforeCp: number,
    evalAfterCp: number,
    isWhite: boolean,
    isBook: boolean = false
  ): MoveClassification {
    if (isBook) return 'book';

    const delta = isWhite ? (evalAfterCp - evalBeforeCp) : (evalBeforeCp - evalAfterCp);

    if (delta >= 140) return 'great';
    if (delta >= -15) return 'best';
    if (delta >= -45) return 'good';
    if (delta >= -110) return 'inaccuracy';
    if (delta >= -240) return 'mistake';
    return 'blunder';
  }
}

export const defaultChessEngine = new OfflineChessEngine();

import { Chess, Square as ChessJsSquare, Move as ChessJsMove, PieceSymbol as ChessJsPieceSymbol } from 'chess.js';
import { Square, PieceSymbol, Color, MaterialState, TacticalState, StrategicState, ChessMove, OpeningContext } from '@tempo/shared';
import { OPENING_TREES } from './openingTree';
import { OPENING_BOOK } from './openingBook';

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

// Simplified Piece-Square tables for positional evaluation
const PAWN_PST_WHITE: Record<string, number> = {
  a2: 0, b2: 0, c2: 0, d2: 0, e2: 0, f2: 0, g2: 0, h2: 0,
  a3: 5, b3: 10, c3: 10, d3: -10, e3: -10, f3: 10, g3: 10, h3: 5,
  a4: 5, b4: 10, c4: 15, d4: 25, e4: 25, f4: 15, g4: 10, h4: 5,
  a5: 10, b5: 15, c5: 20, d5: 30, e5: 30, f5: 20, g5: 15, h5: 10,
  a6: 20, b6: 25, c6: 30, d6: 35, e6: 35, f6: 30, g6: 25, h6: 20,
  a7: 50, b7: 50, c7: 50, d7: 50, e7: 50, f7: 50, g7: 50, h7: 50,
  a8: 0, b8: 0, c8: 0, d8: 0, e8: 0, f8: 0, g8: 0, h8: 0,
  a1: 0, b1: 0, c1: 0, d1: 0, e1: 0, f1: 0, g1: 0, h1: 0
};

const KNIGHT_PST: Record<string, number> = {
  a1: -50, b1: -40, c1: -30, d1: -30, e1: -30, f1: -30, g1: -40, h1: -50,
  a2: -40, b2: -20, c2: 0, d2: 5, e2: 5, f2: 0, g2: -20, h2: -40,
  a3: -30, b3: 5, c3: 15, d3: 20, e3: 20, f3: 15, g3: 5, h3: -30,
  a4: -30, b4: 10, c4: 20, d4: 30, e4: 30, f4: 20, g4: 10, h4: -30,
  a5: -30, b5: 10, c5: 20, d5: 30, e5: 30, f5: 20, g5: 10, h5: -30,
  a6: -30, b6: 5, c6: 15, d6: 20, e6: 20, f6: 15, g6: 5, h6: -30,
  a7: -40, b7: -20, c7: 0, d7: 5, e7: 5, f7: 0, g7: -20, h7: -40,
  a8: -50, b8: -40, c8: -30, d8: -30, e8: -30, f8: -30, g8: -40, h8: -50
};

export class ChessGameWrapper {
  public chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getTurn(): Color {
    return this.chess.turn() as Color;
  }

  public isCheck(): boolean {
    return this.chess.isCheck();
  }

  public isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  public isDraw(): boolean {
    return this.chess.isDraw();
  }

  public isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  public getLegalMoves(square?: Square): ChessJsMove[] {
    if (square) {
      return this.chess.moves({ square: square as ChessJsSquare, verbose: true });
    }
    return this.chess.moves({ verbose: true });
  }

  public getPiece(square: Square) {
    return this.chess.get(square as ChessJsSquare);
  }

  /** Reconstructs our ChessMove[] shape from chess.js's own move stack —
   * useful for callers (e.g. after a takeback) that need to resync their
   * tracked history to what the engine actually has. */
  public getMoveHistory(): ChessMove[] {
    return this.chess.history({ verbose: true }).map((m) => ({
      from: m.from as Square,
      to: m.to as Square,
      piece: m.piece as PieceSymbol,
      color: m.color as Color,
      san: m.san,
      lan: m.lan,
      captured: m.captured as PieceSymbol | undefined,
      promotion: m.promotion as PieceSymbol | undefined,
      isCheck: m.san.includes('+') || m.san.includes('#'),
      isCheckmate: m.san.includes('#'),
      fenAfter: m.after,
    }));
  }

  public makeMove(from: Square, to: Square, promotion: PieceSymbol = 'q'): ChessMove | null {
    try {
      const moveResult = this.chess.move({
        from: from as ChessJsSquare,
        to: to as ChessJsSquare,
        promotion: promotion as ChessJsPieceSymbol
      });

      if (!moveResult) return null;

      return {
        from: moveResult.from as Square,
        to: moveResult.to as Square,
        piece: moveResult.piece as PieceSymbol,
        color: moveResult.color as Color,
        san: moveResult.san,
        lan: moveResult.lan,
        captured: moveResult.captured as PieceSymbol | undefined,
        promotion: moveResult.promotion as PieceSymbol | undefined,
        isCheck: this.chess.isCheck(),
        isCheckmate: this.chess.isCheckmate(),
        fenAfter: this.chess.fen()
      };
    } catch {
      return null;
    }
  }

  /**
   * Undoes the last move and returns it (chess.js's own representation),
   * or null if there was nothing to undo.
   */
  public undoMove(): ChessJsMove | null {
    return this.chess.undo();
  }

  public getMoveCount(): number {
    return this.chess.history().length;
  }

  public getPgn(): string {
    return this.chess.pgn();
  }

  public identifyOpening(): OpeningContext | null {
    const currentFen = this.chess.fen();
    const historyMoves = this.chess.history();

    // 1. Direct match with Opening Trees (detailed trees)
    for (const tree of OPENING_TREES) {
      if (tree.children) {
        for (const child of tree.children) {
          if (child.movesSan.length <= historyMoves.length) {
            const matches = child.movesSan.every((m, i) => historyMoves[i] === m);
            if (matches) {
              return {
                eco: child.eco,
                name: child.name,
                variation: child.variation,
                coreIdea: child.coreIdea,
                keyPlans: child.strategicPlans.white.concat(child.strategicPlans.black),
                commonMistakes: child.commonMistakes
              };
            }
          }
        }
      }

      if (tree.movesSan.length <= historyMoves.length) {
        const matches = tree.movesSan.every((m, i) => historyMoves[i] === m);
        if (matches) {
          return {
            eco: tree.eco,
            name: tree.name,
            variation: tree.variation,
            coreIdea: tree.coreIdea,
            keyPlans: tree.strategicPlans.white.concat(tree.strategicPlans.black),
            commonMistakes: tree.commonMistakes
          };
        }
      }
    }

    // 2. Fallback to Opening Book by FEN or moves prefix
    const cleanFen = currentFen.split(' ').slice(0, 4).join(' ');
    for (const [fenKey, bookData] of Object.entries(OPENING_BOOK)) {
      const cleanKey = fenKey.split(' ').slice(0, 4).join(' ');
      if (cleanKey === cleanFen) {
        return {
          eco: 'A00',
          name: bookData.name,
          variation: 'Main Line',
          coreIdea: 'Standard theoretical opening development and central control.',
          keyPlans: ['Develop minor pieces', 'Secure king safety', 'Contest the center'],
          commonMistakes: ['Moving the same piece repeatedly', 'Neglecting king safety']
        };
      }
    }

    return null;
  }

  public calculateMaterial(): MaterialState {
    const board = this.chess.board();
    const white = { p: 0, n: 0, b: 0, r: 0, q: 0, score: 0 };
    const black = { p: 0, n: 0, b: 0, r: 0, q: 0, score: 0 };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type as PieceSymbol] || 0;
        if (piece.color === 'w') {
          if (piece.type in white) {
            white[piece.type as 'p' | 'n' | 'b' | 'r' | 'q']++;
            white.score += val;
          }
        } else {
          if (piece.type in black) {
            black[piece.type as 'p' | 'n' | 'b' | 'r' | 'q']++;
            black.score += val;
          }
        }
      }
    }

    // Initial piece counts
    const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const capturedByWhite: PieceSymbol[] = [];
    const capturedByBlack: PieceSymbol[] = [];

    (['q', 'r', 'b', 'n', 'p'] as const).forEach(type => {
      const missingBlack = Math.max(0, initialCounts[type] - black[type]);
      for (let i = 0; i < missingBlack; i++) capturedByWhite.push(type);

      const missingWhite = Math.max(0, initialCounts[type] - white[type]);
      for (let i = 0; i < missingWhite; i++) capturedByBlack.push(type);
    });

    return {
      white,
      black,
      advantage: white.score - black.score,
      capturedByWhite,
      capturedByBlack
    };
  }

  public calculateTacticalState(): TacticalState {
    const board = this.chess.board();
    const hangingPieces: Square[] = [];
    const filesWithPawns = new Set<string>();

    let kingExposedWhite = false;
    let kingExposedBlack = false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const sq = String.fromCharCode(97 + c) + (8 - r) as Square;
        if (piece.type === 'p') {
          filesWithPawns.add(String.fromCharCode(97 + c));
        }

        // Check if piece is unguarded
        if (piece.type !== 'k') {
          // Simple heuristic for hanging pieces
          if ((r >= 3 && r <= 4) && (piece.type === 'n' || piece.type === 'b' || piece.type === 'q')) {
            // Potential active hanging candidate
          }
        }

        if (piece.type === 'k') {
          // Check pawn shield
          if (piece.color === 'w' && r > 6) {
            // Back rank
          } else if (piece.color === 'w' && r < 6) {
            kingExposedWhite = true;
          }

          if (piece.color === 'b' && r > 1) {
            kingExposedBlack = true;
          }
        }
      }
    }

    const openFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].filter(f => !filesWithPawns.has(f));

    return {
      isPinned: false,
      hangingPieces,
      forkTargets: [],
      kingExposedWhite,
      kingExposedBlack,
      openFiles,
      pawnWeaknesses: []
    };
  }

  public calculateStrategicState(): StrategicState {
    const board = this.chess.board();
    let centerControlWhite = 0;
    let centerControlBlack = 0;
    let devWhite = 0;
    let devBlack = 0;

    // Center squares: e4, d4, e5, d5
    const centerCoords = [[3, 3], [3, 4], [4, 3], [4, 4]];
    centerCoords.forEach(([r, c]) => {
      const p = board[r][c];
      if (p) {
        if (p.color === 'w') centerControlWhite += 2;
        else centerControlBlack += 2;
      }
    });

    // Check development (pieces off back ranks)
    for (let c = 0; c < 8; c++) {
      const pW = board[7][c];
      if (pW && (pW.type === 'n' || pW.type === 'b' || pW.type === 'q')) {
        // Still on back rank
      } else {
        devWhite++;
      }

      const pB = board[0][c];
      if (pB && (pB.type === 'n' || pB.type === 'b' || pB.type === 'q')) {
        // Still on back rank
      } else {
        devBlack++;
      }
    }

    return {
      centerControl: { white: centerControlWhite, black: centerControlBlack },
      developmentCount: { white: devWhite, black: devBlack },
      spaceAdvantage: centerControlWhite > centerControlBlack ? 'white' : centerControlBlack > centerControlWhite ? 'black' : 'equal',
      pawnStructure: 'Fluid'
    };
  }

  public static evaluatePosition(fen: string): number {
    const game = new Chess(fen);
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -9999 : 9999;
    }
    if (game.isDraw()) return 0;

    let score = 0;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const baseVal = PIECE_VALUES[piece.type as PieceSymbol] * 100;
        const sqName = String.fromCharCode(97 + c) + (8 - r);
        let pstBonus = 0;

        if (piece.type === 'p') {
          pstBonus = piece.color === 'w' ? (PAWN_PST_WHITE[sqName] || 0) : -(PAWN_PST_WHITE[sqName] || 0);
        } else if (piece.type === 'n') {
          pstBonus = piece.color === 'w' ? (KNIGHT_PST[sqName] || 0) : -(KNIGHT_PST[sqName] || 0);
        }

        const totalPieceVal = baseVal + pstBonus;
        score += piece.color === 'w' ? totalPieceVal : -totalPieceVal;
      }
    }

    return score; // In centipawns, positive for white
  }
}

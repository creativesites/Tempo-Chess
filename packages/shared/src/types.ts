// -------------------------------------------------------------
// Base chess primitives and the live GameContext shared across every
// domain package (chess, openings, coaching, player-model, game-review,
// training). This package has zero dependencies on the others so it can
// sit at the bottom of the dependency graph.
// -------------------------------------------------------------

export type Square =
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8'
  | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8'
  | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
  | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8'
  | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8'
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export type MoveClassification =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'book'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'missed_win';

export interface ChessMove {
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  san: string;
  lan: string;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  isCheck?: boolean;
  isCheckmate?: boolean;
  fenAfter: string;
  evalBefore?: number;
  evalAfter?: number;
  classification?: MoveClassification;
  coachCommentary?: string;
  timeSpentSeconds?: number;
}

export interface OpeningContext {
  eco: string;
  name: string;
  variation?: string;
  coreIdea: string;
  keyPlans: string[];
  commonMistakes: string[];
  deviationMoveIndex?: number;
  deviationNote?: string;
}

export interface MaterialState {
  white: { p: number; n: number; b: number; r: number; q: number; score: number };
  black: { p: number; n: number; b: number; r: number; q: number; score: number };
  advantage: number; // Positive = white, negative = black
  capturedByWhite: PieceSymbol[];
  capturedByBlack: PieceSymbol[];
}

export interface TacticalState {
  isPinned: boolean;
  hangingPieces: Square[];
  forkTargets: Square[];
  kingExposedWhite: boolean;
  kingExposedBlack: boolean;
  openFiles: string[];
  pawnWeaknesses: string[];
}

export interface StrategicState {
  centerControl: { white: number; black: number };
  developmentCount: { white: number; black: number };
  spaceAdvantage: 'white' | 'black' | 'equal';
  pawnStructure: string;
}

export interface GameEvent {
  moveNumber: number;
  color: Color;
  type: 'tactical_shot' | 'blunder' | 'premature_attack' | 'greed' | 'missed_defense' | 'opening_deviation';
  description: string;
}

export interface PlayerContext {
  color: Color;
  timeControlSeconds: number;
  timeRemainingSeconds: number;
  movesSinceLastMistake: number;
  materialLostRecently: boolean;
}

export interface TeachingContext {
  lastOpportunityMove?: number;
  consecutiveSilentMoves: number;
  coachVerbosity: 'minimal' | 'balanced' | 'comprehensive';
  socraticMode: boolean;
}

/**
 * The full context Tempo's coaching systems reason over — not just the
 * current FEN. See product spec section 18 ("Full Game Context").
 */
export interface GameContext {
  gameId: string;
  currentFen: string;
  moveHistory: ChessMove[];
  whiteMoves: ChessMove[];
  blackMoves: ChessMove[];
  opening?: OpeningContext;
  material: MaterialState;
  tacticalState: TacticalState;
  strategicState: StrategicState;
  criticalEvents: GameEvent[];
  playerContext: PlayerContext;
  teachingContext: TeachingContext;
}

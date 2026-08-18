import { Color, MoveClassification, Square } from '@tempo/shared';

// -------------------------------------------------------------
// Game Review types — Tempo's flagship "what happened / why / what to
// work on next" feature (product spec sections 21-22).
// -------------------------------------------------------------

export type CriticalMomentSeverity = 'minor' | 'important' | 'critical';

export type CriticalMomentCategory =
  | 'tactical'
  | 'strategic'
  | 'opening'
  | 'calculation'
  | 'king_safety'
  | 'endgame'
  | 'time_management'
  | 'planning'
  | 'defense';

export interface AlternativeVariation {
  moves: string[]; // SAN moves sequence
  explanation: string;
  resultingAdvantage?: string;
}

export interface ThinkingFailureInfo {
  missedType: 'opponent_threat' | 'tactical_defender' | 'pinned_piece' | 'back_rank_weakness' | 'forcing_move' | 'king_exposure' | 'premature_attack';
  explanation: string;
  mentalCheckToApply: string;
}

export interface CriticalMoment {
  id: string;
  moveNumber: number;
  playerColor?: Color;
  playedMove: string;
  bestMove: string;
  bestMoves?: string[];
  fenBefore: string;
  fenAfter: string;
  position?: string;
  evaluationBefore?: number;
  evaluationAfter?: number;
  classification: MoveClassification;
  severity: CriticalMomentSeverity;
  category: CriticalMomentCategory;
  headline: string;
  coachExplanation: string;
  conceptTaught: string;
  teachingValue: 'high' | 'medium' | 'low';
  isGoodDecision?: boolean;
  alternativeVariation?: AlternativeVariation;
  thinkingFailure?: ThinkingFailureInfo;
  // Retry Mode (spec section 22): return the player to the position and
  // let them find the move themselves before revealing the solution.
  retrySolutionMoves?: string[];
  retryHint?: string;
  retrySuccessExplanation?: string;
  recurringPatternTag?: string;
}

export interface GamePhaseNarrative {
  phase: 'opening' | 'middlegame_transition' | 'critical_middlegame' | 'endgame' | 'conclusion';
  title: string;
  summary: string;
  score: number; // 0 to 100 performance in this phase
  keyMoveNumber?: number;
}

export interface ScorecardGrade {
  category: 'opening' | 'tactics' | 'calculation' | 'king_safety' | 'planning' | 'endgame';
  label: string;
  grade: 'Excellent' | 'Strong' | 'Good' | 'Improving' | 'Needs work';
  score: number;
  comment: string;
}

export interface GameReview {
  gameId: string;
  date: string;
  playerColor: Color;
  opponentName: string;
  result: 'win' | 'loss' | 'draw' | 'abandoned';
  accuracyWhite: number;
  accuracyBlack: number;
  openingName: string;
  headline: string;
  overviewSummary: string;
  biggestLesson: string;
  biggestLessonDetail?: {
    lessonText: string;
    principleQuote: string;
    frequencyPattern: string; // e.g. "We've seen this in 4 of your last 7 games."
    suggestedAction: string;
  };
  phases?: GamePhaseNarrative[];
  scorecard?: ScorecardGrade[];
  moments: CriticalMoment[];
  pgn?: string;
  playerModelUpdate?: {
    tendenciesObserved: string[];
    ratingChange: number;
    conceptsAddressed?: string[];
  };
}

export interface SavedGameRecord {
  id: string;
  pgn: string;
  fen: string;
  result: 'win' | 'loss' | 'draw' | 'abandoned';
  playerColor: Color;
  playerName: string;
  opponentName: string;
  openingName: string;
  headline: string;
  accuracyWhite: number;
  accuracyBlack: number;
  dateIso: string;
  timestamp: number;
  movesCount: number;
  review?: GameReview;
}

// -------------------------------------------------------------
// Eval-shift detection — flags a swing in engine evaluation worth
// surfacing to the coach mid-game (moved here from a UI component; this
// is domain logic, not presentation).
// -------------------------------------------------------------

export type EvalShiftType = 'blunder' | 'mistake' | 'missed_opportunity' | 'breakthrough' | 'tactical_alarm';

export interface EvalShiftData {
  id: string;
  type: EvalShiftType;
  evalBeforeCp: number;
  evalAfterCp: number;
  deltaCp: number;
  userElo: number;
  hintSentence: string;
  category: 'tactics' | 'king_safety' | 'hanging_piece' | 'fork_pin' | 'pawn_structure' | 'piece_activity';
  suggestedMoveSan?: string;
  fromSquare?: Square;
  toSquare?: Square;
  dangerSquares?: Square[];
  isPlayerMove: boolean;
  timestamp: number;
}

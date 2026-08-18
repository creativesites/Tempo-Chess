// -------------------------------------------------------------
// Engine & Bot Abstractions — chess-package-local types. These are the
// vocabulary of the search/evaluation engine and bot roster; nothing
// outside packages/chess needs them directly.
// -------------------------------------------------------------

export type BotCategory = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'grandmaster';

export interface BotProfile {
  id: string;
  name: string;
  rating: number; // e.g. 250, 400, 700, 1100, 1300, 1500, 1600, 1800, 2000, 2200, 2850, 3000
  title?: string; // e.g. "Beginner", "Club Player", "Candidate Master", "International Master", "Grandmaster", "Super GM"
  category: BotCategory;
  avatar: string;
  avatarBg: string;
  avatarTextColor: string;
  bio: string;
  playstyle: string;
  favoriteOpenings: string[];
  depth: number;
  blunderRate: number; // 0 to 1
  inaccuracyRate: number; // 0 to 1
  aggressiveness: number; // 0 to 1
  positionalWeight: number; // 0 to 1
  tacticalVision: number; // 0 to 1
  useOpeningBook: boolean;
  tagline: string;
}

export interface EngineAnalysis {
  evaluationCp: number; // Centipawns relative to side to move
  isMate?: boolean;
  mateInMoves?: number;
  bestMoveSan: string;
  bestMoveLan: string;
  depth: number;
  pv: string[];
}

export interface EngineOptions {
  depth?: number;
  difficultyRating?: number;
  personality?: 'balanced' | 'aggressive_tester' | 'solid_positional' | 'tactical_trapper';
  targetWeakness?: string;
  bot?: BotProfile;
}

/**
 * Opening recognition tree — used live during play to identify the
 * current opening/variation and to drive bot opening-book selection.
 * The richer teaching layer (lessons, drills, repertoire) lives in
 * @tempo/openings and is built on top of this recognition data.
 */
export interface OpeningTreeNode {
  id: string;
  name: string;
  variation?: string;
  eco: string;
  movesSan: string[];
  fen: string;
  coreIdea: string;
  strategicPlans: {
    white: string[];
    black: string[];
  };
  pawnStructure: string;
  pawnBreaks: string[];
  tacticalMotifs: string[];
  commonMistakes: string[];
  transitionToMiddlegame: string;
  typicalEndgameCharacter: string;
  representativeGames: string[];
  children?: OpeningTreeNode[];
}

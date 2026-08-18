import { Color, Square } from '@tempo/shared';
import { OpeningUnderstandingProfile } from '@tempo/player-model';

// -------------------------------------------------------------
// Opening Education & Academy Types (3-Layer Architecture)
//
// Builds on the recognition data in @tempo/chess (OPENING_TREES,
// OPENING_BOOK) with the actual teaching layer: interactive lessons,
// tactical drills, and repertoire coaching.
// -------------------------------------------------------------

export interface OpeningLessonStep {
  id: string;
  stepNumber: number;
  title: string;
  type: 'concept_explanation' | 'socratic_question' | 'interactive_move' | 'pawn_structure' | 'middlegame_plan' | 'deviation_handling';
  fen: string;
  playerColor: Color;
  heading: string;
  content: string;
  question?: string;
  hint?: string;
  expectedMoveSan?: string[];
  explanationAfterMove?: string;
  highlightSquares?: Square[];
  arrowFromTo?: { from: Square; to: Square }[];
}

export interface OpeningLesson {
  id: string;
  eco: string;
  openingName: string;
  variationName: string;
  lessonTitle: string;
  description: string;
  targetRating: string;
  estimatedMinutes: number;
  layer: 1 | 2 | 3; // 1: Recognition, 2: Understanding, 3: Application
  pawnStructureName: string;
  keyPlansWhite: string[];
  keyPlansBlack: string[];
  keyPawnBreaks: string[];
  steps: OpeningLessonStep[];
}

export interface OpeningTacticalDrill {
  id: string;
  openingName: string;
  variationName: string;
  eco: string;
  theme: string;
  initialFen: string;
  playerColor: Color;
  correctMovesSan: string[];
  tacticalMotif: string;
  coachExplanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OpeningReportSummary {
  overallScore: number;
  totalOpeningsAnalyzed: number;
  strongestOpenings: OpeningUnderstandingProfile[];
  weakestOpenings: OpeningUnderstandingProfile[];
  recommendedFocus: string;
  winRateAsWhite: number;
  winRateAsBlack: number;
  commonVulnerabilities: string[];
}

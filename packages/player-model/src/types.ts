import { Color } from '@tempo/shared';

// -------------------------------------------------------------
// Player Model & Behavioural Memory
//
// This is Tempo's evidence-based model of how a specific player actually
// plays: observed tendencies, recurring mistakes, concept mastery, and
// opening understanding. Every pattern here should be backed by evidence
// (occurrences/confidence), never an inferred emotional state.
// -------------------------------------------------------------

export interface SkillProfile {
  category: 'opening' | 'tactics' | 'king_safety' | 'endgames' | 'calculation' | 'positional_play';
  label: string;
  score: number; // 0 to 100
  trend: 'improving' | 'stable' | 'needs_attention';
  insight: string;
}

export interface BehaviourTendency {
  id: string;
  name: string;
  description: string;
  category: 'attack' | 'defense' | 'greed' | 'patience' | 'time' | 'endgame';
  confidencePercentage: number;
  evidenceGamesCount: number;
  recentExamples: string[];
  remediationAdvice: string;
  isStrength?: boolean;
}

export interface MistakePattern {
  id: string;
  patternName: string;
  occurrences: number;
  exampleFens: string[];
  coachingTip: string;
  category?: 'tactical' | 'strategic' | 'opening' | 'calculation' | 'king_safety' | 'endgame' | 'defense';
}

export interface ConceptMasteryItem {
  id: string;
  name: string;
  category: 'opening' | 'tactics' | 'king_safety' | 'strategy' | 'calculation' | 'endgame';
  masteryScore: number; // 0 to 100
  encountersCount: number;
  correctCount: number;
  lastTestedTimestamp: number;
  description: string;
  remedyAction: string;
}

export interface CurriculumItem {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'threat_recognition' | 'king_safety' | 'opening_principles' | 'endgame_technique' | 'tactical_calculation' | 'positional_planning';
  reason: string;
  frequencyContext: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface ThinkingProcessProfile {
  opponentThreatCheck: number; // 0-100 score
  candidateMoveComparison: number; // 0-100 score
  worstPieceImprovement: number; // 0-100 score
  patienceScore: number; // 0-100 score
  calculationDepth: number; // Avg plies calculated before deciding
}

export interface SpacedRepetitionItem {
  id: string;
  conceptId: string;
  conceptName: string;
  dueTimestamp: number;
  intervalDays: number;
  repetitionCount: number;
}

export interface OpeningUnderstandingProfile {
  eco: string;
  name: string;
  understandingScore: number; // 0 to 100
  memorizationScore: number; // 0 to 100
  applicationScore: number; // 0 to 100
  gamesPlayed: number;
  winRate: number;
  keyInsights: string[];
}

export interface RepertoireItem {
  id: string;
  color: Color;
  name: string;
  variation?: string;
  movesSan: string[];
  movesLan?: string[];
  eco: string;
  responseTo: string; // e.g. "vs 1.e4", "vs 1.d4"
  keyPlans: string[];
  pawnStructure: string;
  understandingPercentage: number;
  memorizationPercentage: number;
  applicationPercentage: number;
  mastered: boolean;
}

export interface PlayerModel {
  ratingEstimate: number;
  playerName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreakDays: number;
  lastActiveTimestamp: number;
  strengths: string[];
  weaknesses: string[];
  skills: Record<string, SkillProfile>;
  tendencies: BehaviourTendency[];
  recurringMistakes: MistakePattern[];
  masteredConcepts: string[];
  conceptsNeedingWork: string[];
  recentObservations: string[];
  conceptMastery?: ConceptMasteryItem[];
  curriculum?: CurriculumItem[];
  thinkingProcessProfile?: ThinkingProcessProfile;
  spacedRepetitionSchedule?: SpacedRepetitionItem[];
  openingUnderstanding?: Record<string, OpeningUnderstandingProfile>;
  openingRepertoire?: RepertoireItem[];
}

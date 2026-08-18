import { Square, GameContext } from '@tempo/shared';
import { PlayerModel } from '@tempo/player-model';

// -------------------------------------------------------------
// Coach & Socratic Teaching Types
// -------------------------------------------------------------

export type CoachInterventionLevel = 'silent' | 'gentle' | 'teaching_moment' | 'celebration';

export interface SocraticPrompt {
  id: string;
  question: string;
  hint1: string;
  hint2: string;
  solutionExplanation: string;
  targetSquare?: Square;
  highlightSquares?: Square[];
  expectedMove?: string;
}

export interface CoachIntervention {
  id: string;
  level: CoachInterventionLevel;
  type:
    | 'opening_concept'
    | 'opening_deviation'
    | 'tactical_threat'
    | 'tempo_warning'
    | 'king_safety'
    | 'over_attacking'
    | 'blunder_alert'
    | 'celebration_mature'
    | 'endgame_technique'
    | 'quiet_observation';
  title?: string;
  message: string;
  socratic?: SocraticPrompt;
  moveIndex: number;
  timestamp: number;
}

// -------------------------------------------------------------
// Structured Thinking Training Types (7-Step Thinking Framework)
// -------------------------------------------------------------

export type ThinkingStepId =
  | 'what_changed'
  | 'opponent_threats'
  | 'forcing_moves'
  | 'candidate_moves'
  | 'calculation_check'
  | 'worst_piece_plan'
  | 'tactical_safety_check';

export interface ThinkingFrameworkStep {
  id: ThinkingStepId;
  stepNumber: number;
  name: string;
  shortPrompt: string;
  guidance: string;
  questionToAskSelf: string;
}

export interface CandidateMoveOption {
  moveSan: string;
  quality: 'best' | 'playable' | 'flawed' | 'blunder';
  description: string;
  strategicValue: string;
  counterThreats: string;
}

export interface ThinkingExercise {
  id: string;
  title: string;
  theme: 'opponent_threats' | 'candidate_moves' | 'plan_vs_move' | 'worst_piece' | 'forcing_moves';
  fen: string;
  playerColor: 'w' | 'b';
  scenarioDescription: string;
  stepType: ThinkingStepId;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  candidateMoves?: CandidateMoveOption[];
  interactiveTargetSquare?: Square;
  correctMovesSan?: string[];
  coachExplanation: string;
  mentalTakeaway: string;
}

// -------------------------------------------------------------
// Local Coach AI request/response contract. The concrete on-device
// implementation (llama.cpp via a native module) lives outside this
// package — see the mobile app's native-ai boundary — but every
// implementation speaks this contract.
// -------------------------------------------------------------

export interface AIRequest {
  systemPrompt?: string;
  gameContext: GameContext;
  playerModel?: PlayerModel;
  promptType: 'intervention' | 'socratic_followup' | 'post_game_review' | 'player_insight';
  userMessage?: string;
}

export interface AIResponse {
  text: string;
  intervention?: CoachIntervention;
  suggestedAction?: 'continue' | 'show_hint' | 'freeze_for_thought';
}

export interface ModelInfo {
  id: string;
  name: string;
  sizeMb: number;
  parameterCount: string;
  status: 'active' | 'downloadable' | 'installed';
  description: string;
  isLocal: boolean;
}

/**
 * @deprecated Superseded by LocalCoachAI (see the mobile app's
 * native-ai boundary). Kept only so the legacy web prototype's
 * MockOfflineAIProvider keeps compiling; do not implement new
 * providers against this interface.
 */
export interface LocalAIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
  isAvailable(): Promise<boolean>;
  getModelInfo(): Promise<ModelInfo>;
}

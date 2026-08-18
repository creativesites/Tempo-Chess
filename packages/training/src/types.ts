import { Color } from '@tempo/shared';

// -------------------------------------------------------------
// Daily Training — personalized practice generated from the player's
// real weaknesses (product spec section 27).
// -------------------------------------------------------------

export interface TrainingExercise {
  id: string;
  title: string;
  category: 'tactics' | 'king_safety' | 'defensive_calculation' | 'positional' | 'endgames';
  initialFen: string;
  playerTurn: Color;
  promptQuestion: string;
  hint: string;
  correctMovesSan: string[];
  explanation: string;
  weaknessAddressed: string;
}

export interface DailyTrainingPlan {
  id: string;
  date: string;
  estimatedMinutes: number;
  themeTitle: string;
  themeDescription: string;
  exercises: TrainingExercise[];
  completedExerciseIds: string[];
  isCompleted: boolean;
}

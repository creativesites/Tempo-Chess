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
// Player Model & Behavioural Memory
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

// -------------------------------------------------------------
// Game Review & Daily Training
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

// -------------------------------------------------------------
// Opening Education & Academy Types (3-Layer Architecture)
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
  playerColor: Color;
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
// Engine & AI Provider Abstractions
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

export interface LocalAIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
  isAvailable(): Promise<boolean>;
  getModelInfo(): Promise<ModelInfo>;
}

export type UIThemeMode = 'minimal_light' | 'warm_editorial' | 'nordic_crisp' | 'swiss_monochrome' | 'dark_slate';

export type BoardTheme = 'minimal_light' | 'emerald_modern' | 'classic_wood' | 'nordic_slate' | 'swiss_clean' | 'minimalist_charcoal';

export interface UIThemeConfig {
  id: UIThemeMode;
  name: string;
  subtitle: string;
  category: 'light' | 'dark';
  description: string;
  previewBg: string;
  previewCard: string;
  previewBorder: string;
  previewAccent: string;
  previewText: string;
  recommendedBoard: BoardTheme;
  tags: string[];
}

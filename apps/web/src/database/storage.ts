import { PlayerModel, GameReview, DailyTrainingPlan, BoardTheme, UIThemeMode, UIThemeConfig, SavedGameRecord } from '../types';
import { SQLiteGameHistoryStore } from './sqliteStore';
import { PgnUtils } from '@tempo/chess';

const STORAGE_KEYS = {
  PLAYER_MODEL: 'tempo_player_model_v1',
  GAME_HISTORY: 'tempo_game_history_v1',
  DAILY_TRAINING: 'tempo_daily_training_v1',
  ACTIVE_BOARD_THEME: 'tempo_board_theme_v2',
  ACTIVE_UI_THEME: 'tempo_ui_theme_v2',
  COACH_VERBOSITY: 'tempo_coach_verbosity_v1',
  LOCAL_AI_MODEL: 'tempo_selected_model_v1',
  ACTIVE_GAME_STATE: 'tempo_active_game_state_v1',
  SELECTED_BOT_ID: 'tempo_selected_bot_v1'
};

export const AVAILABLE_UI_THEMES: UIThemeConfig[] = [
  {
    id: 'minimal_light',
    name: 'Studio Minimal',
    subtitle: 'Clean light design with emerald accents',
    category: 'light',
    description: 'Crisp light slate background, pure typography, subtle hairline borders, and calm sage & emerald accents.',
    previewBg: 'bg-slate-50',
    previewCard: 'bg-white',
    previewBorder: 'border-slate-200',
    previewAccent: 'bg-emerald-600',
    previewText: 'text-slate-900',
    recommendedBoard: 'minimal_light',
    tags: ['Recommended', 'Light', 'Minimal', 'High Contrast']
  },
  {
    id: 'warm_editorial',
    name: 'Warm Paper',
    subtitle: 'Warm ivory & editorial aesthetics',
    category: 'light',
    description: 'Soft alabaster canvas, warm ivory card containers, refined terracotta & amber accents with timeless typography.',
    previewBg: 'bg-[#FAF8F5]',
    previewCard: 'bg-white',
    previewBorder: 'border-stone-200',
    previewAccent: 'bg-amber-600',
    previewText: 'text-stone-900',
    recommendedBoard: 'classic_wood',
    tags: ['Light', 'Warm', 'Serif Tone', 'Easy on Eyes']
  },
  {
    id: 'nordic_crisp',
    name: 'Nordic Ice',
    subtitle: 'Cool ice-slate & azure geometric lines',
    category: 'light',
    description: 'Cool crisp ice canvas, pure white card containers, and modern azure blue focus highlights.',
    previewBg: 'bg-[#F1F5F9]',
    previewCard: 'bg-white',
    previewBorder: 'border-slate-200',
    previewAccent: 'bg-sky-600',
    previewText: 'text-slate-900',
    recommendedBoard: 'nordic_slate',
    tags: ['Light', 'Cool', 'Modern', 'Clean']
  },
  {
    id: 'swiss_monochrome',
    name: 'Swiss Monochrome',
    subtitle: 'Pure high-contrast black & white minimalism',
    category: 'light',
    description: 'Pure neutral zinc backdrop, crisp jet-black micro-borders, geometric alignment, and zero visual clutter.',
    previewBg: 'bg-zinc-50',
    previewCard: 'bg-white',
    previewBorder: 'border-zinc-200',
    previewAccent: 'bg-zinc-900',
    previewText: 'text-zinc-950',
    recommendedBoard: 'swiss_clean',
    tags: ['Light', 'Monochrome', 'Ultra Minimal']
  },
  {
    id: 'dark_slate',
    name: 'Obsidian Dark',
    subtitle: 'Deep slate & emerald dark mode',
    category: 'dark',
    description: 'Deep obsidian backdrop with emerald neon accents for low-light night sessions.',
    previewBg: 'bg-[#090D14]',
    previewCard: 'bg-slate-900',
    previewBorder: 'border-slate-800',
    previewAccent: 'bg-emerald-500',
    previewText: 'text-slate-100',
    recommendedBoard: 'emerald_modern',
    tags: ['Dark Mode', 'OLED Friendly']
  }
];

const DEFAULT_PLAYER_MODEL: PlayerModel = {
  ratingEstimate: 1280,
  playerName: 'Winston',
  gamesPlayed: 24,
  wins: 14,
  losses: 8,
  draws: 2,
  currentStreakDays: 5,
  lastActiveTimestamp: Date.now(),
  strengths: [
    'Spotting aggressive tactical pins & forks',
    'Comfortable handling open classical e4-e5 positions',
    'Solid opening development in Ruy Lopez and Italian Game'
  ],
  weaknesses: [
    'Over-attacking immediately after losing material',
    'Leaving uncastled king exposed during early middlegames',
    'Premature Queen excursions for flank pawn grabs'
  ],
  skills: {
    opening: {
      category: 'opening',
      label: 'Openings',
      score: 78,
      trend: 'improving',
      insight: 'Consistently finds theoretical plans in the Ruy Lopez and Open Sicilian.'
    },
    tactics: {
      category: 'tactics',
      label: 'Tactics',
      score: 64,
      trend: 'stable',
      insight: 'Spots 2-move forks quickly; occasionally misses backward knight deflections.'
    },
    king_safety: {
      category: 'king_safety',
      label: 'King Safety',
      score: 48,
      trend: 'needs_attention',
      insight: 'Frequently delays castling beyond move 10 while seeking early kingside pressure.'
    },
    endgames: {
      category: 'endgames',
      label: 'Endgames',
      score: 42,
      trend: 'stable',
      insight: 'Tends to hesitate bringing the king to the center in rook & pawn endgames.'
    },
    calculation: {
      category: 'calculation',
      label: 'Calculation',
      score: 60,
      trend: 'improving',
      insight: 'Good candidate move vision; needs deeper visualization on opponent counter-threats.'
    },
    positional_play: {
      category: 'positional_play',
      label: 'Positional Play',
      score: 55,
      trend: 'stable',
      insight: 'Constructs solid pawn chains; needs more attention to opponent outposts.'
    }
  },
  tendencies: [
    {
      id: 'tendency-1',
      name: 'Counter-attacking rush after dropping material',
      category: 'attack',
      description: 'When losing material (down 2+ points), you tend to immediately launch aggressive piece checks instead of stabilizing defense.',
      confidencePercentage: 78,
      evidenceGamesCount: 7,
      recentExamples: [
        'Game vs Tempo AI (Move 16: Qh5+ immediately after dropping bishop on c4)',
        'Game vs Tempo AI (Move 14: f4 push leaving king exposed following pawn loss)'
      ],
      remediationAdvice: 'Pause for 3 breaths after a mistake. Ask: "Can I coordinate my defense before trying to win the material back?"'
    },
    {
      id: 'tendency-2',
      name: 'Grabbing poisoned flank pawns with Queen',
      category: 'greed',
      description: 'Frequently moves Queen to b6/b2 or a5 before finishing minor piece development and castling.',
      confidencePercentage: 72,
      evidenceGamesCount: 5,
      recentExamples: [
        'Game vs Tempo AI (Move 8: Qxb2 losing two tempos to Rb1 and minor piece development)'
      ],
      remediationAdvice: 'Remember: Pawn grabbing in the opening gives the opponent free tempos to develop and launch an unstoppable initiative.'
    },
    {
      id: 'tendency-3',
      name: 'Direct checks that improve enemy coordination',
      category: 'patience',
      description: 'Prefers 1-move checks that force opponent’s king or defending piece to better defensive squares.',
      confidencePercentage: 65,
      evidenceGamesCount: 8,
      recentExamples: ['Move 21: Bc4+ allowed Black to play Be6 connecting rooks.'],
      remediationAdvice: 'Every check is a move. If the check doesn’t win concrete material or create mate, improve your worst piece instead.'
    }
  ],
  recurringMistakes: [
    {
      id: 'mistake-1',
      patternName: 'Delaying castling under central tension',
      occurrences: 4,
      exampleFens: ['r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5'],
      coachingTip: 'Get your king to safety before initiating central pawn breaks.'
    },
    {
      id: 'mistake-2',
      patternName: 'Premature queen attack in the Sicilian',
      occurrences: 3,
      exampleFens: ['rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2'],
      coachingTip: 'Develop knights and bishops to command the center before dispatching the queen.'
    }
  ],
  masteredConcepts: [
    'Ruy Lopez Spanish Opening center pressure and knight rerouting',
    'Exploiting open f-file following bishop exchange',
    'Creating passed pawns in king & pawn endgames'
  ],
  conceptsNeedingWork: [
    'King safety under early central pawn breaks',
    'Defensive calculation: finding quiet saving resources',
    'Patience when attacking without sufficient piece support'
  ],
  recentObservations: [
    'You played a calm 0-0 against the Sicilian Defense yesterday—a major improvement in patience!',
    'Watch out for Black knight outposts on d4 when you play c3 too early.',
    'Your tactical awareness on back-rank threats has improved by 14% this week.'
  ],
  conceptMastery: [
    {
      id: 'concept-1',
      name: 'King Safety & Castling Timing',
      category: 'king_safety',
      masteryScore: 48,
      encountersCount: 14,
      correctCount: 7,
      lastTestedTimestamp: Date.now() - 86400000,
      description: 'Prioritizing king security before committing pieces to premature attacks.',
      remedyAction: 'Run the Blunder Filter and verify castling timing before move 10.'
    },
    {
      id: 'concept-2',
      name: 'Opponent Threat Recognition (Opponent-First)',
      category: 'tactics',
      masteryScore: 56,
      encountersCount: 18,
      correctCount: 10,
      lastTestedTimestamp: Date.now() - 43200000,
      description: 'Checking opponent forcing replies (checks, captures, threats) before deciding your move.',
      remedyAction: 'Practice the 7-Step Thinking Framework Step 2.'
    },
    {
      id: 'concept-3',
      name: 'Ruy Lopez Piece Harmony & Maneuvering',
      category: 'opening',
      masteryScore: 82,
      encountersCount: 12,
      correctCount: 10,
      lastTestedTimestamp: Date.now() - 172800000,
      description: 'Thematic Spanish knight reroutes (Nb1-d2-f1-g3) and preserving the light-squared bishop.',
      remedyAction: 'Continue applying in rated games vs bots.'
    },
    {
      id: 'concept-4',
      name: 'Plan vs Move: Improving Worst-Placed Piece',
      category: 'strategy',
      masteryScore: 62,
      encountersCount: 15,
      correctCount: 9,
      lastTestedTimestamp: Date.now() - 86400000 * 3,
      description: 'Identifying the least active piece and executing a 2-3 move rerouting plan.',
      remedyAction: 'Ask: Which of my pieces is doing the least useful work?'
    },
    {
      id: 'concept-5',
      name: 'Passed Pawn Promotion Technique',
      category: 'endgame',
      masteryScore: 74,
      encountersCount: 8,
      correctCount: 6,
      lastTestedTimestamp: Date.now() - 86400000 * 4,
      description: 'Creating outside passed pawns and using the king as an active fighting piece in endgames.',
      remedyAction: 'Solid mastery; review rook endgames next.'
    }
  ],
  curriculum: [
    {
      id: 'curr-1',
      title: 'Opponent-First Threat Check & King Safety',
      priority: 'HIGH',
      category: 'threat_recognition',
      reason: 'Observed premature attacking in 4 of your last 7 games.',
      frequencyContext: '4 occurrences in last 7 matches',
      estimatedMinutes: 8,
      completed: false
    },
    {
      id: 'curr-2',
      title: 'Sicilian Defense: Understanding the Asymmetric Spine',
      priority: 'MEDIUM',
      category: 'opening_principles',
      reason: 'Low win-rate (38%) against open Sicilian setups.',
      frequencyContext: '3 losses in last 5 Sicilian games',
      estimatedMinutes: 9,
      completed: false
    },
    {
      id: 'curr-3',
      title: 'Candidate Move Generation: The Rule of 3',
      priority: 'MEDIUM',
      category: 'tactical_calculation',
      reason: 'Tendency to play the first intuitive check without comparing alternatives.',
      frequencyContext: 'Identified in 8 recent games',
      estimatedMinutes: 7,
      completed: false
    }
  ],
  thinkingProcessProfile: {
    opponentThreatCheck: 54,
    candidateMoveComparison: 62,
    worstPieceImprovement: 68,
    patienceScore: 58,
    calculationDepth: 2.8
  },
  spacedRepetitionSchedule: [
    {
      id: 'sr-1',
      conceptId: 'concept-1',
      conceptName: 'King Safety & Castling Timing',
      dueTimestamp: Date.now() + 3600000,
      intervalDays: 1,
      repetitionCount: 3
    },
    {
      id: 'sr-2',
      conceptId: 'concept-2',
      conceptName: 'Opponent Threat Recognition',
      dueTimestamp: Date.now() + 86400000,
      intervalDays: 2,
      repetitionCount: 2
    }
  ],
  openingUnderstanding: {
    'C60': {
      eco: 'C60',
      name: 'Ruy Lopez (Spanish Opening)',
      understandingScore: 84,
      memorizationScore: 78,
      applicationScore: 82,
      gamesPlayed: 14,
      winRate: 64,
      keyInsights: ['Excellent handling of knight reroutes to g3', 'Comfortable with c3+d4 center']
    },
    'B90': {
      eco: 'B90',
      name: 'Sicilian Najdorf',
      understandingScore: 55,
      memorizationScore: 60,
      applicationScore: 42,
      gamesPlayed: 8,
      winRate: 38,
      keyInsights: ['Needs work on counterplay down the c-file', 'Avoid early queen moves']
    }
  },
  openingRepertoire: [
    {
      id: 'rep-white-ruy',
      color: 'w',
      name: 'Ruy Lopez: Classical Spanish',
      variation: 'Morphy Defense & Closed Setup',
      movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3'],
      eco: 'C84',
      responseTo: 'vs 1.e4 e5',
      keyPlans: ['Build c3+d4 pawn center', 'Reroute knight Nbd2-f1-g3', 'Preserve Bb3 bishop'],
      pawnStructure: 'Spanish Classical Spine (e4/d4 vs e5/d6)',
      understandingPercentage: 86,
      memorizationPercentage: 80,
      applicationPercentage: 84,
      mastered: true
    },
    {
      id: 'rep-white-sicilian',
      color: 'w',
      name: 'Open Sicilian (English Attack Setup)',
      variation: 'Be3 + f3 + Qd2 + 0-0-0',
      movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3'],
      eco: 'B90',
      responseTo: 'vs 1...c5 (Sicilian)',
      keyPlans: ['Castle queenside', 'Launch g4-g5 kingside pawn storm', 'Target d5 outpost'],
      pawnStructure: 'Asymmetric Sicilian Center',
      understandingPercentage: 62,
      memorizationPercentage: 58,
      applicationPercentage: 52,
      mastered: false
    },
    {
      id: 'rep-black-qgd',
      color: 'b',
      name: "Queen's Gambit Declined: Tartakower",
      variation: 'Fianchetto b6 Setup',
      movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6'],
      eco: 'D58',
      responseTo: 'vs 1.d4 (as Black)',
      keyPlans: ['Fianchetto c8 bishop on b7', 'Break centrally with ...c5', 'Neutralize White queenside minority attack'],
      pawnStructure: 'Tartakower Hanging Pawns',
      understandingPercentage: 78,
      memorizationPercentage: 72,
      applicationPercentage: 75,
      mastered: false
    }
  ]
};

const SAMPLE_GAME_REVIEWS: GameReview[] = [
  {
    gameId: 'game-hist-1',
    date: 'Yesterday, 8:45 PM',
    playerColor: 'w',
    opponentName: 'Tempo Coach (Adaptive)',
    result: 'win',
    accuracyWhite: 84.5,
    accuracyBlack: 79.2,
    openingName: 'Ruy Lopez: Berlin Defense',
    headline: 'Mature piece coordination under central tension',
    overviewSummary: 'You navigated the opening with great discipline. The turning point arrived on move 19 when you resisted an impulsive attack and reinforced your center instead.',
    biggestLesson: 'Attack only after your pieces are fully harmonized and your king is safe.',
    moments: [
      {
        id: 'm1',
        moveNumber: 8,
        playedMove: '0-0',
        bestMove: '0-0',
        fenBefore: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4',
        fenAfter: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4',
        classification: 'best',
        severity: 'minor',
        category: 'king_safety',
        teachingValue: 'high',
        headline: 'Secured the King first',
        coachExplanation: 'Excellent decision to castle. You refused to get distracted by premature central exchanges and placed your king safely behind the pawn shield.',
        conceptTaught: 'King safety before tactical commitment'
      },
      {
        id: 'm2',
        moveNumber: 15,
        playedMove: 'Nbd2',
        bestMove: 'Nbd2',
        fenBefore: 'r1b2rk1/pp1p1ppp/2p2n2/4p3/1b2P3/2NP1N2/PPP1BPPP/R1B2RK1 w - - 0 10',
        fenAfter: 'r1b2rk1/pp1p1ppp/2p2n2/4p3/1b2P3/2NP1N2/PPPNBPPP/R1B2RK1 b - - 1 10',
        classification: 'great',
        severity: 'minor',
        category: 'planning',
        teachingValue: 'high',
        headline: 'Classic knight rerouting plan',
        coachExplanation: 'This is the hallmark of serious chess understanding. Instead of pushing pawns prematurely, you prepared the knight for f1-g3.',
        conceptTaught: 'Piece harmony and long-term maneuvering'
      }
    ],
    playerModelUpdate: {
      tendenciesObserved: ['Patience during opening maneuvering'],
      ratingChange: +14
    }
  },
  {
    gameId: 'game-hist-2',
    date: '2 days ago',
    playerColor: 'b',
    opponentName: 'Tempo Coach (Adaptive)',
    result: 'loss',
    accuracyWhite: 88.1,
    accuracyBlack: 71.3,
    openingName: 'Sicilian Defense: Open Variation',
    headline: 'Over-attacked following an early pawn drop',
    overviewSummary: 'You contested the opening well, but after dropping the d6 pawn on move 14, you pushed kingside pawns impulsively, opening lines against your own uncastled king.',
    biggestLesson: 'When down material, consolidate first. Do not gamble on a one-move attack.',
    moments: [
      {
        id: 'm3',
        moveNumber: 16,
        playedMove: 'Qh4?!',
        bestMove: 'Be7',
        fenBefore: 'r1b1k2r/pp2ppbp/2n3p1/8/3NP3/4B3/PPP2PPP/R2QKB1R b KQkq - 0 10',
        fenAfter: 'r1b1k2r/pp2ppbp/2n3p1/8/3NP2q/4B3/PPP2PPP/R2QKB1R w KQkq - 1 11',
        classification: 'mistake',
        severity: 'critical',
        category: 'tactical',
        teachingValue: 'high',
        headline: 'Premature queen sortie',
        coachExplanation: 'Qh4 attacked the e4 pawn, but it cost Black another development tempo and allowed White’s knight to dominate the center with Nc6.',
        conceptTaught: 'Avoid single-piece attacks when down on development'
      }
    ],
    playerModelUpdate: {
      tendenciesObserved: ['Over-attacking after losing material'],
      ratingChange: -12
    }
  }
];

const DEFAULT_DAILY_TRAINING: DailyTrainingPlan = {
  id: 'daily-train-today',
  date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  estimatedMinutes: 10,
  themeTitle: 'Defensive Composure & King Safety',
  themeDescription: 'Tailored from your recent games: Spotting when to consolidate instead of rushing an aggressive check.',
  completedExerciseIds: [],
  isCompleted: false,
  exercises: [
    {
      id: 'ex-1',
      title: 'King Safety under Central Tension',
      category: 'king_safety',
      initialFen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
      playerTurn: 'w',
      promptQuestion: 'Black has developed actively and pins your knight on c3. What is White’s most mature move to ensure safety before fighting for the center?',
      hint: 'Look at White’s king. What classical principle comes before launching a central attack?',
      correctMovesSan: ['O-O', '0-0', 'd3'],
      explanation: 'Castling (0-0) immediately secures your king, unpins the f3 knight from potential tactical shots, and activates the f1 rook for the upcoming battle.',
      weaknessAddressed: 'Delaying castling under central tension'
    },
    {
      id: 'ex-2',
      title: 'Resisting the Tempting Poisoned Pawn',
      category: 'tactics',
      initialFen: 'r1bqk2r/pp1p1ppp/2n1pn2/8/1b1NP3/2N1B3/PPP1QPPP/R3KB1R b KQkq - 2 7',
      playerTurn: 'b',
      promptQuestion: 'White’s pawn on c3 or g2 looks vulnerable. Should Black grab material or prioritize kingside castling and piece coordination?',
      hint: 'Grabbing pawns when uncastled gives White immense attacking initiative along open files.',
      correctMovesSan: ['O-O', '0-0', 'd5'],
      explanation: 'Castling (0-0) is paramount. Grabbing with 7...Bxc3+ 8.bxc3 Nxe4 9.Qg4! launches a double-attack on e4 and g7, completely crashing Black’s kingside.',
      weaknessAddressed: 'Grabbing poisoned flank pawns with Queen'
    },
    {
      id: 'ex-3',
      title: 'Finding the Quiet Defensive Resource',
      category: 'defensive_calculation',
      initialFen: 'r2q1rk1/ppp2ppp/2n5/3pP3/3Pn1b1/2PB1N2/P1P3PP/R1BQ1RK1 w - - 1 11',
      playerTurn: 'w',
      promptQuestion: 'Black attacks your c3 pawn and puts strong pressure on f3. What is the subtle prophylactic move to defend and keep your structure solid?',
      hint: 'Look at how Qe1 or Bd2 unpins and guards key central squares without creating weaknesses.',
      correctMovesSan: ['Qe1', 'Bd2', 'h3'],
      explanation: '11.Qe1! breaks the pin on the f3 knight, safeguards the queen, and prepares to contest the active black knight on e4.',
      weaknessAddressed: 'Counter-attacking rush after dropping material'
    }
  ]
};

export class AppStorage {
  public static getPlayerModel(): PlayerModel {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER_MODEL);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_PLAYER_MODEL,
          ...parsed,
          skills: { ...DEFAULT_PLAYER_MODEL.skills, ...(parsed.skills || {}) },
          conceptMastery: parsed.conceptMastery || DEFAULT_PLAYER_MODEL.conceptMastery,
          curriculum: parsed.curriculum || DEFAULT_PLAYER_MODEL.curriculum,
          thinkingProcessProfile: parsed.thinkingProcessProfile || DEFAULT_PLAYER_MODEL.thinkingProcessProfile,
          spacedRepetitionSchedule: parsed.spacedRepetitionSchedule || DEFAULT_PLAYER_MODEL.spacedRepetitionSchedule,
          openingUnderstanding: parsed.openingUnderstanding || DEFAULT_PLAYER_MODEL.openingUnderstanding,
          openingRepertoire: parsed.openingRepertoire || DEFAULT_PLAYER_MODEL.openingRepertoire
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PLAYER_MODEL;
  }

  public static savePlayerModel(model: PlayerModel) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_MODEL, JSON.stringify(model));
    } catch (e) {
      console.error('Failed to save player model', e);
    }
  }

  public static updatePlayerModelAfterGame(review: GameReview) {
    const model = this.getPlayerModel();
    model.gamesPlayed += 1;
    if (review.result === 'win') model.wins += 1;
    else if (review.result === 'loss') model.losses += 1;
    else if (review.result === 'draw') model.draws += 1;

    if (review.playerModelUpdate?.ratingChange) {
      model.ratingEstimate = Math.max(400, model.ratingEstimate + review.playerModelUpdate.ratingChange);
    }

    if (review.playerModelUpdate?.tendenciesObserved) {
      review.playerModelUpdate.tendenciesObserved.forEach(obs => {
        model.recentObservations.unshift(`Observed in recent game: ${obs}`);
      });
      model.recentObservations = model.recentObservations.slice(0, 10);
    }

    model.lastActiveTimestamp = Date.now();
    this.savePlayerModel(model);
  }

  public static getGameHistory(): GameReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return SAMPLE_GAME_REVIEWS;
  }

  public static saveGameReview(review: GameReview, pgnString?: string, fenString?: string, movesCount?: number) {
    try {
      const history = this.getGameHistory();
      const filtered = history.filter(h => h.gameId !== review.gameId);
      filtered.unshift(review);
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(filtered.slice(0, 50)));
      this.updatePlayerModelAfterGame(review);

      // Construct and save SQLite GameRecord
      const pgn = pgnString || review.pgn || `[Event "Tempo AI Match"]\n[Site "Tempo Learn Chess Offline"]\n[Result "${review.result === 'win' ? '1-0' : review.result === 'loss' ? '0-1' : '1/2-1/2'}"]\n\n1. e4 e5 *`;
      const fen = fenString || (review.moments[review.moments.length - 1]?.fenAfter) || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

      const gameRecord: SavedGameRecord = {
        id: review.gameId,
        pgn,
        fen,
        result: review.result,
        playerColor: review.playerColor,
        playerName: this.getPlayerModel().playerName || 'Player',
        opponentName: review.opponentName || 'Tempo AI',
        openingName: review.openingName || 'Chess Game',
        headline: review.headline || 'Completed Match',
        accuracyWhite: review.accuracyWhite,
        accuracyBlack: review.accuracyBlack,
        dateIso: new Date().toISOString(),
        timestamp: Date.now(),
        movesCount: movesCount || (review.moments.length > 0 ? review.moments[review.moments.length - 1].moveNumber : 20),
        review
      };

      SQLiteGameHistoryStore.saveGame(gameRecord).catch(err => {
        console.error('Error auto-saving game to SQLite', err);
      });
    } catch (e) {
      console.error('Failed to save game review', e);
    }
  }

  /**
   * SQLite GameHistory APIs
   */
  public static async saveGame(record: SavedGameRecord): Promise<void> {
    await SQLiteGameHistoryStore.saveGame(record);
    if (record.review) {
      this.updatePlayerModelAfterGame(record.review);
    }
  }

  public static async getSavedGames(limit = 100, offset = 0): Promise<SavedGameRecord[]> {
    return SQLiteGameHistoryStore.getAllGames(limit, offset);
  }

  public static async getSqliteGames(limit = 100, offset = 0): Promise<SavedGameRecord[]> {
    return SQLiteGameHistoryStore.getAllGames(limit, offset);
  }

  public static async getSqliteGameById(id: string): Promise<SavedGameRecord | null> {
    return SQLiteGameHistoryStore.getGameById(id);
  }

  public static async saveSqliteGame(record: SavedGameRecord): Promise<void> {
    return SQLiteGameHistoryStore.saveGame(record);
  }

  public static async deleteSqliteGame(id: string): Promise<boolean> {
    return SQLiteGameHistoryStore.deleteGame(id);
  }

  public static async searchSqliteGames(query: string): Promise<SavedGameRecord[]> {
    return SQLiteGameHistoryStore.searchGames(query);
  }

  public static async exportAllPgns(): Promise<string> {
    return SQLiteGameHistoryStore.exportAllPgns();
  }

  public static async importPgn(pgnString: string): Promise<SavedGameRecord> {
    return SQLiteGameHistoryStore.importPgn(pgnString);
  }

  public static async getSqliteStats() {
    return SQLiteGameHistoryStore.getAggregateStats();
  }

  public static getDailyTraining(): DailyTrainingPlan {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_TRAINING);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_DAILY_TRAINING;
  }

  public static saveDailyTraining(plan: DailyTrainingPlan) {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_TRAINING, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save daily training', e);
    }
  }

  public static getUITheme(): UIThemeMode {
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_UI_THEME) as UIThemeMode) || 'minimal_light';
  }

  public static setUITheme(theme: UIThemeMode) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_UI_THEME, theme);
  }

  public static getBoardTheme(): BoardTheme {
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_BOARD_THEME) as BoardTheme) || 'minimal_light';
  }

  public static setBoardTheme(theme: BoardTheme) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BOARD_THEME, theme);
  }

  public static getCoachVerbosity(): 'minimal' | 'balanced' | 'comprehensive' {
    return (localStorage.getItem(STORAGE_KEYS.COACH_VERBOSITY) as 'minimal' | 'balanced' | 'comprehensive') || 'balanced';
  }

  public static setCoachVerbosity(val: 'minimal' | 'balanced' | 'comprehensive') {
    localStorage.setItem(STORAGE_KEYS.COACH_VERBOSITY, val);
  }

  public static getSelectedAIModel(): string {
    return localStorage.getItem(STORAGE_KEYS.LOCAL_AI_MODEL) || 'qwen3-1.7b';
  }

  public static setSelectedAIModel(modelId: string) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_AI_MODEL, modelId);
  }

  public static getSelectedBotId(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_BOT_ID) || 'bot_antonio';
  }

  public static setSelectedBotId(botId: string) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BOT_ID, botId);
  }
}

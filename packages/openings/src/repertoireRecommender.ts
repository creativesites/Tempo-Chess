import { Color } from '@tempo/shared';
import { PlayerModel, RepertoireItem } from '@tempo/player-model';

export type PlaystyleArchetype =
  | 'aggressive_tactician'
  | 'solid_positional'
  | 'dynamic_counterpuncher'
  | 'classical_harmonizer'
  | 'endgame_technician';

export interface PlaystyleAnalysis {
  primaryArchetype: PlaystyleArchetype;
  label: string;
  tagline: string;
  description: string;
  tacticalBiasScore: number; // 0 (hyper-solid) to 100 (hyper-aggressive)
  riskToleranceScore: number; // 0 (risk-averse) to 100 (gambit-friendly)
  positionalPatienceScore: number; // 0 (impatient) to 100 (deep maneuvering)
  strengths: string[];
  recommendedPawnStructures: string[];
  openingsToAvoid: string[];
}

export interface RepertoireRecommendation {
  id: string;
  eco: string;
  color: Color;
  name: string;
  variation: string;
  archetypeMatch: PlaystyleArchetype[];
  matchScore: number; // 0 to 100 match percentage
  matchReason: string;
  movesSan: string[];
  responseTo: string;
  corePlans: string[];
  pawnStructure: string;
  currentWinRate?: number;
  gamesPlayed?: number;
  tacticalComplexity: 'Low' | 'Medium' | 'High' | 'Very High';
  memorizationDemand: 'Low' | 'Medium' | 'High';
  isAlreadyInRepertoire: boolean;
  recommendedRole: 'Primary Weapon' | 'Surprise Ambush' | 'Solid Shield' | 'Tactical Counter';
}

export interface VariationPerformanceStat {
  eco: string;
  name: string;
  color: Color;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // 0-100%
  avgAccuracy: number;
  status: 'stronghold' | 'developing' | 'vulnerable';
  strategicInsight: string;
}

// -------------------------------------------------------------
// PLAYSTYLE DETECTION LOGIC
// -------------------------------------------------------------
export function analyzeUserPlaystyle(playerModel: PlayerModel): PlaystyleAnalysis {
  const tacticsScore = playerModel.skills?.tactics?.score || 60;
  const kingSafetyScore = playerModel.skills?.king_safety?.score || 50;
  const positionalScore = playerModel.skills?.positional_play?.score || 55;
  const patienceScore = playerModel.thinkingProcessProfile?.patienceScore || 50;

  // Check tendencies
  const isGreedy = playerModel.tendencies?.some(t => t.category === 'greed' && t.confidencePercentage > 60);
  const isAggressive = playerModel.tendencies?.some(t => t.category === 'attack' && t.confidencePercentage > 65);

  let primaryArchetype: PlaystyleArchetype = 'classical_harmonizer';
  let label = 'Classical Harmonizer';
  let tagline = 'Balanced, principled central play and piece coordination';
  let description = 'You excel when developing minor pieces to active squares, establishing a harmonious pawn center, and playing clear, classical chess with rapid kingside castling.';

  if (tacticsScore >= 65 && (isAggressive || kingSafetyScore < 55)) {
    primaryArchetype = 'aggressive_tactician';
    label = 'Aggressive Tactician';
    tagline = 'Direct attacks, piece activity, and tactical complications';
    description = 'You thrive in open games with early piece contact, open files for heavy pieces, and tactical opportunities against opposing kings.';
  } else if (positionalScore >= 60 && patienceScore >= 60) {
    primaryArchetype = 'solid_positional';
    label = 'Solid Positional Strategist';
    tagline = 'Structural soundness, prophylactic defense, and space advantages';
    description = 'You enjoy clamping down central outposts, grinding down pawn weaknesses, and out-maneuvering opponents through long-term structural superiority.';
  } else if (tacticsScore >= 55 && positionalScore < 55 && !isGreedy) {
    primaryArchetype = 'dynamic_counterpuncher';
    label = 'Dynamic Counterpuncher';
    tagline = 'Asymmetrical imbalance and venomous counter-strikes';
    description = 'You excel when absorbing White’s initial initiative and countering fiercely down semi-open flank files or sudden central pawn breaks.';
  }

  return {
    primaryArchetype,
    label,
    tagline,
    description,
    tacticalBiasScore: Math.min(100, Math.round((tacticsScore * 1.2 + (isAggressive ? 20 : 0)) / 1.3)),
    riskToleranceScore: Math.min(100, Math.round(100 - kingSafetyScore * 0.8 + (isGreedy ? 20 : 0))),
    positionalPatienceScore: Math.min(100, Math.round(patienceScore * 0.7 + positionalScore * 0.5)),
    strengths: playerModel.strengths.slice(0, 3),
    recommendedPawnStructures: [
      'Classical Spanish Central Tension (e4/d4 vs e5/d6)',
      'Caro-Kann / French Fixed Pawn Chains',
      'Open Sicilian Central Asymmetry'
    ],
    openingsToAvoid: [
      'Overly passive passive systems (e.g. passive Philidor)',
      'Premature flank raids before king is castled'
    ]
  };
}

// -------------------------------------------------------------
// VARIATION PERFORMANCE ANALYSIS
// -------------------------------------------------------------
export function extractVariationPerformance(playerModel: PlayerModel): VariationPerformanceStat[] {
  const openingUnderstanding = playerModel.openingUnderstanding || {};
  const stats: VariationPerformanceStat[] = [];

  // Seeded / recorded opening profiles
  Object.values(openingUnderstanding).forEach(op => {
    const wins = Math.round((op.winRate / 100) * op.gamesPlayed);
    const losses = Math.max(0, op.gamesPlayed - wins - 1);
    const draws = Math.max(0, op.gamesPlayed - wins - losses);
    
    let status: 'stronghold' | 'developing' | 'vulnerable' = 'developing';
    if (op.winRate >= 60 && op.gamesPlayed >= 4) status = 'stronghold';
    else if (op.winRate < 45 || op.understandingScore < 50) status = 'vulnerable';

    stats.push({
      eco: op.eco,
      name: op.name,
      color: op.eco.startsWith('B') || op.eco.startsWith('C0') || op.eco.startsWith('D') ? 'b' : 'w',
      gamesPlayed: op.gamesPlayed,
      wins,
      losses,
      draws,
      winRate: op.winRate,
      avgAccuracy: Math.round((op.understandingScore + op.applicationScore) / 2),
      status,
      strategicInsight: op.keyInsights[0] || 'Good foundational understanding with potential for deeper theoretical study.'
    });
  });

  // Ensure diverse representative records if fresh
  if (stats.length < 4) {
    if (!stats.some(s => s.eco === 'C60' || s.eco === 'C84')) {
      stats.push({
        eco: 'C84',
        name: 'Ruy Lopez: Classical Spanish',
        color: 'w',
        gamesPlayed: 14,
        wins: 9,
        losses: 3,
        draws: 2,
        winRate: 64,
        avgAccuracy: 84,
        status: 'stronghold',
        strategicInsight: 'Excellent piece harmony and mastery of Spanish knight reroutes (Nbd2-f1-g3).'
      });
    }
    if (!stats.some(s => s.eco === 'B90')) {
      stats.push({
        eco: 'B90',
        name: 'Sicilian Najdorf',
        color: 'b',
        gamesPlayed: 8,
        wins: 3,
        losses: 4,
        draws: 1,
        winRate: 38,
        avgAccuracy: 54,
        status: 'vulnerable',
        strategicInsight: 'Struggles when White rolls kingside pawns in the English Attack; needs tighter c-file timing.'
      });
    }
    if (!stats.some(s => s.eco === 'D58')) {
      stats.push({
        eco: 'D58',
        name: "Queen's Gambit Declined (Tartakower)",
        color: 'b',
        gamesPlayed: 6,
        wins: 4,
        losses: 1,
        draws: 1,
        winRate: 67,
        avgAccuracy: 78,
        status: 'stronghold',
        strategicInsight: 'Solid grasp of hanging pawn complexes and comfortable trading queens into favorable endgames.'
      });
    }
    if (!stats.some(s => s.eco === 'B22')) {
      stats.push({
        eco: 'B22',
        name: 'Alapin Sicilian (Anti-Sicilian)',
        color: 'w',
        gamesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        winRate: 60,
        avgAccuracy: 72,
        status: 'developing',
        strategicInsight: 'Effective at blunting Black’s usual asymmetric counterplay with early c3 + d4.'
      });
    }
  }

  return stats;
}

// -------------------------------------------------------------
// COMPREHENSIVE CURATED REPERTOIRE CATALOG
// -------------------------------------------------------------
export const REPERTOIRE_CATALOG: RepertoireRecommendation[] = [
  // --- AS WHITE: 1.e4 ---
  {
    id: 'rec-white-ruy-lopez',
    eco: 'C84',
    color: 'w',
    name: 'Ruy Lopez (Spanish Opening)',
    variation: 'Closed Main Line (c3 + d4)',
    archetypeMatch: ['classical_harmonizer', 'solid_positional'],
    matchScore: 95,
    matchReason: 'Directly reinforces your highest-rated strength in classical piece maneuvering, patient center building, and kingside protection.',
    movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3'],
    responseTo: 'vs 1...e5 (Open Game)',
    corePlans: [
      'Safeguard the light-squared bishop on b3',
      'Execute the standard Spanish knight tour: Nb1-d2-f1-g3',
      'Establish a commanding central pawn duo with c3 and d4',
      'Initiate central or kingside pressure once castled and harmonized'
    ],
    pawnStructure: 'Spanish Classical Tension (e4/d4 vs e5/d6)',
    tacticalComplexity: 'Medium',
    memorizationDemand: 'Medium',
    isAlreadyInRepertoire: true,
    recommendedRole: 'Primary Weapon'
  },
  {
    id: 'rec-white-italian-giuoco',
    eco: 'C50',
    color: 'w',
    name: 'Italian Game: Giuoco Piano',
    variation: 'Slow Giuoco Pianissimo (c3 + d3)',
    archetypeMatch: ['classical_harmonizer', 'solid_positional'],
    matchScore: 88,
    matchReason: 'Provides ultra-solid control over the f7 diagonal without taking undue risks, fitting your calculated opening style.',
    movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'a6', 'Bb3', 'Ba7', 'Re1'],
    responseTo: 'vs 1...e5 (Open Game)',
    corePlans: [
      'Control the center quietly with c3 and d3',
      'Maneuver Nbd2-f1-g3 toward the kingside',
      'Prevent enemy pins with a timely h3',
      'Strike centrally with d3-d4 when fully prepared'
    ],
    pawnStructure: 'Italian Symmetrical Center',
    tacticalComplexity: 'Low',
    memorizationDemand: 'Low',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Solid Shield'
  },
  {
    id: 'rec-white-grand-prix',
    eco: 'B21',
    color: 'w',
    name: 'Grand Prix Attack',
    variation: 'f4 Kingside Mating Assault',
    archetypeMatch: ['aggressive_tactician'],
    matchScore: 92,
    matchReason: 'Bypasses dense Sicilian theory by launching an immediate direct attack against the enemy king with f4, Bc4, and Qe1-h4.',
    movesSan: ['e4', 'c5', 'Nc3', 'Nc6', 'f4', 'g6', 'Nf3', 'Bg7', 'Bc4', 'e6', 'f5', 'Nge7', 'fxe6', 'dxe6', 'd3'],
    responseTo: 'vs 1...c5 (Sicilian Defense)',
    corePlans: [
      'Grip the f5 outpost and open the f-file for the rook',
      'Transfer the queen to the kingside with Qe1-h4',
      'Sacrifice the bishop on h6 or knight on d5 to smash the defense'
    ],
    pawnStructure: 'Grand Prix Asymmetry (e4 vs e6/d6 with open f-file)',
    tacticalComplexity: 'High',
    memorizationDemand: 'Low',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Tactical Counter'
  },
  {
    id: 'rec-white-alapin',
    eco: 'B22',
    color: 'w',
    name: 'Alapin Sicilian (2.c3)',
    variation: 'Principled Center Control',
    archetypeMatch: ['classical_harmonizer', 'solid_positional'],
    matchScore: 89,
    matchReason: 'Effectively neutralizes your low win-rate against open Sicilians by eliminating tactical sharp lines in favor of classical central control.',
    movesSan: ['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'Nf6', 'Nf3', 'e6', 'Be2', 'Be7', 'O-O', 'O-O', 'c4'],
    responseTo: 'vs 1...c5 (Sicilian Defense)',
    corePlans: [
      'Erect a broad d4+c4 pawn front',
      'Gain tempos by chasing Black’s centralized queen',
      'Develop harmoniously with Nf3, Be2, and Nc3'
    ],
    pawnStructure: 'Isolated Queen Pawn (IQP) or Classical Duo',
    tacticalComplexity: 'Low',
    memorizationDemand: 'Low',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Solid Shield'
  },
  {
    id: 'rec-white-french-tarrasch',
    eco: 'C03',
    color: 'w',
    name: 'French Defense: Tarrasch Variation',
    variation: '3.Nd2 Main Line',
    archetypeMatch: ['solid_positional', 'classical_harmonizer'],
    matchScore: 86,
    matchReason: 'Avoids early tactical pins on c3 (Winawer) and keeps your pawn chain flexible and robust against ...c5 breaks.',
    movesSan: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'c5', 'exd5', 'exd5', 'Ngf3', 'Nc6', 'Bb5', 'Bd6', 'O-O', 'Nge7', 'dxc5'],
    responseTo: 'vs 1...e6 (French Defense)',
    corePlans: [
      'Isolate Black’s d5 pawn and blockade it with a knight on d4',
      'Maintain flexible piece development without locking the c-pawn',
      'Dominate the endgame using the queenside pawn majority'
    ],
    pawnStructure: 'Isolated Queen Pawn (IQP) structure on d5',
    tacticalComplexity: 'Medium',
    memorizationDemand: 'Medium',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Primary Weapon'
  },

  // --- AS BLACK: vs 1.e4 ---
  {
    id: 'rec-black-caro-kann',
    eco: 'B12',
    color: 'b',
    name: 'Caro-Kann Defense',
    variation: 'Classical & Tartakower Setup',
    archetypeMatch: ['solid_positional', 'classical_harmonizer'],
    matchScore: 94,
    matchReason: 'Solves your uncastled king vulnerability in open games by creating an impenetrable pawn shield with zero tactical weaknesses on f7.',
    movesSan: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3'],
    responseTo: 'vs 1.e4 (as Black)',
    corePlans: [
      'Liberate the problem c8-bishop before playing ...e6',
      'Establish a rock-solid pawn spine on c6 and e6',
      'Castle queenside or kingside into high safety and grind the endgame'
    ],
    pawnStructure: 'Caro-Kann Granite Spine (c6-e6 vs e4/d4)',
    tacticalComplexity: 'Low',
    memorizationDemand: 'Low',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Solid Shield'
  },
  {
    id: 'rec-black-sicilian-dragon',
    eco: 'B70',
    color: 'b',
    name: 'Sicilian Dragon',
    variation: 'Accelerated / Yugoslav Defense',
    archetypeMatch: ['aggressive_tactician', 'dynamic_counterpuncher'],
    matchScore: 84,
    matchReason: 'Unleashes the monster dark-square bishop on g7 to attack White’s queenside while generating fierce c-file counter-pressure.',
    movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6'],
    responseTo: 'vs 1.e4 (as Black)',
    corePlans: [
      'Fianchetto the king’s bishop to target White’s queenside',
      'Execute the thematic ...Rxc3 exchange sacrifice',
      'Break centrally with the freeing ...d5 push'
    ],
    pawnStructure: 'Dragon Asymmetric Spine (d6/g6 vs e4/f3)',
    tacticalComplexity: 'Very High',
    memorizationDemand: 'High',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Surprise Ambush'
  },
  {
    id: 'rec-black-scandinavian',
    eco: 'B01',
    color: 'b',
    name: 'Scandinavian Defense',
    variation: 'Mieses-Kotroc Variation (3...Qa5)',
    archetypeMatch: ['dynamic_counterpuncher', 'classical_harmonizer'],
    matchScore: 82,
    matchReason: 'Instantly destroys White’s e4 pawn on move 1, simplifying the position into a clear Caro-Kann-like structure with active piece play.',
    movesSan: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6', 'Bc4', 'Bf5', 'Bd2', 'e6', 'Qe2'],
    responseTo: 'vs 1.e4 (as Black)',
    corePlans: [
      'Reroute the queen safely to c7 or d8 if harassed',
      'Develop light-squared bishop to f5 and anchor c6/e6',
      'Castle queenside and pressure White’s d4 pawn'
    ],
    pawnStructure: 'Scandinavian Center (c6/e6 fortress)',
    tacticalComplexity: 'Low',
    memorizationDemand: 'Low',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Solid Shield'
  },

  // --- AS BLACK: vs 1.d4 ---
  {
    id: 'rec-black-qgd-tartakower',
    eco: 'D58',
    color: 'b',
    name: "Queen's Gambit Declined (Tartakower)",
    variation: 'Hanging Pawns / Fianchetto b6',
    archetypeMatch: ['classical_harmonizer', 'solid_positional'],
    matchScore: 96,
    matchReason: 'Directly aligns with your 67% win rate against 1.d4, offering a masterclass in piece coordination and dynamic hanging pawn counterplay.',
    movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6', 'Be2', 'Bb7'],
    responseTo: 'vs 1.d4 / 1.c4 (as Black)',
    corePlans: [
      'Fianchetto the c8-bishop to b7 with an active laser on the long diagonal',
      'Liquidate center tension with a timely ...c5 pawn break',
      'Dominate the open files with rooks on c8 and d8'
    ],
    pawnStructure: 'Tartakower Hanging Pawns (c5/d5)',
    tacticalComplexity: 'Medium',
    memorizationDemand: 'Medium',
    isAlreadyInRepertoire: true,
    recommendedRole: 'Primary Weapon'
  },
  {
    id: 'rec-black-kings-indian',
    eco: 'E60',
    color: 'b',
    name: "King's Indian Defense",
    variation: 'Classical Mar del Plata Setup',
    archetypeMatch: ['aggressive_tactician', 'dynamic_counterpuncher'],
    matchScore: 90,
    matchReason: 'Allows Black to invite White’s space advantage, lock the center with ...e5, and launch a furious mating attack on White’s king with ...f5 and ...g5.',
    movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'Be3', 'f5'],
    responseTo: 'vs 1.d4 / 1.c4 (as Black)',
    corePlans: [
      'Lock the center with ...e5 and push White to d5',
      'Reroute the knight to e7 and advance the f-pawn (...f5-f4)',
      'Roll kingside pawns with ...g5 and ...h5 to break White’s king'
    ],
    pawnStructure: 'King’s Indian Locked Spine (d6/e5 vs d5/e4/c4)',
    tacticalComplexity: 'Very High',
    memorizationDemand: 'High',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Tactical Counter'
  },
  {
    id: 'rec-black-nimzo-indian',
    eco: 'E20',
    color: 'b',
    name: 'Nimzo-Indian Defense',
    variation: 'Rubinstein & Classical Variation',
    archetypeMatch: ['solid_positional', 'classical_harmonizer'],
    matchScore: 91,
    matchReason: 'Pins White’s c3 knight with 3...Bb4, inflicting doubled c-pawns on White and gaining total control over the critical e4 square.',
    movesSan: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5', 'O-O', 'Nc6', 'a3', 'Bxc3', 'bxc3'],
    responseTo: 'vs 1.d4 (as Black)',
    corePlans: [
      'Pin and double White’s c-pawns with ...Bxc3',
      'Target White’s doubled c4 pawn with ...b6, ...Ba6, and ...Na5',
      'Control the light squares (d5, e4, c4) with surgical precision'
    ],
    pawnStructure: 'Doubled c-pawns (c3/c4 vs a7/b6/c5)',
    tacticalComplexity: 'Medium',
    memorizationDemand: 'Medium',
    isAlreadyInRepertoire: false,
    recommendedRole: 'Primary Weapon'
  }
];

// -------------------------------------------------------------
// REPERTOIRE BUILDER RECOMMENDATION ENGINE
// -------------------------------------------------------------
export function generatePersonalizedRepertoire(playerModel: PlayerModel): {
  playstyle: PlaystyleAnalysis;
  variationStats: VariationPerformanceStat[];
  recommendedRepertoire: RepertoireRecommendation[];
  weakestOpeningRemedies: RepertoireRecommendation[];
  idealWhiteCore: RepertoireRecommendation[];
  idealBlackCore: RepertoireRecommendation[];
} {
  const playstyle = analyzeUserPlaystyle(playerModel);
  const variationStats = extractVariationPerformance(playerModel);

  // Identify weak variations to provide targeted counter-remedies
  const weakOpenings = variationStats.filter(v => v.status === 'vulnerable');

  // Compute adaptive match scores for each catalog entry
  const scoredCatalog = REPERTOIRE_CATALOG.map(rec => {
    let score = rec.matchScore;

    // Check if player has high/low win rates in related lines
    const relatedStat = variationStats.find(v => v.eco.slice(0, 2) === rec.eco.slice(0, 2));
    if (relatedStat) {
      if (relatedStat.winRate >= 60) {
        score += 5; // Reinforce proven weapons
      } else if (relatedStat.winRate < 45) {
        // If it's a solid antidote, boost it
        if (rec.recommendedRole === 'Solid Shield' || rec.recommendedRole === 'Tactical Counter') {
          score += 8;
        }
      }
    }

    // Playstyle alignment
    if (rec.archetypeMatch.includes(playstyle.primaryArchetype)) {
      score += 6;
    }

    // Check if already in user's repertoire
    const isAlready = (playerModel.openingRepertoire || []).some(
      r => r.eco.slice(0, 3) === rec.eco.slice(0, 3) || r.name.toLowerCase().includes(rec.name.toLowerCase())
    );

    return {
      ...rec,
      matchScore: Math.min(99, Math.max(70, score)),
      isAlreadyInRepertoire: isAlready,
      currentWinRate: relatedStat?.winRate,
      gamesPlayed: relatedStat?.gamesPlayed
    };
  });

  // Sort by match score descending
  scoredCatalog.sort((a, b) => b.matchScore - a.matchScore);

  const idealWhiteCore = scoredCatalog.filter(r => r.color === 'w').slice(0, 3);
  const idealBlackCore = scoredCatalog.filter(r => r.color === 'b').slice(0, 4);

  // Targeted remedies for weak lines
  const weakestOpeningRemedies = scoredCatalog.filter(
    r => r.recommendedRole === 'Solid Shield' || r.recommendedRole === 'Tactical Counter'
  ).slice(0, 3);

  return {
    playstyle,
    variationStats,
    recommendedRepertoire: scoredCatalog,
    weakestOpeningRemedies,
    idealWhiteCore,
    idealBlackCore
  };
}

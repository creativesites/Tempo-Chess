import { OpeningTacticalDrill, OpeningReportSummary, OpeningUnderstandingProfile, PlayerModel, Color } from '../types';

export const OPENING_TACTICAL_DRILLS: OpeningTacticalDrill[] = [
  // 1. Sicilian Defense: Countering the c-file & e4 weakness
  {
    id: 'drill-sicilian-1',
    openingName: 'Sicilian Defense',
    variationName: 'Open Sicilian (Dragon / Najdorf setup)',
    eco: 'B90',
    theme: 'c-file counterplay & Knight outpost',
    initialFen: 'r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 2 6',
    playerColor: 'w',
    correctMovesSan: ['Be3', 'f3', 'Bc4', 'Be2'],
    tacticalMotif: 'Restraining the ...d5 pawn break before White attacks',
    coachExplanation: 'In the Open Sicilian, White must develop purposefully (Be3, Bc4 or Be2) to control the d5 square. Premature pawn storms before minor piece development allow Black active counterplay down the c-file.',
    hint: 'Develop the dark-squared bishop to support central control and prepare queenside castling.',
    difficulty: 'easy'
  },
  {
    id: 'drill-sicilian-2',
    openingName: 'Sicilian Defense',
    variationName: 'Classical Defense (Richter-Rauzer)',
    eco: 'B60',
    theme: 'Exploiting pin on f6',
    initialFen: 'r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 4 6',
    playerColor: 'b',
    correctMovesSan: ['e6', 'Bd7', 'Qb6'],
    tacticalMotif: 'Solidifying the pawn structure against Bxf6 doubled pawns',
    coachExplanation: '6...e6 is essential here! It blunts White’s Bg5 pin, prepares ...Be7, and prevents White from fracturing Black’s kingside pawn structure with an early Bxf6.',
    hint: 'Defend your kingside structure and prepare to unpin the f6 knight.',
    difficulty: 'medium'
  },
  {
    id: 'drill-sicilian-3',
    openingName: 'Sicilian Defense',
    variationName: 'Alapin Variation (2.c3)',
    eco: 'B22',
    theme: 'Central strike with ...d5',
    initialFen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2',
    playerColor: 'b',
    correctMovesSan: ['d5', 'Nf6'],
    tacticalMotif: 'Punishing White’s delayed knight development with an immediate center strike',
    coachExplanation: 'When White plays 2.c3, Black can strike directly in the center with 2...d5! or 2...Nf6. Because White took away the c3 square from the knight, Black gets easy equality and active piece play.',
    hint: 'Challenge White’s pawn center immediately with a central pawn break.',
    difficulty: 'easy'
  },
  // 2. French Defense: Pawn Chain & c5 break
  {
    id: 'drill-french-1',
    openingName: 'French Defense',
    variationName: 'Advance Variation (3.e5)',
    eco: 'C02',
    theme: 'Attacking the base of the pawn chain',
    initialFen: 'rnbqkbnr/pppp1ppp/4p3/4P3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    playerColor: 'b',
    correctMovesSan: ['c5', 'c7c5'],
    tacticalMotif: 'Attacking the base of White’s pawn chain at d4',
    coachExplanation: 'In the French Advance, White’s central wedge e5 is anchored by d4. Black must immediately play 3...c5! to put maximum pressure on d4 and prepare ...Nc6 and ...Qb6.',
    hint: 'Strike at White’s d4 foundation with your c-pawn.',
    difficulty: 'easy'
  },
  {
    id: 'drill-french-2',
    openingName: 'French Defense',
    variationName: 'Tarrasch Variation (3.Nd2)',
    eco: 'C03',
    theme: 'Isolating White’s d-pawn',
    initialFen: 'rnbqkbnr/ppp2ppp/4p3/3P4/8/8/PPPN1PPP/R1BQKBNR b KQkq - 0 4',
    playerColor: 'b',
    correctMovesSan: ['exd5'],
    tacticalMotif: 'Opening lines and liberating the c8 light-squared bishop',
    coachExplanation: 'Recapturing 4...exd5 opens the diagonal for Black’s king bishop and allows the problem light-squared bishop on c8 to be activated via ...Be6 or ...Bg4 later.',
    hint: 'Recapture towards the center to open diagonals for your bishops.',
    difficulty: 'easy'
  },
  // 3. Ruy Lopez (Spanish Opening)
  {
    id: 'drill-ruy-1',
    openingName: 'Ruy Lopez',
    variationName: 'Morphy Defense (3...a6)',
    eco: 'C70',
    theme: 'Preserving the Light-Squared Bishop',
    initialFen: 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    playerColor: 'w',
    correctMovesSan: ['Ba4', 'Bxc6'],
    tacticalMotif: 'Retreating along the active a4-e8 diagonal',
    coachExplanation: '4.Ba4! keeps the pin on the knight alive. White preserves the valuable Spanish bishop while forcing Black to make further commitments with ...b5 before White castles.',
    hint: 'Maintain the pin and preserve your prized light-squared bishop.',
    difficulty: 'easy'
  },
  {
    id: 'drill-ruy-2',
    openingName: 'Ruy Lopez',
    variationName: 'Closed Spanish: Central Strike',
    eco: 'C84',
    theme: 'Controlling the d4 break',
    initialFen: 'r1bq1rk1/1pp1bppp/p1np1n2/4p3/B3P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 2 9',
    playerColor: 'w',
    correctMovesSan: ['Nbd2', 'h3', 'd4'],
    tacticalMotif: 'Knight rerouting Nbd2-f1-g3',
    coachExplanation: '9.Nbd2 prepares the famous Spanish knight maneuver to f1 and g3. White avoids rushing d4 until the pieces are harmoniously coordinated.',
    hint: 'Begin the classic Spanish knight rerouting plan.',
    difficulty: 'medium'
  },
  // 4. Queen\'s Gambit
  {
    id: 'drill-qgd-1',
    openingName: "Queen's Gambit",
    variationName: 'Exchange Variation',
    eco: 'D35',
    theme: 'Carlsbad Minority Attack Setup',
    initialFen: 'r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 1 6',
    playerColor: 'w',
    correctMovesSan: ['Bd3', 'Qc2', 'cxd5'],
    tacticalMotif: 'Developing the bishop to d3 targeting the h7 pawn before castling',
    coachExplanation: '6.Bd3 develops White’s most active piece to its optimal diagonal, preparing e4 pawn breaks or kingside battery alongside Qc2.',
    hint: 'Develop your light-squared bishop actively towards Black’s kingside.',
    difficulty: 'easy'
  },
  {
    id: 'drill-qgd-2',
    openingName: "Queen's Gambit Accepted",
    variationName: 'Central Domination',
    eco: 'D20',
    theme: 'Occupying the broad pawn center',
    initialFen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3',
    playerColor: 'b',
    correctMovesSan: ['e5', 'Nf6', 'b5', 'e6'],
    tacticalMotif: 'Countering White’s e4 plan by contesting the center',
    coachExplanation: 'In the QGA, Black must not try stubbornly to cling to the c4 pawn with ...b5 (which creates weaknesses on the a-file and c-file), but should strike at the center with ...e5 or ...e6.',
    hint: 'Focus on central development rather than defending the doubled c4 pawn.',
    difficulty: 'medium'
  },
  // 5. Italian Game
  {
    id: 'drill-italian-1',
    openingName: 'Italian Game',
    variationName: 'Giuoco Piano (c3 + d4 center build)',
    eco: 'C50',
    theme: 'Full classical pawn center',
    initialFen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4',
    playerColor: 'b',
    correctMovesSan: ['Nf6'],
    tacticalMotif: 'Counter-attacking White’s e4 pawn before White plays d4',
    coachExplanation: '4...Nf6! is Black’s best and most testing reply. It attacks White’s e4 pawn and forces White to either defend (d3) or commit to an immediate d4 tactical clash.',
    hint: 'Develop your kingside knight and attack White’s undefended e4 pawn.',
    difficulty: 'easy'
  },
  // 6. Caro-Kann Defense
  {
    id: 'drill-caro-1',
    openingName: 'Caro-Kann Defense',
    variationName: 'Advance Variation (3.e5)',
    eco: 'B12',
    theme: 'Activating the c8 bishop outside the pawn chain',
    initialFen: 'rnbqkbnr/pp2pppp/2p5/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3',
    playerColor: 'b',
    correctMovesSan: ['Bf5', 'c5'],
    tacticalMotif: 'Developing the light-squared bishop to f5 BEFORE playing ...e6',
    coachExplanation: 'This is the key advantage of the Caro-Kann over the French! 3...Bf5! brings the problem bishop outside the pawn chain before locking the center with ...e6.',
    hint: 'Free your light-squared bishop outside the pawn chain before playing ...e6.',
    difficulty: 'easy'
  }
];

export function getDrillsForOpening(ecoOrName: string): OpeningTacticalDrill[] {
  const query = ecoOrName.toLowerCase();
  return OPENING_TACTICAL_DRILLS.filter(
    drill =>
      drill.eco.toLowerCase().includes(query) ||
      drill.openingName.toLowerCase().includes(query) ||
      drill.variationName.toLowerCase().includes(query)
  );
}

export function getDrillsForWeakestOpenings(weakestEcos: string[]): OpeningTacticalDrill[] {
  if (!weakestEcos || weakestEcos.length === 0) {
    return OPENING_TACTICAL_DRILLS.slice(0, 5);
  }
  const matching = OPENING_TACTICAL_DRILLS.filter(drill =>
    weakestEcos.some(eco => eco.toLowerCase() === drill.eco.toLowerCase() || drill.openingName.toLowerCase().includes(eco.toLowerCase()))
  );
  return matching.length > 0 ? matching : OPENING_TACTICAL_DRILLS.slice(0, 5);
}

export function generateOpeningReport(playerModel: PlayerModel): OpeningReportSummary {
  const understandingMap = playerModel.openingUnderstanding || {};
  const repertoireList = playerModel.openingRepertoire || [];

  const profiles: OpeningUnderstandingProfile[] = Object.values(understandingMap);

  // If no explicit profiles, derive from repertoire
  if (profiles.length === 0 && repertoireList.length > 0) {
    repertoireList.forEach(rep => {
      profiles.push({
        eco: rep.eco,
        name: rep.name,
        understandingScore: rep.understandingPercentage,
        memorizationScore: rep.memorizationPercentage,
        applicationScore: rep.applicationPercentage,
        gamesPlayed: 6,
        winRate: rep.applicationPercentage > 70 ? 68 : 42,
        keyInsights: rep.keyPlans
      });
    });
  }

  // Fallback defaults if still empty
  if (profiles.length === 0) {
    profiles.push(
      {
        eco: 'B90',
        name: 'Sicilian Defense',
        understandingScore: 54,
        memorizationScore: 60,
        applicationScore: 42,
        gamesPlayed: 8,
        winRate: 38,
        keyInsights: ['Needs work on counterplay down the c-file', 'Avoid premature queen attacks']
      },
      {
        eco: 'C84',
        name: 'Ruy Lopez: Classical Spanish',
        understandingScore: 86,
        memorizationScore: 80,
        applicationScore: 84,
        gamesPlayed: 14,
        winRate: 72,
        keyInsights: ['Excellent understanding of c3+d4 pawn center', 'Sound knight rerouting']
      },
      {
        eco: 'D58',
        name: "Queen's Gambit Declined",
        understandingScore: 78,
        memorizationScore: 72,
        applicationScore: 75,
        gamesPlayed: 10,
        winRate: 65,
        keyInsights: ['Strong handling of Tartakower setup', 'Timely ...c5 pawn break']
      }
    );
  }

  // Sort profiles by applicationScore / winRate
  const sorted = [...profiles].sort((a, b) => a.applicationScore - b.applicationScore);
  const weakest = sorted.slice(0, 2);
  const strongest = [...sorted].reverse().slice(0, 2);

  const totalScore = Math.round(
    profiles.reduce((acc, curr) => acc + (curr.understandingScore + curr.applicationScore) / 2, 0) / profiles.length
  );

  return {
    overallScore: totalScore,
    totalOpeningsAnalyzed: profiles.length,
    strongestOpenings: strongest,
    weakestOpenings: weakest,
    recommendedFocus: weakest[0]?.name || 'Sicilian Defense: c-file counterplay',
    winRateAsWhite: 64,
    winRateAsBlack: 46,
    commonVulnerabilities: [
      'Delayed castling in asymmetric positions (e.g. Sicilian Defense)',
      'Premature single-piece counter-attacks when under central pawn tension',
      'Over-committing kingside pawns before finishing minor piece development'
    ]
  };
}

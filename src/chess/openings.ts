import { OpeningContext } from '../types';

export interface OpeningEntry {
  eco: string;
  name: string;
  variation?: string;
  moves: string[]; // SAN sequence
  coreIdea: string;
  keyPlans: string[];
  commonMistakes: string[];
}

export const OPENINGS_DATABASE: OpeningEntry[] = [
  {
    eco: 'C60',
    name: 'Ruy Lopez',
    variation: 'Spanish Opening',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    coreIdea: "Your bishop isn't merely attacking the knight. You are putting indirect pressure on the defender of e5, preparing rapid kingside castling, and fighting for long-term central control.",
    keyPlans: [
      'Castle quickly to safety (0-0)',
      'Support the center with c3 followed by d4',
      'Reroute the knight (Nb1-d2-f1-g3)',
      'Keep long-term pressure on Black’s pawn structure'
    ],
    commonMistakes: [
      'Prematurely giving up the bishop pair on c6 without concrete compensation',
      'Forgetting that after 4. Bxc6 dxc6 5. Nxe5, Black has 5...Qd4! regaining the pawn with advantage'
    ]
  },
  {
    eco: 'C65',
    name: 'Ruy Lopez',
    variation: 'Berlin Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
    coreIdea: 'The Berlin Wall. Black directly counter-attacks White’s e4 pawn instead of defending passive squares, prioritizing solid piece placement over pawn perfection.',
    keyPlans: [
      'White often castles (0-0) allowing Nxe4 into the famous Berlin endgame',
      'Fight for open d-file control and exploit Black’s doubled c-pawns',
      'Black seeks bishop pair activity and unshakeable central resistance'
    ],
    commonMistakes: [
      'Panic-defending e4 with passive moves like d3 when 0-0 preserves initiative',
      'Allowing White’s rooks to dominate the open d-file'
    ]
  },
  {
    eco: 'B90',
    name: 'Sicilian Defense',
    variation: 'Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    coreIdea: 'The most razor-sharp response to 1.e4. Move 5...a6 prevents White knights or bishops from landing on b5, preparing queenside expansion (...b5) while keeping flexibility in the center.',
    keyPlans: [
      'White aims for aggressive kingside attacks (Be3, f3, g4 or Bg5)',
      'Black builds counter-pressure along the semi-open c-file',
      'Black prepares the timely central strike ...d5 or ...e5',
      'High tactical tension on opposite-side castling'
    ],
    commonMistakes: [
      'Playing too passively as Black; without counterplay White’s attack crashes through',
      'Moving the king prematurely without finishing queenside development'
    ]
  },
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    variation: 'Open Sicilian',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'],
    coreIdea: 'White trades a central d-pawn for faster piece activity and space, while Black claims the semi-open c-file and long-term central pawn majority (2 vs 1 center pawns).',
    keyPlans: [
      'White leverages rapid piece development to pressure d6 and e7',
      'Black aims for ...Nf6, ...a6, and queenside counter-punches',
      'Control the critical d4 and d5 squares'
    ],
    commonMistakes: [
      'Black over-committing to passive defense instead of active counter-strikes',
      'Grabbing "poisoned" pawns on b2 before securing king safety'
    ]
  },
  {
    eco: 'C50',
    name: 'Italian Game',
    variation: 'Giuoco Piano',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    coreIdea: 'Classical harmony. White targets the sensitive f7 square with the bishop while maintaining harmonious piece development and options for c3 + d4.',
    keyPlans: [
      'Build a pawn center with c3 and d4',
      'Maintain flexible piece coordination and castle kingside',
      'Prevent Black from comfortably breaking out with ...d5'
    ],
    commonMistakes: [
      'Rushing d4 without preparing it with c3, resulting in isolated central pawns',
      'Leaving the c4 bishop vulnerable to ...Na5 or ...d5 forks'
    ]
  },
  {
    eco: 'D30',
    name: "Queen's Gambit",
    variation: 'Declined',
    moves: ['d4', 'd5', 'c4', 'e6'],
    coreIdea: "White offers a wing pawn on c4 to divert Black's center pawn on d5 and take full command of e4. Black solidly declines with 2...e6 to maintain an unyielding central fortress.",
    keyPlans: [
      'White builds pressure on d5 with Nc3, Bg5, and cxd5 (Karlsbad structure)',
      'Black looks to solve the "bad" light-squared bishop on c8 via ...c5 or ...e5 breaks',
      'Patience in maneuvering and strategic minority attack on the queenside'
    ],
    commonMistakes: [
      'Black playing ...c6 too early without preparing piece coordination, suffocating the bishop',
      'Allowing White’s knight to comfortably dominate the e5 outpost'
    ]
  },
  {
    eco: 'C00',
    name: 'French Defense',
    moves: ['e4', 'e6', 'd4', 'd5'],
    coreIdea: 'Black builds an asymmetrical counter-attacking structure, letting White establish space on e5 in order to relentlessly undermine White’s pawn chain via ...c5 and ...f6.',
    keyPlans: [
      'Black attacks the base of White’s pawn chain with ...c5, ...Nc6, and ...Qb6',
      'White secures the d4/e5 chain with c3 and aims for a kingside offensive',
      'Navigating the light-squared bishop problem on c8'
    ],
    commonMistakes: [
      'Black exchanging on e4 without clear compensation, opening lines for White for free',
      'White allowing the d4 pawn to collapse under siege'
    ]
  },
  {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    moves: ['e4', 'c6', 'd4', 'd5'],
    coreIdea: 'A rock-solid foundation. Black supports the ...d5 strike with ...c6, keeping the c8 bishop completely free to develop before playing ...e6.',
    keyPlans: [
      'Develop the light-squared bishop to f5 or g4 before closing the pawn structure',
      'Undermine White’s center later with ...c5',
      'Transposition into favorable, enduring endgames'
    ],
    commonMistakes: [
      'Trapping the c8 bishop inside with an accidental ...e6 before developing it',
      'Falling behind on king development in sharp Advance variations'
    ]
  },
  {
    eco: 'E60',
    name: "King's Indian Defense",
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'],
    coreIdea: 'Hypermodern combat. Black yields the center early to White, fianchettos the dark-squared bishop, and prepares a ferocious kingside pawn storm with ...e5 and ...f5.',
    keyPlans: [
      'Lock the center with ...e5 and d5, then unleash the ...f5 break',
      'Reroute pieces to attack White’s castled king',
      'White tries to breakthrough on the queenside (c5) before Black’s kingside attack lands'
    ],
    commonMistakes: [
      'Black hesitating on the kingside attack while White completely rolls the queenside',
      'Opening the center when Black is behind in piece development'
    ]
  },
  {
    eco: 'B01',
    name: 'Scandinavian Defense',
    moves: ['e4', 'd5'],
    coreIdea: 'Immediate confrontation on move 1. Black forces White to define the central pawn structure immediately, avoiding long theoretical lines.',
    keyPlans: [
      'After 2.exd5 Qxd5 3.Nc3, Black tucks the Queen to a5 or d6 with active pieces',
      'Develop light-squared bishop to f5, castle queenside or kingside solidly',
      'Target White’s overextended central squares'
    ],
    commonMistakes: [
      'Wandering with the Queen across the board, losing tempos to White’s developing minor pieces',
      'Allowing White’s knight outposts on d5 or e5'
    ]
  }
];

export function detectOpening(movesSan: string[]): OpeningContext | undefined {
  if (movesSan.length === 0) return undefined;

  let bestMatch: OpeningEntry | undefined = undefined;
  let maxMatchedMoves = 0;

  for (const entry of OPENINGS_DATABASE) {
    let matchCount = 0;
    for (let i = 0; i < Math.min(movesSan.length, entry.moves.length); i++) {
      if (movesSan[i] === entry.moves[i]) {
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 2 && matchCount >= maxMatchedMoves) {
      maxMatchedMoves = matchCount;
      bestMatch = entry;
    }
  }

  if (!bestMatch) return undefined;

  const hasDeviated = movesSan.length > bestMatch.moves.length || 
    (movesSan.length >= maxMatchedMoves && maxMatchedMoves < bestMatch.moves.length);

  return {
    eco: bestMatch.eco,
    name: bestMatch.name,
    variation: bestMatch.variation,
    coreIdea: bestMatch.coreIdea,
    keyPlans: bestMatch.keyPlans,
    commonMistakes: bestMatch.commonMistakes,
    deviationMoveIndex: hasDeviated ? maxMatchedMoves : undefined,
    deviationNote: hasDeviated
      ? `You deviated from standard ${bestMatch.name} theory on move ${Math.floor(maxMatchedMoves / 2) + 1}. That's completely fine—let's observe how the pawn structure and piece mobility now shift.`
      : undefined
  };
}

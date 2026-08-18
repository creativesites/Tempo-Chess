import { OpeningLesson } from '../types';

export const STRUCTURED_OPENING_LESSONS: OpeningLesson[] = [
  {
    id: 'lesson-ruy-lopez',
    eco: 'C60',
    openingName: 'Ruy Lopez (Spanish Opening)',
    variationName: 'Main Line & Principles',
    lessonTitle: 'The Architecture of the Spanish Opening',
    description: 'Master why 3.Bb5 is played, how to understand the resulting pawn tension, and how to navigate transitions into rich middlegames without rote memorization.',
    targetRating: '1000 - 1800',
    estimatedMinutes: 8,
    layer: 2,
    pawnStructureName: 'Classical Spanish Pawn Tension (e4 & d4 vs e5 & d6)',
    keyPlansWhite: [
      'Contest the e5 pawn defender to control central light squares',
      'Castle kingside immediately (0-0)',
      'Prepare central foundation with c3 and d4',
      'Reroute the b1 knight: Nb1 -> d2 -> f1 -> g3'
    ],
    keyPlansBlack: [
      'Clarify bishop placement with ...a6 and ...b5',
      'Anchor the center with ...d6',
      'Harmonize pieces with ...Be7 and ...Nf6'
    ],
    keyPawnBreaks: ['d2-d4 (White)', '...d7-d5 (Black liberation)', 'c2-c3 + d3-d4'],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'The Core Concept: Why 3. Bb5?',
        type: 'concept_explanation',
        fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        playerColor: 'w',
        heading: 'Putting Indirect Pressure on the Center',
        content: 'After 1.e4 e5 2.Nf3 Nc6, White plays 3.Bb5. Beginners often think White wants to capture the knight immediately on c6. But White’s real goal is indirect pressure: Black’s knight is the primary defender of the central e5 pawn. By menacing the defender, White prepares rapid castling and lays the groundwork for central dominance with c3 and d4.',
        highlightSquares: ['b5', 'c6', 'e5']
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'The Tactical Trap Check',
        type: 'socratic_question',
        fen: 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
        playerColor: 'w',
        heading: 'Can White win a pawn with 4. Bxc6 dxc6 5. Nxe5?',
        content: 'Black plays 3...a6 (Morphy Defense). If White plays 4.Bxc6 dxc6 5.Nxe5, does White win a free pawn, or does Black have a tactical refutation?',
        question: 'What is Black’s powerful double-attack if White gets greedy with 5.Nxe5?',
        hint: 'Look at the uncastled e-file and the undefended e5 knight and e4 pawn.',
        expectedMoveSan: ['Qd4', 'Qg5'],
        explanationAfterMove: '5...Qd4! (or 5...Qg5!) forks the knight on e5 and the pawn on e4, winning the pawn back immediately with an active queen and bishop pair for Black. That is why White patiently retreats with 4.Ba4!'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Interactive Move: Developing with Purpose',
        type: 'interactive_move',
        fen: 'r1bqk2r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5',
        playerColor: 'w',
        heading: 'Execute White’s Key Strategic Priority',
        content: 'Black has developed 4...Nf6, attacking your e4 pawn. Instead of panic-defending with passive moves, what is White’s most harmonious move according to classical principles?',
        question: 'Play White’s most principled move to secure the king.',
        expectedMoveSan: ['O-O', '0-0'],
        explanationAfterMove: 'Castling (0-0) is the master move! White secures the king, unpins the f1 rook to contest the e-file via Re1, and allows Black to take on e4 (the Open Spanish) where White gains immense initiative down the open e-file.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'The Legendary Spanish Knight Maneuver',
        type: 'middlegame_plan',
        fen: 'r1bq1rk1/1pp1bppp/p1np1n2/4p3/B3P3/2PP1N2/PP1N1PPP/R1BQR1K1 w - - 3 9',
        playerColor: 'w',
        heading: 'Rerouting to the Kingside Outposts (f1 -> g3)',
        content: 'Notice White’s knight on d2. In the Spanish, White doesn’t push it forward carelessly. White plays Nf1, then Ng3 (or Ne3). From g3, the knight targets the crucial f5 outpost, supports e4, and coordinates with the bishop battery to mount a kingside assault.',
        highlightSquares: ['d2', 'f1', 'g3', 'f5']
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Handling Deviations',
        type: 'deviation_handling',
        fen: 'r1bqkbnr/2pp1ppp/p1n5/1p2p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
        playerColor: 'w',
        heading: 'What if Black pushes ...b5 immediately?',
        content: 'Black plays an early 3...b5. Do not panic! Simply drop the bishop back to b3 (4.Bb3). Now your bishop sits comfortably on the deadly a2-g7 diagonal, eyeing Black’s sensitive f7 point and pinning Black’s d-pawn.',
        expectedMoveSan: ['Bb3'],
        explanationAfterMove: '4.Bb3 maintains your diagonal laser. Black has expanded on the queenside, but their king is still uncastled and their queenside pawns are overextended.'
      }
    ]
  },
  {
    id: 'lesson-sicilian-najdorf',
    eco: 'B90',
    openingName: 'Sicilian Defense',
    variationName: 'Najdorf Variation (5...a6)',
    lessonTitle: 'Understanding the Razor-Sharp Najdorf',
    description: 'Learn why 5...a6 is the most feared weapon against 1.e4, how Black counter-attacks along the c-file, and how to spot critical pawn breaks.',
    targetRating: '1100 - 1900',
    estimatedMinutes: 9,
    layer: 2,
    pawnStructureName: 'Sicilian Asymmetric Spine (e4 vs d6/e5/e6)',
    keyPlansWhite: [
      'English Attack with Be3, f3, Qd2, 0-0-0, and kingside pawn storm',
      'Classical attack with Bc4 and Bg5',
      'Control the d5 square and exploit backwards d6 pawn'
    ],
    keyPlansBlack: [
      'Take over the semi-open c-file with ...Rc8 and ...Qc7',
      'Queenside counter-thrust with ...b5 and ...Bb7',
      'Central strike ...d5 at the right tactical moment'
    ],
    keyPawnBreaks: ['...d6-d5', '...b7-b5', 'f2-f4-f5'],
    steps: [
      {
        id: 'naj-1',
        stepNumber: 1,
        title: 'The Purpose of 5...a6',
        type: 'concept_explanation',
        fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
        playerColor: 'b',
        heading: 'Restricting White and Preparing Counterplay',
        content: '5...a6 looks like a humble pawn move, but it is deeply multifaceted: 1) It permanently stops White knights or bishops from landing on b5 (preventing pesky pins or checks). 2) It prepares Black’s own queenside expansion with ...b5. 3) It keeps maximum flexibility to play either ...e6 (Scheveningen) or ...e5 (Classical Najdorf).',
        highlightSquares: ['a6', 'b5', 'b7']
      },
      {
        id: 'naj-2',
        stepNumber: 2,
        title: 'Interactive Move: The Thematic Central Advance',
        type: 'interactive_move',
        fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6',
        playerColor: 'b',
        heading: 'White plays 6.Be3 (English Attack Setup)',
        content: 'White prepares the English Attack (f3, Qd2, 0-0-0, g4). How does Black boldly challenge White’s center right now?',
        question: 'Play the characteristic Najdorf central strike for Black.',
        expectedMoveSan: ['e5', 'Ng4'],
        explanationAfterMove: '6...e5! strikes at White’s d4 knight with tempo, seizing space in the center. Yes, it creates a hole on d5, but Black’s dynamic piece activity and rapid queenside expansion more than compensate.'
      },
      {
        id: 'naj-3',
        stepNumber: 3,
        title: 'Thematic Tactical Motif: The Exchange Sacrifice on c3',
        type: 'middlegame_plan',
        fen: '2rqkb1r/1p1b1ppp/p2ppn2/8/3NP3/2N1BP2/PPPQ2PP/2KR3R b k - 2 11',
        playerColor: 'b',
        heading: 'Rxc3! — Shattering the Queenside Shield',
        content: 'In opposite-side castling Sicilian games, Black frequently executes the legendary ...Rxc3 exchange sacrifice. Sacrificing a rook for the c3 knight destroys White’s pawn structure (bxc3), leaves White’s king completely naked, and removes the primary defender of the central e4/d4 squares.',
        highlightSquares: ['c3', 'c8', 'c1']
      }
    ]
  },
  {
    id: 'lesson-queens-gambit',
    eco: 'D30',
    openingName: "Queen's Gambit",
    variationName: 'Declined & Pawn Structure Strategy',
    lessonTitle: 'The Carlsbad Structure & Minority Attack',
    description: 'Understand the strategic battle lines of 1.d4 d5 2.c4 e6. Learn why the pawn structure dictates every piece placement.',
    targetRating: '1000 - 1800',
    estimatedMinutes: 8,
    layer: 2,
    pawnStructureName: 'Carlsbad Pawn Structure (White c3/d4/e3 vs Black c6/d5/e6)',
    keyPlansWhite: [
      'Minority attack on the queenside (a4, Rab1, b4-b5)',
      'Create an isolated or backward c6 pawn on Black’s queenside',
      'Occupy the central e5 outpost with a knight'
    ],
    keyPlansBlack: [
      'Support d5 anchor and exchange light pieces to ease cramped space',
      'Kingside counter-attack using the f6 knight and f-file',
      'Free the c8 bishop via ...b6 and ...Bb7'
    ],
    keyPawnBreaks: ['b4-b5 (White Minority Attack)', '...c6-c5 (Black liberation)', 'e3-e4 (White central burst)'],
    steps: [
      {
        id: 'qgd-1',
        stepNumber: 1,
        title: 'The Gambit Concept',
        type: 'concept_explanation',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
        playerColor: 'w',
        heading: 'Why 2.c4 is Not a "Real" Gambit',
        content: 'When White plays 2.c4, it looks like giving away a pawn. But if Black plays 2...dxc4, White plays 3.e3 or 3.Nf3 and easily recovers the pawn with Bxc4. White’s real goal is to trade a flank pawn (c4) for Black’s central pawn (d5), securing a permanent central pawn presence.',
        highlightSquares: ['c4', 'd5', 'e4']
      },
      {
        id: 'qgd-2',
        stepNumber: 2,
        title: 'The Minority Attack Plan',
        type: 'middlegame_plan',
        fen: 'r1bqr1k1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PPQ1BPPP/R4RK1 w - - 4 10',
        playerColor: 'w',
        heading: 'Two Pawns (a2, b2) Attacking Three Pawns (a7, b7, c6)',
        content: 'In the Carlsbad structure after cxd5 exd5, White has 2 queenside pawns (a & b) against Black’s 3 (a, b, c). White prepares Rab1, a4, and b4-b5! When White plays b5 and trades on c6, Black is left with a weak, backward pawn on c6 that White’s rooks can target for the rest of the game.',
        highlightSquares: ['b4', 'b5', 'c6']
      }
    ]
  },
  {
    id: 'lesson-italian-game',
    eco: 'C50',
    openingName: 'Italian Game',
    variationName: 'Giuoco Piano (3...Bc5)',
    lessonTitle: 'Harmony & The Classical Center',
    description: 'Discover the harmonious piece coordination of the Italian Game, how to build the c3+d4 classical center, and when to castle.',
    targetRating: '800 - 1600',
    estimatedMinutes: 7,
    layer: 1,
    pawnStructureName: 'Open Classical Center',
    keyPlansWhite: [
      'Target f7 with Bc4',
      'Build pawn center with c3 followed by d4',
      'Castle quickly and connect rooks'
    ],
    keyPlansBlack: [
      'Maintain strongpoint on e5',
      'Counter-attack with ...Nf6 and ...d6',
      'Preserve dark bishop on a7 if attacked'
    ],
    keyPawnBreaks: ['d2-d4', '...d7-d5', 'f2-f4'],
    steps: [
      {
        id: 'it-1',
        stepNumber: 1,
        title: 'Targeting the Weakest Square (f7)',
        type: 'concept_explanation',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        playerColor: 'w',
        heading: 'Why 3.Bc4 is so dangerous for Black',
        content: 'At the start of the game, f7 (and f2 for White) is the only square defended purely by the king. By placing the bishop on c4, White directly aims at f7 while keeping all center options open.',
        highlightSquares: ['c4', 'f7', 'e8']
      },
      {
        id: 'it-2',
        stepNumber: 2,
        title: 'Interactive Move: Preparing the Center',
        type: 'interactive_move',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 5',
        playerColor: 'w',
        heading: 'Support the Upcoming d4 Push',
        content: 'Black plays 4...Nf6. What is White’s classical preparation move to build an iron center with d4?',
        question: 'Play White’s classical center-building move.',
        expectedMoveSan: ['c3', 'd3', 'O-O', '0-0'],
        explanationAfterMove: '5.c3! (or 5.d3 Giuoco Pianissimo) controls d4, preparing to establish two united center pawns on e4 and d4.'
      }
    ]
  }
];

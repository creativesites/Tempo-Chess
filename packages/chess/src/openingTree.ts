import { OpeningTreeNode } from './types';

export const OPENING_TREES: OpeningTreeNode[] = [
  {
    id: 'tree-sicilian',
    name: 'Sicilian Defense',
    variation: 'Main Complex',
    eco: 'B20-B99',
    movesSan: ['e4', 'c5'],
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    coreIdea: 'The quintessential asymmetrical response to 1.e4. Black unbalances the position on move 1, trading a flank c-pawn for White’s central d-pawn to establish a 2-vs-1 central pawn majority with rich counter-attacking chances along the semi-open c-file.',
    strategicPlans: {
      white: [
        'Open the center with d4 to maximize piece activity',
        'Direct kingside attack with f4, Be3, Qd2, 0-0-0, g4, h4',
        'Exploit the sensitive d5 outpost and backwards d6 pawn'
      ],
      black: [
        'Apply persistent pressure down the semi-open c-file',
        'Expand queenside with ...a6 and ...b5, threatening ...b4',
        'Strike centrally with the thematic ...d5 pawn break'
      ]
    },
    pawnStructure: 'Sicilian Center (White: e4; Black: d6/e6, central majority on d/e files)',
    pawnBreaks: ['...d5 (Black primary freeing break)', 'f4-f5 (White attacking lever)', '...b5 (Black queenside expansion)'],
    tacticalMotifs: ['Rook sacrifice on c3 (Rxc3!) shattering White king shield', 'Knight sacrifice on d5/f5 cracking open the e-file', 'Opposite-side castling pawn storms'],
    commonMistakes: [
      'Playing too passively as Black; White’s central space converts into a mating attack',
      'Forgetting that Black must avoid early queen excursions when kingside development is incomplete'
    ],
    transitionToMiddlegame: 'Extremely sharp middlegames characterized by opposite-side castling, king races, and piece coordination around the critical d5 and c4 squares.',
    typicalEndgameCharacter: 'Black generally holds endgame superiority due to the central 2 vs 1 pawn majority on the d and e files if the king survives White’s middlegame onslaught.',
    representativeGames: ['Kasparov vs. Anand (1995)', 'Fischer vs. Spassky (1972)', 'Carlsen vs. Caruana (2018)'],
    children: [
      {
        id: 'tree-sicilian-najdorf',
        name: 'Sicilian Najdorf',
        variation: 'Main Line',
        eco: 'B90',
        movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
        fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
        coreIdea: '5...a6 is the ultimate flexible move. It prevents White knights and bishops from landing on b5, prepares queenside expansion (...b5), and keeps options open for both ...e5 and ...e6 setups.',
        strategicPlans: {
          white: [
            'English Attack (Be3, f3, Qd2, 0-0-0, g4-g5)',
            'Classical 6.Be2 followed by quiet kingside pressure',
            'Sharp 6.Bg5 aiming to double Black’s f-pawns or exploit e6'
          ],
          black: [
            'Thematic ...e5 seizing central space and kicking the d4 knight',
            'Pressure along the c-file with ...Nbd7, ...Rc8, ...Qc7',
            'Prepare timely ...d5 central breakthrough'
          ]
        },
        pawnStructure: 'Scheveningen (d6/e6) or Boleslavsky Hole (d6/e5 with d5 outpost)',
        pawnBreaks: ['...d5', '...b5', 'f4-f5'],
        tacticalMotifs: ['Bxf7+ sacrificial lines', 'Nf5 sacrifices', '...Rxc3 exchange sacrifices on the c-file'],
        commonMistakes: [
          'Delaying queenside counterplay while White rolls g4-g5 on the kingside',
          'Neglecting king safety when the e-file opens up'
        ],
        transitionToMiddlegame: 'A high-wire act where tempo is king. Every single tempo in the attack determines who strikes first.',
        typicalEndgameCharacter: 'Sharp piece endings where pawn structure weaknesses (such as d6 or doubled f-pawns) decide the outcome.',
        representativeGames: ['Fischer vs. Tal (1959)', 'Kasparov vs. Karpov (1985)']
      },
      {
        id: 'tree-sicilian-dragon',
        name: 'Sicilian Dragon',
        variation: 'Yugoslav Attack',
        eco: 'B70-B79',
        movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
        fen: 'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
        coreIdea: 'Black fianchettoes the dark-square bishop on g7 (the "Dragon bishop"), turning it into a monster laser pointing directly at White’s queenside and the c3 knight.',
        strategicPlans: {
          white: [
            'Yugoslav Attack: Be3, f3, Qd2, Bc4, 0-0-0, Bh6, h4-h5 mating attack',
            'Pawn sacrifice on h5 to rip open the h-file for the rooks'
          ],
          black: [
            'Direct pieces towards White king with ...Rc8, ...Nc5/Ne5, and ...Qa5',
            'Thematic ...Rxc3 exchange sacrifice',
            'Play ...d5 pawn break at the earliest safe moment'
          ]
        },
        pawnStructure: 'Dragon Pawn Spine (d6, g6, h7 vs e4, f3, g2, h2)',
        pawnBreaks: ['...d5', 'h4-h5'],
        tacticalMotifs: ['Exchange sacrifice ...Rxc3', 'Bh6 bishop trade to remove the dragon protector', 'Nxd4 followed by ...Qa5'],
        commonMistakes: ['Allowing White to trade dark-square bishops without fight', 'Failing to initiate counterplay on c-file before h-file opens'],
        transitionToMiddlegame: 'Pure tactical warfare with opposite-side castling where both sides play for checkmate.',
        typicalEndgameCharacter: 'Rarely reaches an endgame; when it does, Black’s bishop pair or outside passers provide winning chances.',
        representativeGames: ['Karpov vs. Korchnoi (1974)', 'Topalov vs. Kasparov (1996)']
      },
      {
        id: 'tree-sicilian-sveshnikov',
        name: 'Sicilian Sveshnikov',
        variation: 'Modern Main Line',
        eco: 'B33',
        movesSan: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'],
        fen: 'r1bqkb1r/pp1p1ppp/2n2n2/4p3/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
        coreIdea: 'Black deliberately weakens the d5 square and accepts a backward d6 pawn in order to kick White’s knight to the rim (a3) and seize massive central initiative with active piece play.',
        strategicPlans: {
          white: ['Exploit the hole on d5 with Ndb5 followed by Nd5', 'Maintain bind with c4 (Maroczy structure) or c3'],
          black: ['Bishop pair dynamic play', 'Queenside expansion with ...f5 strike', 'Activate minor pieces aggressively']
        },
        pawnStructure: 'Sveshnikov Hole (Backward d6, backward c-pawn, d5 outpost)',
        pawnBreaks: ['...f5 (Black’s vital dynamic counter-break)', 'c2-c4 (White clamp)'],
        tacticalMotifs: ['Nd5 knight sacrifice', 'Bxf6 destroying kingside pawns', '...b5 flank deflection'],
        commonMistakes: ['Playing too passively and allowing White’s knight to dominate d5 without contest', 'Neglecting the f5 break'],
        transitionToMiddlegame: 'Dynamic imbalance between White’s static positional advantage (d5 square) and Black’s dynamic piece activity.',
        typicalEndgameCharacter: 'Endgames favor White if Black cannot resolve the d6 weakness or activate the f-pawn majority.',
        representativeGames: ['Carlsen vs. Caruana (World Championship 2018)', 'Kramnik vs. Leko (2004)']
      }
    ]
  },
  {
    id: 'tree-ruy-lopez',
    name: 'Ruy Lopez (Spanish Opening)',
    variation: 'Classical Spanish Complex',
    eco: 'C60-C99',
    movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    coreIdea: 'The Spanish Opening puts indirect positional pressure on Black’s e5 pawn by contesting its defender (the c6 knight). It prepares rapid castling, knight rerouting (Nb1-d2-f1-g3), and long-term central control with c3 + d4.',
    strategicPlans: {
      white: [
        'Castle quickly (0-0) and build an iron pawn center with c3 and d4',
        'Reroute knight from b1 via d2 -> f1 -> g3 to pressure the kingside',
        'Preserve the light-squared bishop on b3/c2 as the primary attacking weapon'
      ],
      black: [
        'Break the pin with ...a6 and ...b5, placing bishop on b7 or e7',
        'Reroute knight (...Nb8-d7) or set up central fortress with ...d6',
        'Target White’s e4 pawn and prepare the ...d5 counter-strike'
      ]
    },
    pawnStructure: 'Spanish Center (White: e4, d4/d3, c3; Black: e5, d6, c5/c7)',
    pawnBreaks: ['d4 (White central expansion)', '...d5 (Black central liberation)', 'c4 / ...c5'],
    tacticalMotifs: ['Noah’s Ark Trap (...a6, ...b5, ...c5, ...c4 trapping White bishop)', 'Nf5 knight outpost', 'Bxh7+ classic bishop sacrifices on kingside'],
    commonMistakes: [
      'Giving up the light-squared bishop pair carelessly as White',
      'Playing ...Nxe4 too early without calculating White’s Re1 response'
    ],
    transitionToMiddlegame: 'Rich, strategic maneuvering battles where understanding pawn structures and piece placement is far more important than memorizing move orders.',
    typicalEndgameCharacter: 'Classic master endgames where minor piece activity and pawn structure integrity on the queenside determine victory.',
    representativeGames: ['Kasparov vs. Karpov (1990)', 'Capablanca vs. Marshall (1918)', 'Carlsen vs. Anand (2014)'],
    children: [
      {
        id: 'tree-ruy-berlin',
        name: 'Ruy Lopez Berlin Defense',
        variation: 'The Berlin Wall',
        eco: 'C65',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        coreIdea: 'Black attacks White’s e4 pawn directly rather than playing passively. In the main line (4.0-0 Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5 8.Qxd8+ Kxd8), Black accepts an uncastled king and doubled c-pawns in exchange for the bishop pair and unbreakable central solidity.',
        strategicPlans: {
          white: ['Exploit queenside pawn majority (4 vs 3)', 'Dominate the open d-file with rooks', 'Restrain Black’s bishop pair'],
          black: ['Leverage the bishop pair in open endgame', 'Tuck king securely on c8 or e8', 'Create active piece outposts']
        },
        pawnStructure: 'Berlin Endgame Structure (White: 4 vs 3 queenside majority; Black: doubled c-pawns, active bishop pair)',
        pawnBreaks: ['f4 (White kingside clamp)', '...c5 and ...f6 (Black structure repairs)'],
        tacticalMotifs: ['Tactical exchanges leading straight to Queenless middlegames'],
        commonMistakes: ['Trying to force early attacks as White instead of patient endgame pressure', 'Passive king placement as Black'],
        transitionToMiddlegame: 'Transitions immediately into the most famous endgame / queenless middlegame in modern chess.',
        typicalEndgameCharacter: 'Extremely deep endgame where White tests Black’s defensive precision over 50+ moves.',
        representativeGames: ['Kramnik vs. Kasparov (World Championship 2000)', 'Carlsen vs. Karjakin (2016)']
      },
      {
        id: 'tree-ruy-closed',
        name: 'Ruy Lopez Closed Spanish',
        variation: 'Morphy Defense & Chigorin',
        eco: 'C84-C99',
        movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', '0-0', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', '0-0', 'h3'],
        fen: 'r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 b - - 0 9',
        coreIdea: 'The absolute pinnacle of classical chess strategy. White plays h3 to prevent ...Bg4, then prepares Nbd2-f1-g3, while Black decides between the Chigorin (...Na5 + ...c5), Breyer (...Nb8-d7), or Zaitsev (...Bb7) systems.',
        strategicPlans: {
          white: ['Nbd2-f1-g3 knight maneuver', 'Push d4 when center is secured', 'Direct bishop and queen towards kingside'],
          black: ['Queenside counterplay with ...c5 and ...Na5/Nd7', 'Control c4 square', 'Fight for central equality']
        },
        pawnStructure: 'Classical Spanish Pawn Chain',
        pawnBreaks: ['d4', '...c5', '...d5 (Marshall / Breyer breaks)'],
        tacticalMotifs: ['Nf5 sacrifices', 'd5 pawn break tactics', 'Queen and bishop battery along b1-h7'],
        commonMistakes: ['Allowing Black’s knights to take over c4 without contest', 'Rushing d4 before h3, allowing ...Bg4 pin'],
        transitionToMiddlegame: 'Dense, positional middlegames with slow maneuvering and complex strategic planning.',
        typicalEndgameCharacter: 'Rich endgames where light-squared bishop activity and knight outposts dominate.',
        representativeGames: ['Kasparov vs. Karpov (1986)', 'Fischer vs. Spassky (1972)']
      }
    ]
  },
  {
    id: 'tree-queens-gambit',
    name: "Queen's Gambit",
    variation: 'Declined & Slav Complex',
    eco: 'D30-D69',
    movesSan: ['d4', 'd5', 'c4'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    coreIdea: 'White offers a flank c-pawn to deflect Black’s central d5 pawn. If Black captures (Accepted), White gains central dominance with e4. If Black declines (e6 or c6), White maintains central pressure and open lines on the queenside.',
    strategicPlans: {
      white: [
        'Develop knights to c3 and f3, placing pressure on d5',
        'Pin the f6 knight with Bg5 or build Catalan fianchetto with g3',
        'Minority attack on the queenside with b4-b5 to create weak c6/c7 pawns'
      ],
      black: [
        'Maintain central anchor on d5 with ...e6 (QGD) or ...c6 (Slav)',
        'Free the light-squared "problem bishop" via ...b6, ...dxc4, or ...e5 break',
        'Counter-strike with ...c5 (Tarrasch style) or ...e5'
      ]
    },
    pawnStructure: 'Carlsbad Structure (Exchange variation: White has e3, d4, c3/c4; Black has e6, d5, c6)',
    pawnBreaks: ['e4 (White central break)', 'b4-b5 (Minority attack)', '...c5 / ...e5 (Black central breaks)'],
    tacticalMotifs: ['Greek Gift sacrifice (Bxh7+)', 'Pillsbury Attack with Ne5 + f4', 'Elephant Trap in QGD'],
    commonMistakes: [
      'Treating 2...dxc4 as winning a free pawn (White immediately regains with e3/e4 and Bxc4)',
      'Locking Black’s light-squared bishop behind passive e6 pawn without a plan to free it'
    ],
    transitionToMiddlegame: 'Deep strategic battles focused on pawn structures (Carlsbad, isolated queen pawn, hanging pawns) and open c/d files.',
    typicalEndgameCharacter: 'Endgames frequently hinge on minority attack weaknesses (backward c6 pawn) or isolated d-pawn blockade.',
    representativeGames: ['Capablanca vs. Alekhine (1927)', 'Kasparov vs. Karpov (1987)', 'Ding Liren vs. Nepomniachtchi (2023)'],
    children: [
      {
        id: 'tree-qgd-orthodox',
        name: "Queen's Gambit Declined",
        variation: 'Orthodox & Tartakower',
        eco: 'D35-D59',
        movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', '0-0', 'Nf3', 'h6', 'Bh4', 'b6'],
        fen: 'rnbq1rk1/p1p1bpp1/1p2pn1p/3p4/2PP3B/2N1PN2/PP3PPP/R2QKB1R w KQ - 0 8',
        coreIdea: 'The Tartakower Variation solves Black’s historic problem of the passive c8 bishop by fianchettoing it on b7, establishing a harmonious, resilient setup against White’s queenside pressure.',
        strategicPlans: {
          white: ['Exchange on d5 (Carlsbad structure) and launch minority attack b4-b5', 'Occupy e5 outpost with knight'],
          black: ['Place bishop on b7 and break with ...c5', 'Exchange pieces to neutralize White’s spatial advantage']
        },
        pawnStructure: 'Hanging Pawns (...c5 + ...d5) or Carlsbad Structure',
        pawnBreaks: ['...c5', '...e5', 'b4-b5'],
        tacticalMotifs: ['Tactical exchanges on d4/d5 freeing Black’s pieces', 'Bxf6 followed by Nd5'],
        commonMistakes: ['Rushing ...c5 before castling', 'Leaving isolated pawn on d5 without active piece support'],
        transitionToMiddlegame: 'Transition into classical hanging pawns or minority attack scenarios.',
        typicalEndgameCharacter: 'Solid, drawish endgames where active rooks can compensate for minor structural blemishes.',
        representativeGames: ['Spassky vs. Fischer (Game 6, 1972)', 'Kasparov vs. Karpov (1984)']
      },
      {
        id: 'tree-slav-defense',
        name: 'Slav Defense',
        variation: 'Main Line Classical',
        eco: 'D10-D19',
        movesSan: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5'],
        fen: 'rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq - 1 6',
        coreIdea: 'Black supports d5 with 2...c6, keeping the c8-h3 diagonal open so the light-squared bishop can develop freely to f5 or g4 before ...e6 is played.',
        strategicPlans: {
          white: ['Play a4 to stop ...b5, then e3/e4 to regain c4 pawn', 'Build central duo with e4 + d4'],
          black: ['Solidify Bf5 piece outpost', 'Play ...e6, ...Bb4, and castle kingside', 'Break with ...c5 or ...e5']
        },
        pawnStructure: 'Slav Structure (Solid c6/e6 triangle)',
        pawnBreaks: ['...c5', '...e5', 'e4'],
        tacticalMotifs: ['...Bb4 pins', 'e4 pawn forks if Black is careless'],
        commonMistakes: ['Allowing White’s e4 push without adequate piece control over e5', 'Trapping the f5 bishop with Nh4/g4'],
        transitionToMiddlegame: 'Extremely solid for Black with active minor pieces and strong pawn chain foundation.',
        typicalEndgameCharacter: 'Balanced endgames where Black often holds slight structural purity.',
        representativeGames: ['Anand vs. Kramnik (World Championship 2008)', 'Smyslov vs. Botvinnik (1954)']
      }
    ]
  },
  {
    id: 'tree-italian-game',
    name: 'Italian Game (Giuoco Piano)',
    variation: 'Classical & Evans Gambit',
    eco: 'C50-C54',
    movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    coreIdea: 'The most popular classical opening in world chess. White places the bishop on c4, pointing directly at Black’s vulnerable f7 square while developing harmoniously with options for c3 + d4 (Giuoco Piano) or d3 (Giuoco Pianissimo).',
    strategicPlans: {
      white: [
        'Slow Giuoco Pianissimo with c3, d3, Nbd2-f1-g3',
        'Aggressive c3 + d4 pushing for quick central expansion',
        'Pin Black’s f6 knight with Bg5'
      ],
      black: [
        'Solid ...d6, ...Nf6, and castle kingside',
        'Counter-strike with ...a6, ...Ba7 to preserve dark bishop',
        'Play ...d5 when White allows it'
      ]
    },
    pawnStructure: 'Open Classical Center',
    pawnBreaks: ['d4', '...d5', 'f4'],
    tacticalMotifs: ['Fried Liver Attack (in Two Knights Defense 3...Nf6 4.Ng5)', 'Bxf7+ king decoy sacrifices', 'c3 + d4 pawn center dominance'],
    commonMistakes: ['Playing d4 too quickly without c3 preparation', 'Leaving uncastled king exposed on open e-file'],
    transitionToMiddlegame: 'Fluid middlegames with rich tactical skirmishes on f7, d5, and along the c-file.',
    typicalEndgameCharacter: 'Direct, clear piece endings where king safety during the middlegame determined material balance.',
    representativeGames: ['Morphy vs. Duke of Brunswick (1858)', 'Dubov vs. Karjakin (2020)', 'Giri vs. Carlsen (2019)']
  },
  {
    id: 'tree-french-defense',
    name: 'French Defense',
    variation: 'Advance & Winawer',
    eco: 'C00-C19',
    movesSan: ['e4', 'e6', 'd4', 'd5'],
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3',
    coreIdea: 'Black builds an iron-clad pawn chain (c7-d5-e6) challenging White’s e4 pawn, creating an asymmetric spatial battle where White attacks the kingside and Black dismantles White’s pawn chain on the queenside (...c5 and ...f6).',
    strategicPlans: {
      white: ['Advance with 3.e5 locking the center and targeting kingside (f4, Nf3, Bd3, Qg4)', 'Support d4 pawn with c3'],
      black: ['Assault the base of White’s pawn chain with ...c5 and ...Qb6', 'Break the head with ...f6', 'Reroute the light-squared bishop (...Bd7-e8-h5)']
    },
    pawnStructure: 'French Pawn Chain (White: c3-d4-e5; Black: c5-d5-e6)',
    pawnBreaks: ['...c5 (Attacking the d4 base)', '...f6 (Undermining the e5 wedge)', 'f4-f5 (White kingside thrust)'],
    tacticalMotifs: ['Milner-Barry Gambit sacrifices', 'Greek Gift on h7', '...Rxf3 exchange sacrifice to shatter White center'],
    commonMistakes: ['Allowing Black’s light-squared bishop to stay dead forever on c8', 'White neglecting the defense of d4 under heavy ...Qb6 pressure'],
    transitionToMiddlegame: 'Static, maneuvering struggle where structural understanding of the locked center is paramount.',
    typicalEndgameCharacter: 'Favorable for Black if White’s pawn chain collapses, or favorable for White if Black’s bad bishop is trapped behind pawns.',
    representativeGames: ['Botvinnik vs. Capablanca (1938)', 'Short vs. Timman (1991)']
  },
  {
    id: 'tree-caro-kann',
    name: 'Caro-Kann Defense',
    variation: 'Classical & Advance',
    eco: 'B10-B19',
    movesSan: ['e4', 'c6', 'd4', 'd5'],
    fen: 'rnbqkbnr/pp1ppppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3',
    coreIdea: 'Black prepares ...d5 supported by ...c6. Unlike the French Defense, Black’s light-squared bishop is not blocked by an e6 pawn and can develop freely to f5 or g4 before Black solidifies with ...e6.',
    strategicPlans: {
      white: ['Advance variation (3.e5 Bf5 4.h4/Nf3) gaining space', 'Classical variation (3.Nc3 dxe4 4.Nxe4 Bf5) trading knights'],
      black: ['Develop Bf5 actively before playing ...e6', 'Break central chain with ...c5', 'Build impregnable solid structure']
    },
    pawnStructure: 'Caro Pawn Structure (d5, e6, c6 vs White e4/e5, d4)',
    pawnBreaks: ['...c5', '...f6', 'c4 (Panov Attack)'],
    tacticalMotifs: ['Panov-Botvinnik isolated queen pawn tactics', 'Bishop traps on h7 in Classical line'],
    commonMistakes: ['Trapping the light-squared bishop on c8 with an accidental early ...e6', 'Failing to contest White’s e5 space wedge'],
    transitionToMiddlegame: 'Remarkably solid and durable positions for Black with minimal weaknesses.',
    typicalEndgameCharacter: 'Black often thrives in Caro-Kann endgames due to clean, unified pawn structures without islands.',
    representativeGames: ['Capablanca vs. Tartakower (1924)', 'Karpov vs. Kasparov (1987)', 'Firouzja vs. Carlsen (2021)']
  },
  {
    id: 'tree-kings-indian',
    name: "King's Indian Defense",
    variation: 'Classical & Mar del Plata',
    eco: 'E60-E99',
    movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    fen: 'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5',
    coreIdea: 'The ultimate hypermodern defense against 1.d4. Black allows White to construct a massive classical pawn center (c4, d4, e4), only to lock it up and launch an all-out, uncompromising mating attack against White’s king on the kingside with ...f5, ...f4, ...g5, ...h5.',
    strategicPlans: {
      white: ['Queenside breakthrough with c5, b4, Ra1-c1, pushing to queen a pawn', 'Blockade or deflect Black’s kingside attack'],
      black: ['Lock center with ...e5, then storm kingside with ...f5-f4, ...g5, ...h5, ...g4', 'Sacrifice pieces on g3 or h3 for mate']
    },
    pawnStructure: 'Locked KID Center (White: c4, d5, e4; Black: c5/c7, d6, e5)',
    pawnBreaks: ['c4-c5 (White queenside race)', '...f7-f5 (Black kingside race)'],
    tacticalMotifs: ['Knight sacrifices on f4 or h3', 'Rook lifts via ...Rf6-h6', 'Opposite-wing race to mate vs queen promotion'],
    commonMistakes: ['Hesitating on the kingside attack as Black—every lost tempo allows White to promote on c8', 'Failing to close center before attacking'],
    transitionToMiddlegame: 'Breathtaking tension where calculation, courage, and visualization decide the victor.',
    typicalEndgameCharacter: 'Endgames are decisive for White if Black’s attack is repelled, or winning for Black if the king is caught.',
    representativeGames: ['Kasparov vs. Piket (1995)', 'Fischer vs. Gligoric (1970)', 'Nakamura vs. Gelfand (2010)']
  }
];

export function findOpeningTreeNode(movesSan: string[]): OpeningTreeNode | null {
  if (!movesSan || movesSan.length === 0) return null;

  for (const tree of OPENING_TREES) {
    if (movesMatch(movesSan, tree.movesSan)) {
      // Check children
      if (tree.children) {
        for (const child of tree.children) {
          if (movesMatch(movesSan, child.movesSan)) {
            return child;
          }
        }
      }
      return tree;
    }
  }
  return null;
}

function movesMatch(played: string[], target: string[]): boolean {
  if (played.length < target.length) return false;
  for (let i = 0; i < target.length; i++) {
    if (played[i].toLowerCase() !== target[i].toLowerCase()) return false;
  }
  return true;
}

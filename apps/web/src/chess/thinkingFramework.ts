import { ThinkingFrameworkStep, ThinkingExercise } from '../types';

export const THINKING_FRAMEWORK_STEPS: ThinkingFrameworkStep[] = [
  {
    id: 'what_changed',
    stepNumber: 1,
    name: 'What Changed?',
    shortPrompt: 'Look at the square just vacated and the square just occupied.',
    guidance: 'Every move leaves behind a weakened square or undefended piece, and exerts new pressure somewhere else.',
    questionToAskSelf: 'Which lines opened up? What piece did my opponent stop defending?'
  },
  {
    id: 'opponent_threats',
    stepNumber: 2,
    name: 'Opponent-First Threat Check',
    shortPrompt: 'Before you plan your attack, ask: What does my opponent want?',
    guidance: 'Assume your opponent plays twice in a row. What would they do on their very next move? Is there a direct check, fork, pin, or mate threat?',
    questionToAskSelf: 'If I pass my turn, what is the most damaging move my opponent can play?'
  },
  {
    id: 'forcing_moves',
    stepNumber: 3,
    name: 'Calculate Forcing Moves',
    shortPrompt: 'Checks, Captures, Threats (in that exact order).',
    guidance: 'Forcing moves limit the opponent’s replies. Always calculate every legal check first, then every capture, then direct threats on valuable pieces.',
    questionToAskSelf: 'Do I have any forcing checks or captures that win material or force a concession?'
  },
  {
    id: 'candidate_moves',
    stepNumber: 4,
    name: 'Generate Candidate Moves (Rule of 3)',
    shortPrompt: 'Never play the first move that pops into your head.',
    guidance: 'Find at least 2 or 3 distinct candidate moves before calculating deeply: 1 aggressive/tactical move, 1 solid defensive/improving move, 1 quiet positional move.',
    questionToAskSelf: 'What are my 3 best candidate moves in this position?'
  },
  {
    id: 'calculation_check',
    stepNumber: 5,
    name: 'Verify Opponent Replies',
    shortPrompt: 'Calculate: "I go here, they go there, then what?"',
    guidance: 'Don’t assume your opponent will make the move you hope they make. Look for their best defensive resource or counter-threat.',
    questionToAskSelf: 'What is their strongest response to my intended move?'
  },
  {
    id: 'worst_piece_plan',
    stepNumber: 6,
    name: 'Plan vs. Move (Improve Worst Piece)',
    shortPrompt: 'Don’t just push a piece—ask which piece is doing the least.',
    guidance: 'A plan is a multi-move intention (e.g. "Reroute knight to d5 outpost" or "Pressure isolated pawn on d5"). Find the piece contributing the least and improve it.',
    questionToAskSelf: 'Which of my pieces is currently doing the least useful work?'
  },
  {
    id: 'tactical_safety_check',
    stepNumber: 7,
    name: 'Blunder & Safety Check (Blunder Filter)',
    shortPrompt: 'The 2-second safety verification before letting go of the piece.',
    guidance: 'Is my intended destination square safe? Did moving this piece expose my king, rook, or undefended queen to a back-rank mate or discovery?',
    questionToAskSelf: 'Does this move leave anything unprotected or walk into a knight fork?'
  }
];

export const STRUCTURED_THINKING_EXERCISES: ThinkingExercise[] = [
  {
    id: 'think-ex-1',
    title: 'Opponent Threat Recognition: The Hidden Fork',
    theme: 'opponent_threats',
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 b - - 4 8',
    playerColor: 'b',
    scenarioDescription: 'White just played 8.Be2. Before thinking about Black’s attack, identify what White is prepared to do.',
    stepType: 'opponent_threats',
    question: 'What is White’s main positional threat if Black makes a careless non-developing move like 8...h6?',
    options: [
      'White will play 9.Nxc6 followed by e5, claiming central dominance',
      'White will play 9.Bf3 pinning the d6 pawn',
      'White will immediately sacrifice on h7 with Bxh7+'
    ],
    correctOptionIndex: 0,
    coachExplanation: 'Correct! White’s knight on d4 puts heavy pressure on c6. If Black hesitates, 9.Nxc6 bxc6 10.e5! breaks Black’s pawn structure. Black must stay active with 8...d5! or 8...Bd7.',
    mentalTakeaway: 'Always ask "What does my opponent want to do next?" before selecting your own move.'
  },
  {
    id: 'think-ex-2',
    title: 'Candidate Move Generation: Finding the 3 Paths',
    theme: 'candidate_moves',
    fen: 'r1b2rk1/pp1p1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP1BPPP/R1B2RK1 w - - 0 10',
    playerColor: 'w',
    scenarioDescription: 'Black’s dark bishop pins your c3 knight on b4. Instead of impulsively reacting, compare your 3 candidate options.',
    stepType: 'candidate_moves',
    question: 'Select the 3 candidate moves below and identify which is the most strategically principled for White:',
    candidateMoves: [
      {
        moveSan: 'Nbd2',
        quality: 'best',
        description: 'Harmonious knight reroute (Nd2-f1-g3) unpinning c3 and preparing to contest central squares.',
        strategicValue: 'High long-term positional value.',
        counterThreats: 'None; Black has no direct punishment.'
      },
      {
        moveSan: 'a3',
        quality: 'playable',
        description: 'Immediately challenges the bishop, but forces 10...Bxc3 11.bxc3 leaving White with doubled c-pawns.',
        strategicValue: 'Tactical clarity at the cost of pawn structure.',
        counterThreats: 'Black targets the weakened c4/c3 complex.'
      },
      {
        moveSan: 'Nd5',
        quality: 'flawed',
        description: 'Premature central lunge before completing development.',
        strategicValue: 'Liquidates prematurely.',
        counterThreats: 'Black plays 10...Nxd5 11.exd5 Nd4 equalizing easily.'
      }
    ],
    coachExplanation: '10.Nbd2 is the master move! Instead of weakening your queenside pawns with a3, you improve your least active knight and prepare long-term piece harmony.',
    mentalTakeaway: 'List 3 candidate moves before choosing. Compare what you gain vs what you concede.'
  },
  {
    id: 'think-ex-3',
    title: 'Plan vs Move: Improving the Worst-Placed Piece',
    theme: 'worst_piece',
    fen: 'r2q1rk1/1pp1bppp/p1np1n2/4p3/B3P3/2PP1N2/PP1N1PPP/R1BQR1K1 w - - 3 9',
    playerColor: 'w',
    scenarioDescription: 'White is castled and has a solid pawn center. Which piece is currently doing the least useful work?',
    stepType: 'worst_piece_plan',
    question: 'Identify White’s worst-placed piece and execute the first move of the standard rerouting plan.',
    options: [
      'Knight on d2: Reroute via 9.Nf1 to g3 or e3',
      'Rook on e1: Move to b1',
      'Pawn on h2: Push h4 immediately'
    ],
    correctOptionIndex: 0,
    interactiveTargetSquare: 'f1',
    correctMovesSan: ['Nf1', 'h3', 'Bb3'],
    coachExplanation: '9.Nf1! is the quintessential Spanish maneuver. From d2, the knight blocked the c1 bishop. Moving to f1 and then g3 places the knight on an aggressive outpost pointing directly at Black’s king.',
    mentalTakeaway: 'When you don’t see an immediate tactic, find your worst piece and make it better.'
  },
  {
    id: 'think-ex-4',
    title: 'Opponent-First: The Blunder Filter in Action',
    theme: 'opponent_threats',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
    playerColor: 'w',
    scenarioDescription: 'Black played 4...Nxe4, taking the e4 pawn. White can play 5.dxe4. But before moving, run the blunder filter!',
    stepType: 'tactical_safety_check',
    question: 'After 5.dxe4, is White safe, or does Black have a tactical fork? What should White play?',
    options: [
      '5.dxe4 is completely safe and wins a piece for a pawn (Black cannot fork)',
      '5.Bxf7+ is better to strip Black’s castling right before 6.dxe4',
      '5.Qe2 pin the knight'
    ],
    correctOptionIndex: 0,
    correctMovesSan: ['dxe4', 'Bxf7+'],
    coachExplanation: '5.dxe4 wins clean material! Beginners often fear ...d5 forks, but here after 5.dxe4 d5 6.Bxd5 White simply remains up a piece. The blunder filter confirms that White’s king is safe and material is won.',
    mentalTakeaway: 'Always run a 2-second check: Does my move allow a counter-fork or pin?'
  }
];

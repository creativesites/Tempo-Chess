// Standard Chess Opening Book for rated bots
// Maps FEN prefix or move sequence to standard book moves
export interface BookEntry {
  fen: string;
  moves: string[]; // List of standard candidate moves in SAN
  openingName: string;
}

export const OPENING_BOOK: Record<string, { moves: string[]; name: string }> = {
  // Starting position
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': {
    moves: ['e4', 'd4', 'Nf3', 'c4'],
    name: 'Standard Opening'
  },
  // 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': {
    moves: ['e5', 'c5', 'e6', 'c6', 'd5', 'Nf6', 'g6'],
    name: "King's Pawn Opening"
  },
  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': {
    moves: ['Nf3', 'Bc4', 'Nc3', 'd4', 'f4'],
    name: 'Open Game'
  },
  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': {
    moves: ['Nc6', 'Nf6', 'd6'],
    name: "King's Knight Opening"
  },
  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3': {
    moves: ['Bb5', 'Bc4', 'd4', 'Nc3'],
    name: 'Italian / Ruy Lopez / Scotch'
  },
  // 1. e4 e5 2. Nf3 Nc6 3. Bc4 (Italian)
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3': {
    moves: ['Bc5', 'Nf6', 'd6'],
    name: 'Italian Game'
  },
  // 1. e4 e5 2. Nf3 Nc6 3. Bb5 (Ruy Lopez)
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3': {
    moves: ['a6', 'Nf6', 'd6'],
    name: 'Ruy Lopez'
  },
  // 1. e4 c5 (Sicilian Defense)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': {
    moves: ['Nf3', 'Nc3', 'c3', 'd4'],
    name: 'Sicilian Defense'
  },
  // 1. e4 c5 2. Nf3
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': {
    moves: ['d6', 'Nc6', 'e6', 'g6'],
    name: 'Sicilian Defense: Open Lines'
  },
  // 1. e4 e6 (French Defense)
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': {
    moves: ['d4', 'd3', 'Nf3'],
    name: 'French Defense'
  },
  // 1. e4 c6 (Caro-Kann)
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': {
    moves: ['d4', 'Nc3', 'Nf3'],
    name: 'Caro-Kann Defense'
  },
  // 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': {
    moves: ['d5', 'Nf6', 'e6', 'g6', 'f5'],
    name: "Queen's Pawn Game"
  },
  // 1. d4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2': {
    moves: ['c4', 'Nf3', 'Bf4', 'e3'],
    name: "Queen's Gambit / London System"
  },
  // 1. d4 d5 2. c4 (Queen's Gambit)
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2': {
    moves: ['e6', 'c6', 'dxc4', 'Nf6'],
    name: "Queen's Gambit"
  },
  // 1. d4 Nf6
  'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2': {
    moves: ['c4', 'Nf3', 'Bf4', 'Bg5'],
    name: 'Indian Defense'
  },
  // 1. d4 Nf6 2. c4
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2': {
    moves: ['e6', 'g6', 'c5', 'e5'],
    name: "Indian Defenses: King's / Nimzo"
  },
  // 1. c4 (English Opening)
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1': {
    moves: ['e5', 'c5', 'Nf6', 'e6'],
    name: 'English Opening'
  }
};

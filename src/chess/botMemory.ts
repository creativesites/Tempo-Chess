import { BotProfile, Square, Color, ChessMove, PlayerModel } from '../types';
import { OPENING_BOOK } from './openingBook';

export interface BotMemoryRecord {
  botId: string;
  totalGamesVsUser: number;
  winsVsUser: number;
  lossesVsUser: number;
  drawsVsUser: number;
  userPreferredOpenings: Record<string, number>;
  userWeaknessesObserved: Record<string, number>; // e.g. 'early_queen': 3, 'uncastled_king': 4, 'hanging_minor': 2
  botFailedMoves: Record<string, string>; // FEN -> bad move SAN that resulted in loss, avoid repeating
  lastPlayedOpening?: string;
  adaptationStyle: 'aggressive' | 'solid' | 'tactical_trapper' | 'prophylactic';
}

const BOT_MEMORY_STORAGE_KEY = 'tempo_bot_memory_v2';

export class BotAdaptiveMemory {
  /**
   * Retrieves memory profile for a specific bot or initializes fresh memory
   */
  public static getBotMemory(botId: string): BotMemoryRecord {
    try {
      const raw = localStorage.getItem(BOT_MEMORY_STORAGE_KEY);
      if (raw) {
        const allMemory: Record<string, BotMemoryRecord> = JSON.parse(raw);
        if (allMemory[botId]) {
          return allMemory[botId];
        }
      }
    } catch (e) {
      console.warn('Failed to parse bot memory:', e);
    }

    return {
      botId,
      totalGamesVsUser: 0,
      winsVsUser: 0,
      lossesVsUser: 0,
      drawsVsUser: 0,
      userPreferredOpenings: {},
      userWeaknessesObserved: {},
      botFailedMoves: {},
      adaptationStyle: 'solid'
    };
  }

  /**
   * Persists updated memory record
   */
  public static saveBotMemory(memory: BotMemoryRecord): void {
    try {
      const raw = localStorage.getItem(BOT_MEMORY_STORAGE_KEY);
      const allMemory: Record<string, BotMemoryRecord> = raw ? JSON.parse(raw) : {};
      allMemory[memory.botId] = memory;
      localStorage.setItem(BOT_MEMORY_STORAGE_KEY, JSON.stringify(allMemory));
    } catch (e) {
      console.warn('Failed to save bot memory:', e);
    }
  }

  /**
   * Updates bot memory at the end of a game:
   * - Records outcome
   * - Saves user opening pattern
   * - Notes any player structural weaknesses
   * - Logs failed moves if bot lost
   */
  public static recordGameConclusion(
    botId: string,
    result: 'win' | 'loss' | 'draw' | 'abandoned', // from player perspective
    openingName?: string,
    moveHistory?: ChessMove[],
    playerModel?: PlayerModel
  ): void {
    const memory = this.getBotMemory(botId);
    memory.totalGamesVsUser += 1;

    if (result === 'win') {
      memory.lossesVsUser += 1; // Bot lost
    } else if (result === 'loss') {
      memory.winsVsUser += 1; // Bot won
    } else if (result === 'draw') {
      memory.drawsVsUser += 1;
    }

    if (openingName) {
      memory.userPreferredOpenings[openingName] = (memory.userPreferredOpenings[openingName] || 0) + 1;
      memory.lastPlayedOpening = openingName;
    }

    // Identify user weaknesses to exploit in future matches
    if (playerModel) {
      if (playerModel.skills.king_safety.score < 55) {
        memory.userWeaknessesObserved['king_safety'] = (memory.userWeaknessesObserved['king_safety'] || 0) + 1;
      }
      if (playerModel.skills.tactics.score < 55) {
        memory.userWeaknessesObserved['tactical_pins'] = (memory.userWeaknessesObserved['tactical_pins'] || 0) + 1;
      }
      if (playerModel.skills.endgames.score < 55) {
        memory.userWeaknessesObserved['endgame_grind'] = (memory.userWeaknessesObserved['endgame_grind'] || 0) + 1;
      }
    }

    // If bot lost, record the critical blunder fen/move so bot doesn't repeat it
    if (result === 'win' && moveHistory && moveHistory.length >= 4) {
      const botMoves = moveHistory.filter(m => m.color !== (moveHistory[0].color === 'w' ? 'w' : 'b'));
      const blunder = botMoves.find(m => m.classification === 'blunder' || m.classification === 'mistake');
      if (blunder && blunder.fenAfter) {
        memory.botFailedMoves[blunder.fenAfter] = blunder.san;
      }
    }

    // Dynamic adaptation style selection based on learning
    if ((memory.userWeaknessesObserved['king_safety'] || 0) >= 2) {
      memory.adaptationStyle = 'aggressive';
    } else if ((memory.userWeaknessesObserved['tactical_pins'] || 0) >= 2) {
      memory.adaptationStyle = 'tactical_trapper';
    } else if ((memory.userWeaknessesObserved['endgame_grind'] || 0) >= 2) {
      memory.adaptationStyle = 'prophylactic';
    } else {
      memory.adaptationStyle = 'solid';
    }

    this.saveBotMemory(memory);
  }

  /**
   * Selects an adaptive, non-repetitive opening candidate move from the book
   */
  public static selectAdaptiveBookMove(
    fen: string,
    bot: BotProfile,
    bookMoves: string[]
  ): string | null {
    if (!bookMoves || bookMoves.length === 0) return null;

    const memory = this.getBotMemory(bot.id);

    // Filter out moves that previously caused the bot to blunder in this exact position
    const safeMoves = bookMoves.filter(san => memory.botFailedMoves[fen] !== san);
    const candidatePool = safeMoves.length > 0 ? safeMoves : bookMoves;

    if (candidatePool.length === 1) return candidatePool[0];

    // Vary opening choices dynamically using weighted selection
    // Higher rated bots prefer theoretical mainlines; creative bots explore sidelines
    const roll = Math.random();
    if (bot.rating >= 1600 && roll < 0.7) {
      return candidatePool[0]; // Mainline
    } else {
      // Pick random variation from candidate pool
      return candidatePool[Math.floor(Math.random() * candidatePool.length)];
    }
  }

  /**
   * Dynamic human-like thinking delay based on position complexity
   */
  public static calculateHumanThinkingDelay(
    isOpeningBook: boolean,
    isCapture: boolean,
    isCheck: boolean,
    legalMovesCount: number,
    botRating: number
  ): number {
    // 1. Instant/Fast in opening book or simple recaptures
    if (isOpeningBook) {
      return Math.floor(180 + Math.random() * 240); // 180ms - 420ms
    }

    if (isCapture && legalMovesCount <= 3) {
      return Math.floor(250 + Math.random() * 300); // 250ms - 550ms
    }

    // 2. Complex middlegame calculations
    const baseDelay = botRating >= 1600 ? 600 : 400;
    const complexityFactor = Math.min(600, legalMovesCount * 18);
    const tensionDelay = isCheck ? 250 : 0;
    const jitter = (Math.random() - 0.5) * 200;

    return Math.max(350, Math.floor(baseDelay + complexityFactor + tensionDelay + jitter));
  }
}

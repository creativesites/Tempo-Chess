import { ChessMove, Color } from '@tempo/shared';

import { getDb } from './db';

export interface SavedGameRow {
  id: string;
  pgn: string;
  fen: string;
  result: 'win' | 'loss' | 'draw';
  playerColor: Color;
  playerName: string;
  opponentBotId: string;
  opponentName: string;
  opponentRating: number;
  openingName: string | null;
  movesCount: number;
  playerAccuracyPercent: number;
  blunderCount: number;
  mistakeCount: number;
  dateIso: string;
  timestamp: number;
}

export interface SaveGameInput extends Omit<SavedGameRow, 'movesCount'> {
  moveHistory: ChessMove[];
}

export async function saveGame(input: SaveGameInput): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO games (
        id, pgn, fen, result, player_color, player_name, opponent_bot_id, opponent_name,
        opponent_rating, opening_name, moves_count, player_accuracy_percent, blunder_count,
        mistake_count, date_iso, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.pgn,
        input.fen,
        input.result,
        input.playerColor,
        input.playerName,
        input.opponentBotId,
        input.opponentName,
        input.opponentRating,
        input.openingName,
        input.moveHistory.length,
        input.playerAccuracyPercent,
        input.blunderCount,
        input.mistakeCount,
        input.dateIso,
        input.timestamp,
      ]
    );

    for (let i = 0; i < input.moveHistory.length; i++) {
      const m = input.moveHistory[i];
      await db.runAsync(
        `INSERT INTO moves (
          game_id, move_index, color, piece, from_square, to_square, san, lan, captured,
          promotion, is_check, is_checkmate, fen_after, eval_before, eval_after, classification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.id,
          i,
          m.color,
          m.piece,
          m.from,
          m.to,
          m.san,
          m.lan,
          m.captured ?? null,
          m.promotion ?? null,
          m.isCheck ? 1 : 0,
          m.isCheckmate ? 1 : 0,
          m.fenAfter,
          m.evalBefore ?? null,
          m.evalAfter ?? null,
          m.classification ?? null,
        ]
      );
    }
  });
}

interface GameRow {
  id: string;
  pgn: string;
  fen: string;
  result: 'win' | 'loss' | 'draw';
  player_color: Color;
  player_name: string;
  opponent_bot_id: string;
  opponent_name: string;
  opponent_rating: number;
  opening_name: string | null;
  moves_count: number;
  player_accuracy_percent: number;
  blunder_count: number;
  mistake_count: number;
  date_iso: string;
  timestamp: number;
}

function rowToGame(row: GameRow): SavedGameRow {
  return {
    id: row.id,
    pgn: row.pgn,
    fen: row.fen,
    result: row.result,
    playerColor: row.player_color,
    playerName: row.player_name,
    opponentBotId: row.opponent_bot_id,
    opponentName: row.opponent_name,
    opponentRating: row.opponent_rating,
    openingName: row.opening_name,
    movesCount: row.moves_count,
    playerAccuracyPercent: row.player_accuracy_percent,
    blunderCount: row.blunder_count,
    mistakeCount: row.mistake_count,
    dateIso: row.date_iso,
    timestamp: row.timestamp,
  };
}

export async function getRecentGames(limit = 50): Promise<SavedGameRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<GameRow>('SELECT * FROM games ORDER BY timestamp DESC LIMIT ?', [limit]);
  return rows.map(rowToGame);
}

export async function getGameMoves(gameId: string): Promise<ChessMove[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    color: Color;
    piece: string;
    from_square: string;
    to_square: string;
    san: string;
    lan: string;
    captured: string | null;
    promotion: string | null;
    is_check: number;
    is_checkmate: number;
    fen_after: string;
    eval_before: number | null;
    eval_after: number | null;
    classification: string | null;
  }>('SELECT * FROM moves WHERE game_id = ? ORDER BY move_index ASC', [gameId]);

  return rows.map((r) => ({
    color: r.color,
    piece: r.piece as ChessMove['piece'],
    from: r.from_square as ChessMove['from'],
    to: r.to_square as ChessMove['to'],
    san: r.san,
    lan: r.lan,
    captured: (r.captured as ChessMove['captured']) ?? undefined,
    promotion: (r.promotion as ChessMove['promotion']) ?? undefined,
    isCheck: !!r.is_check,
    isCheckmate: !!r.is_checkmate,
    fenAfter: r.fen_after,
    evalBefore: r.eval_before ?? undefined,
    evalAfter: r.eval_after ?? undefined,
    classification: (r.classification as ChessMove['classification']) ?? undefined,
  }));
}

export async function deleteGame(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM games WHERE id = ?', [id]);
}

export interface AggregateStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
}

export async function getAggregateStats(): Promise<AggregateStats> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number; wins: number; losses: number; draws: number }>(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
      SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws
    FROM games`
  );
  return {
    totalGames: row?.total ?? 0,
    wins: row?.wins ?? 0,
    losses: row?.losses ?? 0,
    draws: row?.draws ?? 0,
  };
}

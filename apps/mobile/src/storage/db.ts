import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'tempo.db';

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  pgn TEXT NOT NULL,
  fen TEXT NOT NULL,
  result TEXT NOT NULL,
  player_color TEXT NOT NULL,
  player_name TEXT NOT NULL,
  opponent_bot_id TEXT NOT NULL,
  opponent_name TEXT NOT NULL,
  opponent_rating INTEGER NOT NULL,
  opening_name TEXT,
  moves_count INTEGER NOT NULL,
  player_accuracy_percent INTEGER NOT NULL,
  blunder_count INTEGER NOT NULL,
  mistake_count INTEGER NOT NULL,
  date_iso TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_games_timestamp ON games(timestamp DESC);

CREATE TABLE IF NOT EXISTS moves (
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_index INTEGER NOT NULL,
  color TEXT NOT NULL,
  piece TEXT NOT NULL,
  from_square TEXT NOT NULL,
  to_square TEXT NOT NULL,
  san TEXT NOT NULL,
  lan TEXT NOT NULL,
  captured TEXT,
  promotion TEXT,
  is_check INTEGER NOT NULL,
  is_checkmate INTEGER NOT NULL,
  fen_after TEXT NOT NULL,
  eval_before REAL,
  eval_after REAL,
  classification TEXT,
  PRIMARY KEY (game_id, move_index)
);

CREATE TABLE IF NOT EXISTS player_model (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens (once) and migrates the on-device SQLite database. Real,
 * persistent, offline storage — expo-sqlite on native uses the platform
 * SQLite, and on web a bundled wa-sqlite WASM build backed by OPFS, so
 * this works identically (and durably) in both `expo start --web` and a
 * real device build.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(SCHEMA);
      return db;
    });
  }
  return dbPromise;
}

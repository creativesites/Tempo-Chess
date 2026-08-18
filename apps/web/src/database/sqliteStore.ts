import initSqlJs, { Database } from 'sql.js';
import { SavedGameRecord, GameReview, Color } from '../types';
import { PgnUtils } from '@tempo/chess';

const SQLITE_STORAGE_KEY = 'tempo_sqlite_game_history_bin_v1';
const SQLITE_BACKUP_JSON_KEY = 'tempo_game_history_records_v1';

export class SQLiteGameHistoryStore {
  private static db: Database | null = null;
  private static isInitializing = false;
  private static initPromise: Promise<Database> | null = null;

  /**
   * Initializes the SQLite WebAssembly database engine and migrates tables
   */
  public static async getDatabase(): Promise<Database> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
        });

        // Try to restore saved binary database from localStorage
        const savedBinaryStr = localStorage.getItem(SQLITE_STORAGE_KEY);
        if (savedBinaryStr) {
          try {
            const binary = Uint8Array.from(atob(savedBinaryStr), c => c.charCodeAt(0));
            this.db = new SQL.Database(binary);
          } catch (e) {
            console.warn('Failed to load saved SQLite binary, creating fresh DB', e);
            this.db = new SQL.Database();
          }
        } else {
          this.db = new SQL.Database();
        }

        // Initialize schema
        this.initializeSchema(this.db);

        // Seed with existing or sample data if newly created
        this.seedInitialDataIfEmpty(this.db);

        return this.db;
      } catch (err) {
        console.error('Failed to initialize SQLite WASM, using in-memory fallback', err);
        const SQL = await initSqlJs();
        this.db = new SQL.Database();
        this.initializeSchema(this.db);
        return this.db;
      }
    })();

    return this.initPromise;
  }

  /**
   * Migrates SQLite tables & indexes
   */
  private static initializeSchema(db: Database) {
    db.run(`
      CREATE TABLE IF NOT EXISTS game_history (
        id TEXT PRIMARY KEY,
        pgn TEXT NOT NULL,
        fen TEXT NOT NULL,
        result TEXT NOT NULL,
        player_color TEXT NOT NULL,
        player_name TEXT NOT NULL,
        opponent_name TEXT NOT NULL,
        opening_name TEXT,
        headline TEXT,
        accuracy_white REAL,
        accuracy_black REAL,
        date_iso TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        moves_count INTEGER NOT NULL,
        review_json TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_game_history_timestamp ON game_history(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_game_history_result ON game_history(result);
      CREATE INDEX IF NOT EXISTS idx_game_history_opening ON game_history(opening_name);
    `);
  }

  /**
   * Persists binary SQLite snapshot to localStorage
   */
  private static persistDatabase(db: Database) {
    try {
      const data = db.export();
      let binary = '';
      const len = data.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64 = btoa(binary);
      localStorage.setItem(SQLITE_STORAGE_KEY, base64);
    } catch (e) {
      console.error('Error persisting SQLite database snapshot to localStorage', e);
    }
  }

  /**
   * Seeds initial realistic sample games if SQLite table is empty
   */
  private static seedInitialDataIfEmpty(db: Database) {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM game_history');
      let count = 0;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        count = Number(row.count || 0);
      }
      stmt.free();

      if (count === 0) {
        // Seed default sample games with rich PGNs
        const sampleGames: SavedGameRecord[] = [
          {
            id: 'game-sample-1',
            pgn: `[Event "Tempo AI Match"]\n[Site "Tempo Learn Chess Offline"]\n[Date "2026.08.17"]\n[Round "1"]\n[White "Winston"]\n[Black "Tempo AI (Adaptive)"]\n[Result "1-0"]\n[ECO "C50"]\n[Opening "Italian Game: Giuoco Piano"]\n[WhiteAccuracy "86.4%"]\n[BlackAccuracy "79.1%"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Nce7 11. O-O O-O 12. Rfe1 c6 13. a4 Qb6 14. Qa3 Be6 15. a5 Qc7 16. Ne4 Rad8 17. Nc5 Bc8 18. Rac1 Nf4 19. Qb3 Ned5 20. g3 Nh3+ 21. Kg2 Qxa5 22. Nxb7 Bxb7 23. Qxb7 Ndf4+ 24. gxf4 Nxf4+ 25. Kh1 Qh5 26. Qxc6 Nh3 27. Re5 Nxf2+ 28. Kg2 Qh3+ 29. Kxf2 1-0`,
            fen: '5rk1/p4ppp/2Q5/4R3/2BP4/5N1q/1P3K1P/2R5 b - - 0 29',
            result: 'win',
            playerColor: 'w',
            playerName: 'Winston',
            opponentName: 'Tempo AI',
            openingName: 'Italian Game: Giuoco Piano',
            headline: 'Brilliant Central Attack in the Italian Game',
            accuracyWhite: 86.4,
            accuracyBlack: 79.1,
            dateIso: new Date().toISOString(),
            timestamp: Date.now() - 3600000 * 2,
            movesCount: 29
          },
          {
            id: 'game-sample-2',
            pgn: `[Event "Tempo AI Match"]\n[Site "Tempo Learn Chess Offline"]\n[Date "2026.08.16"]\n[Round "1"]\n[White "Tempo AI (Adaptive)"]\n[Black "Winston"]\n[Result "1-0"]\n[ECO "B22"]\n[Opening "Sicilian Defense: Alapin Variation"]\n[WhiteAccuracy "88.0%"]\n[BlackAccuracy "71.5%"]\n\n1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 Nf6 5. Nf3 e6 6. Be2 Nc6 7. O-O cxd4 8. cxd4 Be7 9. Nc3 Qd8 10. Bf4 O-O 11. Rc1 Nd5 12. Nxd5 Qxd5 13. Bc4 Qf5 14. Bg3 Rd8 15. Bd3 Qh5 16. Be4 Bd7 17. Qb3 Na5 18. Qe3 Rac8 19. Bc7 Re8 20. Ne5 Bb5 21. Bxa5 Bxf1 22. Rxf1 b6 23. Bc3 1-0`,
            fen: '4r1k1/p3bppp/1p2p3/4N2q/3PB3/2B1Q3/PP3PPP/5RK1 b - - 0 23',
            result: 'loss',
            playerColor: 'b',
            playerName: 'Winston',
            opponentName: 'Tempo AI',
            openingName: 'Sicilian Defense: Alapin Variation',
            headline: 'Overextended Queenside Piece Activity',
            accuracyWhite: 88.0,
            accuracyBlack: 71.5,
            dateIso: new Date(Date.now() - 86400000).toISOString(),
            timestamp: Date.now() - 86400000,
            movesCount: 23
          }
        ];

        sampleGames.forEach(g => {
          this.insertGameDirect(db, g);
        });

        this.persistDatabase(db);
      }
    } catch (err) {
      console.warn('Could not check/seed sample games', err);
    }
  }

  private static insertGameDirect(db: Database, record: SavedGameRecord) {
    db.run(
      `INSERT OR REPLACE INTO game_history (
        id, pgn, fen, result, player_color, player_name, opponent_name,
        opening_name, headline, accuracy_white, accuracy_black, date_iso,
        timestamp, moves_count, review_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.pgn,
        record.fen,
        record.result,
        record.playerColor,
        record.playerName,
        record.opponentName,
        record.openingName || 'Standard Chess Game',
        record.headline || 'Completed Game',
        record.accuracyWhite,
        record.accuracyBlack,
        record.dateIso,
        record.timestamp,
        record.movesCount,
        record.review ? JSON.stringify(record.review) : null
      ]
    );
  }

  /**
   * Saves a completed game and PGN into the SQLite store
   */
  public static async saveGame(record: SavedGameRecord): Promise<void> {
    const db = await this.getDatabase();
    this.insertGameDirect(db, record);
    this.persistDatabase(db);

    // Keep JSON cache in sync
    try {
      const records = this.getRecordsFromLocalStorage();
      const filtered = records.filter(r => r.id !== record.id);
      filtered.unshift(record);
      localStorage.setItem(SQLITE_BACKUP_JSON_KEY, JSON.stringify(filtered.slice(0, 100)));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Retrieves all saved game records from SQLite, ordered by most recent first
   */
  public static async getAllGames(limit = 100, offset = 0): Promise<SavedGameRecord[]> {
    try {
      const db = await this.getDatabase();
      const stmt = db.prepare(`
        SELECT id, pgn, fen, result, player_color, player_name, opponent_name,
               opening_name, headline, accuracy_white, accuracy_black, date_iso,
               timestamp, moves_count, review_json
        FROM game_history
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);

      stmt.bind([limit, offset]);
      const results: SavedGameRecord[] = [];

      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          id: String(row.id),
          pgn: String(row.pgn),
          fen: String(row.fen),
          result: (row.result as 'win' | 'loss' | 'draw' | 'abandoned') || 'win',
          playerColor: (row.player_color as Color) || 'w',
          playerName: String(row.player_name),
          opponentName: String(row.opponent_name),
          openingName: String(row.opening_name || ''),
          headline: String(row.headline || ''),
          accuracyWhite: Number(row.accuracy_white || 0),
          accuracyBlack: Number(row.accuracy_black || 0),
          dateIso: String(row.date_iso),
          timestamp: Number(row.timestamp || Date.now()),
          movesCount: Number(row.moves_count || 0),
          review: row.review_json ? JSON.parse(String(row.review_json)) : undefined
        });
      }

      stmt.free();
      return results;
    } catch (err) {
      console.error('Error querying SQLite games, returning local backup', err);
      return this.getRecordsFromLocalStorage();
    }
  }

  /**
   * Retrieves a single game record by ID from SQLite
   */
  public static async getGameById(id: string): Promise<SavedGameRecord | null> {
    try {
      const db = await this.getDatabase();
      const stmt = db.prepare(`
        SELECT id, pgn, fen, result, player_color, player_name, opponent_name,
               opening_name, headline, accuracy_white, accuracy_black, date_iso,
               timestamp, moves_count, review_json
        FROM game_history
        WHERE id = ?
      `);

      stmt.bind([id]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return {
          id: String(row.id),
          pgn: String(row.pgn),
          fen: String(row.fen),
          result: (row.result as 'win' | 'loss' | 'draw' | 'abandoned') || 'win',
          playerColor: (row.player_color as Color) || 'w',
          playerName: String(row.player_name),
          opponentName: String(row.opponent_name),
          openingName: String(row.opening_name || ''),
          headline: String(row.headline || ''),
          accuracyWhite: Number(row.accuracy_white || 0),
          accuracyBlack: Number(row.accuracy_black || 0),
          dateIso: String(row.date_iso),
          timestamp: Number(row.timestamp || Date.now()),
          movesCount: Number(row.moves_count || 0),
          review: row.review_json ? JSON.parse(String(row.review_json)) : undefined
        };
      }
      stmt.free();
      return null;
    } catch (err) {
      console.error('Error fetching game by ID from SQLite', err);
      const records = this.getRecordsFromLocalStorage();
      return records.find(r => r.id === id) || null;
    }
  }

  /**
   * Deletes a game record by ID from SQLite
   */
  public static async deleteGame(id: string): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      db.run('DELETE FROM game_history WHERE id = ?', [id]);
      this.persistDatabase(db);

      const records = this.getRecordsFromLocalStorage().filter(r => r.id !== id);
      localStorage.setItem(SQLITE_BACKUP_JSON_KEY, JSON.stringify(records));
      return true;
    } catch (err) {
      console.error('Failed to delete game from SQLite', err);
      return false;
    }
  }

  /**
   * Search games by opening name or headline
   */
  public static async searchGames(query: string): Promise<SavedGameRecord[]> {
    try {
      const db = await this.getDatabase();
      const stmt = db.prepare(`
        SELECT id, pgn, fen, result, player_color, player_name, opponent_name,
               opening_name, headline, accuracy_white, accuracy_black, date_iso,
               timestamp, moves_count, review_json
        FROM game_history
        WHERE opening_name LIKE ? OR headline LIKE ? OR pgn LIKE ?
        ORDER BY timestamp DESC
      `);

      const wildcard = `%${query}%`;
      stmt.bind([wildcard, wildcard, wildcard]);
      const results: SavedGameRecord[] = [];

      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          id: String(row.id),
          pgn: String(row.pgn),
          fen: String(row.fen),
          result: (row.result as 'win' | 'loss' | 'draw' | 'abandoned') || 'win',
          playerColor: (row.player_color as Color) || 'w',
          playerName: String(row.player_name),
          opponentName: String(row.opponent_name),
          openingName: String(row.opening_name || ''),
          headline: String(row.headline || ''),
          accuracyWhite: Number(row.accuracy_white || 0),
          accuracyBlack: Number(row.accuracy_black || 0),
          dateIso: String(row.date_iso),
          timestamp: Number(row.timestamp || Date.now()),
          movesCount: Number(row.moves_count || 0),
          review: row.review_json ? JSON.parse(String(row.review_json)) : undefined
        });
      }

      stmt.free();
      return results;
    } catch (err) {
      console.error('Error searching games in SQLite', err);
      return [];
    }
  }

  /**
   * Exports all completed games in SQLite into a single composite PGN file string
   */
  public static async exportAllPgns(): Promise<string> {
    const games = await this.getAllGames();
    return games.map(g => g.pgn).join('\n\n\n');
  }

  /**
   * Imports a raw PGN string into SQLite
   */
  public static async importPgn(pgnString: string): Promise<SavedGameRecord> {
    const parsed = PgnUtils.parsePgn(pgnString);
    const headers = parsed.headers;

    const resultRaw = headers['Result'] || '*';
    let result: 'win' | 'loss' | 'draw' | 'abandoned' = 'win';
    if (resultRaw === '1-0') result = 'win';
    else if (resultRaw === '0-1') result = 'loss';
    else if (resultRaw === '1/2-1/2') result = 'draw';

    const record: SavedGameRecord = {
      id: `imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pgn: pgnString.trim(),
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      result,
      playerColor: 'w',
      playerName: headers['White'] || 'Player',
      opponentName: headers['Black'] || 'Tempo AI',
      openingName: headers['Opening'] || headers['Event'] || 'Imported PGN Game',
      headline: `Imported Game (${parsed.movesSan.length} moves)`,
      accuracyWhite: parseFloat(headers['WhiteAccuracy'] || '80'),
      accuracyBlack: parseFloat(headers['BlackAccuracy'] || '80'),
      dateIso: new Date().toISOString(),
      timestamp: Date.now(),
      movesCount: parsed.movesSan.length
    };

    await this.saveGame(record);
    return record;
  }

  /**
   * Retrieves summary statistics computed directly using SQL aggregate functions
   */
  public static async getAggregateStats(): Promise<{
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    avgAccuracy: number;
  }> {
    try {
      const db = await this.getDatabase();
      const stmt = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) as losses,
          SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws,
          AVG(accuracy_white) as avg_acc
        FROM game_history
      `);

      let total = 0;
      let wins = 0;
      let losses = 0;
      let draws = 0;
      let avgAccuracy = 0;

      if (stmt.step()) {
        const row = stmt.getAsObject();
        total = Number(row.total || 0);
        wins = Number(row.wins || 0);
        losses = Number(row.losses || 0);
        draws = Number(row.draws || 0);
        avgAccuracy = Math.round(Number(row.avg_acc || 0) * 10) / 10;
      }
      stmt.free();

      return { totalGames: total, wins, losses, draws, avgAccuracy };
    } catch (err) {
      console.error('Error fetching SQLite stats', err);
      return { totalGames: 0, wins: 0, losses: 0, draws: 0, avgAccuracy: 0 };
    }
  }

  /**
   * Synchronous local storage fallback reader
   */
  private static getRecordsFromLocalStorage(): SavedGameRecord[] {
    try {
      const data = localStorage.getItem(SQLITE_BACKUP_JSON_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return [];
  }
}

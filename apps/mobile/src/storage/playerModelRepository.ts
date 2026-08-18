import { createEmptyPlayerModel, PlayerModel } from '@tempo/player-model';

import { getDb } from './db';

export async function getPlayerModel(playerName: string): Promise<PlayerModel> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM player_model WHERE id = 1');
  if (!row) {
    return createEmptyPlayerModel(playerName);
  }
  try {
    return JSON.parse(row.data) as PlayerModel;
  } catch (e) {
    console.error('Corrupt player_model row, resetting to empty', e);
    return createEmptyPlayerModel(playerName);
  }
}

export async function savePlayerModel(model: PlayerModel): Promise<void> {
  const db = await getDb();
  const data = JSON.stringify(model);
  await db.runAsync('INSERT INTO player_model (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data', [
    data,
  ]);
}

/**
 * Applies only the objective, directly-computable effects of a finished
 * game — games played, win/loss/draw tally, a plain rating delta, and
 * the activity timestamp. Deliberately does NOT touch skills,
 * tendencies, or masteredConcepts: those require real evidence
 * aggregated across multiple games (the learning-loop work in a later
 * phase), and inventing them from one game's result would be exactly
 * the kind of fabricated insight this product explicitly avoids.
 */
export async function recordGameResult(
  playerName: string,
  result: 'win' | 'loss' | 'draw'
): Promise<PlayerModel> {
  const current = await getPlayerModel(playerName);
  const ratingDelta = result === 'win' ? 12 : result === 'loss' ? -8 : 2;

  const updated: PlayerModel = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    wins: current.wins + (result === 'win' ? 1 : 0),
    losses: current.losses + (result === 'loss' ? 1 : 0),
    draws: current.draws + (result === 'draw' ? 1 : 0),
    ratingEstimate: Math.max(400, current.ratingEstimate + ratingDelta),
    lastActiveTimestamp: Date.now(),
  };

  await savePlayerModel(updated);
  return updated;
}

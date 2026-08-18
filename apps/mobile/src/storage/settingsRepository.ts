import { getDb } from './db';

export const SettingsKeys = {
  SELECTED_BOT_ID: 'selected_bot_id',
  BOARD_THEME: 'board_theme',
  PLAYER_NAME: 'player_name',
} as const;

export type SettingsKey = (typeof SettingsKeys)[keyof typeof SettingsKeys];

export async function getSetting(key: SettingsKey): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setSetting(key: SettingsKey, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    key,
    value,
  ]);
}

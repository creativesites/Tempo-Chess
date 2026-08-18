// This file is a compatibility barrel for the web prototype only.
// The actual domain types now live in packages/* (the reusable product
// logic shared with apps/mobile) — see packages/shared, packages/chess,
// packages/openings, packages/coaching, packages/player-model,
// packages/game-review, packages/training. Re-exporting them here means
// the (many) existing web components that still `import { X } from
// '../types'` keep working without a mechanical rewrite of every file.
//
// Only UI-presentation types that have no home outside this web
// prototype (board/UI theme config) are still defined directly below.

export * from '@tempo/shared';
export * from '@tempo/chess';
export * from '@tempo/openings';
export * from '@tempo/coaching';
export * from '@tempo/player-model';
export * from '@tempo/game-review';
export * from '@tempo/training';

export type UIThemeMode = 'minimal_light' | 'warm_editorial' | 'nordic_crisp' | 'swiss_monochrome' | 'dark_slate';

export type BoardTheme = 'minimal_light' | 'emerald_modern' | 'classic_wood' | 'nordic_slate' | 'swiss_clean' | 'minimalist_charcoal';

export interface UIThemeConfig {
  id: UIThemeMode;
  name: string;
  subtitle: string;
  category: 'light' | 'dark';
  description: string;
  previewBg: string;
  previewCard: string;
  previewBorder: string;
  previewAccent: string;
  previewText: string;
  recommendedBoard: BoardTheme;
  tags: string[];
}

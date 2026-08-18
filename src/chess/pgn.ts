import { ChessMove, Color, GameReview } from '../types';

export interface PgnMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  eco?: string;
  opening?: string;
  whiteElo?: string;
  blackElo?: string;
  accuracyWhite?: string;
  accuracyBlack?: string;
}

export class PgnUtils {
  /**
   * Generates standard PGN format string from move history and metadata
   */
  public static generatePgn(
    moves: ChessMove[],
    metadata: PgnMetadata,
    result: 'win' | 'loss' | 'draw' | 'abandoned' = 'win',
    playerColor: Color = 'w'
  ): string {
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    let resultStr = '*';
    if (result === 'win') {
      resultStr = playerColor === 'w' ? '1-0' : '0-1';
    } else if (result === 'loss') {
      resultStr = playerColor === 'w' ? '0-1' : '1-0';
    } else if (result === 'draw') {
      resultStr = '1/2-1/2';
    }

    const headers: Record<string, string> = {
      Event: metadata.event || 'Tempo AI Training Match',
      Site: metadata.site || 'Tempo Learn Chess (Offline)',
      Date: metadata.date || dateFormatted,
      Round: metadata.round || '1',
      White: metadata.white || (playerColor === 'w' ? 'Player' : 'Tempo AI (Adaptive)'),
      Black: metadata.black || (playerColor === 'b' ? 'Player' : 'Tempo AI (Adaptive)'),
      Result: resultStr,
      ...(metadata.eco ? { ECO: metadata.eco } : {}),
      ...(metadata.opening ? { Opening: metadata.opening } : {}),
      ...(metadata.whiteElo ? { WhiteElo: metadata.whiteElo } : {}),
      ...(metadata.blackElo ? { BlackElo: metadata.blackElo } : {}),
      ...(metadata.accuracyWhite ? { WhiteAccuracy: metadata.accuracyWhite } : {}),
      ...(metadata.accuracyBlack ? { BlackAccuracy: metadata.accuracyBlack } : {})
    };

    // Format headers
    const headerLines = Object.entries(headers)
      .map(([key, val]) => `[${key} "${val}"]`)
      .join('\n');

    // Format moves
    let moveText = '';
    for (let i = 0; i < moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = moves[i]?.san || '';
      const blackMove = moves[i + 1]?.san || '';
      moveText += `${moveNum}. ${whiteMove}${blackMove ? ' ' + blackMove : ''} `;
    }

    moveText += resultStr;

    return `${headerLines}\n\n${moveText.trim()}`;
  }

  /**
   * Parses basic PGN tags and moves
   */
  public static parsePgn(pgnString: string): { headers: Record<string, string>; moveString: string; movesSan: string[] } {
    const headers: Record<string, string> = {};
    const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
    let match;

    while ((match = headerRegex.exec(pgnString)) !== null) {
      headers[match[1]] = match[2];
    }

    // Remove headers to get the body
    const body = pgnString.replace(/\[[^\]]*\]/g, '').trim();

    // Extract SAN moves (filter out move numbers like "1.", "2.", evaluation annotations, and result strings)
    const tokens = body.split(/\s+/).filter(t => t.length > 0);
    const movesSan: string[] = [];

    for (const token of tokens) {
      // Skip move numbers (e.g. "1.", "2...", "12.")
      if (/^\d+\.+$/.test(token)) continue;
      // Skip result tokens
      if (['1-0', '0-1', '1/2-1/2', '*'].includes(token)) continue;
      // Skip comment brackets
      if (token.startsWith('{') || token.endsWith('}')) continue;

      movesSan.push(token);
    }

    return {
      headers,
      moveString: body,
      movesSan
    };
  }
}

import React from 'react';
import { Color, Square, ChessMove, OpeningContext } from '../../types';
import { Chess, Square as ChessJsSquare } from 'chess.js';
import { useTheme } from '../../context/ThemeContext';
import { Compass, BookOpen, Swords, Crown, CheckCircle2, Circle, AlertCircle, Shield } from 'lucide-react';

export type GameStage = 'opening' | 'middlegame' | 'endgame';

interface CoachStageBannerProps {
  stage: GameStage;
  moveCount: number;
  opening?: OpeningContext;
  playerColor: Color;
  fen: string;
  moveHistory: ChessMove[];
}

export const CoachStageBanner: React.FC<CoachStageBannerProps> = ({
  stage,
  moveCount,
  opening,
  playerColor,
  fen,
  moveHistory
}) => {
  const { tokens } = useTheme();

  // Evaluate opening development checklist
  const chess = React.useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const board = chess.board();

  // 1. Center pawns check
  const playerCenterPawns = React.useMemo(() => {
    let count = 0;
    const centerFiles = [3, 4]; // d, e
    for (let r = 0; r < 8; r++) {
      for (const c of centerFiles) {
        const p = board[r][c];
        if (p && p.type === 'p' && p.color === playerColor) {
          if (playerColor === 'w' && r <= 4) count++;
          if (playerColor === 'b' && r >= 3) count++;
        }
      }
    }
    return count >= 1;
  }, [board, playerColor]);

  // 2. Minor pieces developed check
  const minorPiecesDeveloped = React.useMemo(() => {
    let developed = 0;
    const backRank = playerColor === 'w' ? 7 : 0;
    // Check if knights and bishops left starting squares
    const startingKnights = playerColor === 'w' ? ['b1', 'g1'] : ['b8', 'g8'];
    const startingBishops = playerColor === 'w' ? ['c1', 'f1'] : ['c8', 'f8'];

    [...startingKnights, ...startingBishops].forEach(sq => {
      const p = chess.get(sq as ChessJsSquare);
      if (!p || p.color !== playerColor) {
        developed++;
      }
    });

    return developed >= 2;
  }, [chess, playerColor]);

  // 3. King Castled check
  const isKingCastled = React.useMemo(() => {
    return moveHistory.some(m => m.color === playerColor && (m.san.includes('O-O') || m.san.includes('0-0')));
  }, [moveHistory, playerColor]);

  // Count Passed Pawns for Endgame
  const passedPawnsCount = React.useMemo(() => {
    if (stage !== 'endgame') return 0;
    let passed = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'p' && p.color === playerColor) {
          // Check if opposing pawns block or attack
          let isPassed = true;
          const oppRanks = playerColor === 'w' ? [0, 1, 2, 3, 4, 5, 6].filter(row => row < r) : [1, 2, 3, 4, 5, 6, 7].filter(row => row > r);
          for (const oppR of oppRanks) {
            for (let oppC = Math.max(0, c - 1); oppC <= Math.min(7, c + 1); oppC++) {
              const oppP = board[oppR][oppC];
              if (oppP && oppP.type === 'p' && oppP.color !== playerColor) {
                isPassed = false;
                break;
              }
            }
            if (!isPassed) break;
          }
          if (isPassed) passed++;
        }
      }
    }
    return passed;
  }, [board, playerColor, stage]);

  return (
    <div className={`w-full ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3 ${tokens.cardShadow} transition-all duration-200`}>
      {/* Top Header: Stage Indicator */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {stage === 'opening' && (
            <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-emerald-800 dark:text-emerald-400" />
            </div>
          )}
          {stage === 'middlegame' && (
            <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/80 border border-amber-300 flex items-center justify-center">
              <Swords className="w-3 h-3 text-amber-800 dark:text-amber-400" />
            </div>
          )}
          {stage === 'endgame' && (
            <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950/80 border border-purple-300 flex items-center justify-center">
              <Crown className="w-3 h-3 text-purple-800 dark:text-purple-400" />
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
              Stage: {stage.toUpperCase()} (Move {Math.floor(moveCount / 2) + 1})
            </span>
          </div>
        </div>

        {/* Stage Badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          stage === 'opening'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : stage === 'middlegame'
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-purple-50 text-purple-800 border border-purple-200'
        }`}>
          {stage === 'opening' ? 'Development & Control' : stage === 'middlegame' ? 'Tactics & Pawn Breaks' : 'King Activation & Promotion'}
        </span>
      </div>

      {/* Stage Specific Guiding Content */}
      <div className="mt-2.5">
        {/* 1. OPENING STAGE */}
        {stage === 'opening' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${tokens.appText}`}>
                {opening ? `${opening.name}${opening.variation ? ': ' + opening.variation : ''}` : 'Opening Phase'}
              </span>
              <span className={`text-[10px] ${tokens.appTextMuted}`}>
                {opening?.eco ? `ECO ${opening.eco}` : 'General Fundamentals'}
              </span>
            </div>

            {/* Development Checklist */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <div className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 ${
                playerCenterPawns
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {playerCenterPawns ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <span className="truncate">Center Stake</span>
              </div>

              <div className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 ${
                minorPiecesDeveloped
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {minorPiecesDeveloped ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <span className="truncate">Minors Out</span>
              </div>

              <div className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 ${
                isKingCastled
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {isKingCastled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <span className="truncate">King Castled</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. MIDDLEGAME STAGE */}
        {stage === 'middlegame' && (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold">
              <span>Strategic Focus:</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Look for Pawn Leverages</span>
            </div>
            <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed`}>
              Connect your rooks to open files, hunt for knight outposts in enemy territory, and look for central pawn breaks before starting flank attacks.
            </p>
          </div>
        )}

        {/* 3. ENDGAME STAGE */}
        {stage === 'endgame' && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className={`font-bold ${tokens.appText}`}>
                Endgame Technique Engine
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono">
                {passedPawnsCount} Passed Pawn{passedPawnsCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-950 dark:text-purple-200 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <Crown className="w-3 h-3 text-purple-600" />
                <span>Primary Rule: Activate Your King</span>
              </div>
              <p className="text-[10px] text-purple-800 dark:text-purple-300">
                In endgames, the king transitions from a protected target into a powerful attacking piece. March your king toward the center and push passed pawns.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

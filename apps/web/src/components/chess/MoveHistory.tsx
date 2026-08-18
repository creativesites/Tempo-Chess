import React, { useRef, useEffect } from 'react';
import { ChessMove, MoveClassification } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MoveHistoryProps {
  moves: ChessMove[];
  currentMoveIndex: number;
  onSelectMove?: (index: number) => void;
}

const CLASSIFICATION_DOTS: Partial<Record<MoveClassification, { color: string; label: string }>> = {
  brilliant: { color: 'bg-cyan-500', label: 'Brilliant' },
  great: { color: 'bg-indigo-500', label: 'Great' },
  best: { color: 'bg-emerald-500', label: 'Best' },
  book: { color: 'bg-amber-500', label: 'Book' },
  inaccuracy: { color: 'bg-yellow-500', label: 'Inaccuracy' },
  mistake: { color: 'bg-orange-500', label: 'Mistake' },
  blunder: { color: 'bg-red-500', label: 'Blunder' }
};

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tokens } = useTheme();

  // Auto scroll to latest move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <div className={`text-xs ${tokens.appTextMuted} italic py-1 px-2`}>
        Moves will appear here as you play...
      </div>
    );
  }

  // Pair moves into turns
  const pairs: { moveNum: number; white?: ChessMove; black?: ChessMove; wIdx: number; bIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      wIdx: i,
      bIdx: i + 1 < moves.length ? i + 1 : undefined
    });
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 ${tokens.cardBg} rounded-lg border ${tokens.cardBorder} text-xs font-mono shadow-2xs`}
    >
      {pairs.map(({ moveNum, white, black, wIdx, bIdx }) => (
        <div key={moveNum} className="flex items-center gap-1 shrink-0">
          <span className={`${tokens.appTextSubtle} font-semibold`}>{moveNum}.</span>
          
          {white && (
            <button
              type="button"
              onClick={() => onSelectMove?.(wIdx)}
              className={`px-1.5 py-0.5 rounded transition flex items-center gap-1 ${
                currentMoveIndex === wIdx
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                  : `${tokens.btnSecondaryHover} ${tokens.appText}`
              }`}
            >
              <span>{white.san}</span>
              {white.classification && CLASSIFICATION_DOTS[white.classification] && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${CLASSIFICATION_DOTS[white.classification]!.color}`}
                  title={CLASSIFICATION_DOTS[white.classification]!.label}
                />
              )}
            </button>
          )}

          {black && (
            <button
              type="button"
              onClick={() => onSelectMove?.(bIdx!)}
              className={`px-1.5 py-0.5 rounded transition flex items-center gap-1 ${
                currentMoveIndex === bIdx
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-2xs'
                  : `${tokens.btnSecondaryHover} ${tokens.appTextMuted}`
              }`}
            >
              <span>{black.san}</span>
              {black.classification && CLASSIFICATION_DOTS[black.classification] && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${CLASSIFICATION_DOTS[black.classification]!.color}`}
                  title={CLASSIFICATION_DOTS[black.classification]!.label}
                />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

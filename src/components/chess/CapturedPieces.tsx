import React from 'react';
import { PieceSymbol, Color } from '../../types';
import { PieceSvg } from './PieceSvg';

interface CapturedPiecesProps {
  captured: PieceSymbol[];
  pieceColor: Color;
  advantageCount?: number;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  captured,
  pieceColor,
  advantageCount = 0
}) => {
  if (captured.length === 0 && advantageCount <= 0) {
    return <div className="h-5" />;
  }

  // Sort pieces by value: Q, R, B, N, P
  const order: Record<PieceSymbol, number> = { q: 5, r: 4, b: 3, n: 2, p: 1, k: 0 };
  const sorted = [...captured].sort((a, b) => order[b] - order[a]);

  return (
    <div className="flex items-center gap-1 h-5 overflow-x-auto no-scrollbar">
      <div className="flex -space-x-1.5 items-center">
        {sorted.map((type, idx) => (
          <div key={`${type}-${idx}`} className="w-4 h-4 opacity-90 transition-transform">
            <PieceSvg type={type} color={pieceColor} />
          </div>
        ))}
      </div>
      {advantageCount > 0 && (
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-sm ml-1">
          +{advantageCount}
        </span>
      )}
    </div>
  );
};

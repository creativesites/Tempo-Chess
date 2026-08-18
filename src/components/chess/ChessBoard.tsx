import React, { useState, useRef } from 'react';
import { Chess, Square as ChessJsSquare, Move as ChessJsMove } from 'chess.js';
import { Square, PieceSymbol, Color, BoardTheme } from '../../types';
import { PieceSvg } from './PieceSvg';
import { sounds } from '../../utils/audio';

export interface BoardArrow {
  from: Square;
  to: Square;
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}

interface ChessBoardProps {
  fen: string;
  playerColor?: Color;
  flipped?: boolean;
  theme?: BoardTheme;
  lastMove?: { from: Square; to: Square } | null;
  selectedSquare?: Square | null;
  onMove?: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  showCoordinates?: boolean;
  showEvalBar?: boolean;
  evalScoreCp?: number;
  bestMoveArrow?: { from: Square; to: Square } | null;
  arrows?: BoardArrow[];
  dangerSquares?: Square[];
  disabled?: boolean;
  highlightSquares?: Square[];
}

const THEME_STYLES: Record<BoardTheme, { light: string; dark: string; border: string; darkText: string; lightText: string }> = {
  minimal_light: {
    light: 'bg-[#FAFBFD]',
    dark: 'bg-[#CBD5E1]',
    border: 'border-slate-300/90 shadow-lg',
    darkText: 'text-slate-700',
    lightText: 'text-slate-500'
  },
  swiss_clean: {
    light: 'bg-[#FFFFFF]',
    dark: 'bg-[#E4E4E7]',
    border: 'border-zinc-300 shadow-md',
    darkText: 'text-zinc-800',
    lightText: 'text-zinc-500'
  },
  emerald_modern: {
    light: 'bg-[#F2F5F0]',
    dark: 'bg-[#4A7C59]',
    border: 'border-[#2E5A3A] shadow-lg',
    darkText: 'text-emerald-100',
    lightText: 'text-emerald-900'
  },
  classic_wood: {
    light: 'bg-[#F7EFE2]',
    dark: 'bg-[#B07D4F]',
    border: 'border-[#7E4F2B] shadow-lg',
    darkText: 'text-amber-100',
    lightText: 'text-amber-950'
  },
  nordic_slate: {
    light: 'bg-[#E2E8F0]',
    dark: 'bg-[#64748B]',
    border: 'border-[#475569] shadow-lg',
    darkText: 'text-slate-100',
    lightText: 'text-slate-800'
  },
  minimalist_charcoal: {
    light: 'bg-[#94A3B8]',
    dark: 'bg-[#1E293B]',
    border: 'border-[#0F172A] shadow-lg',
    darkText: 'text-slate-300',
    lightText: 'text-slate-900'
  }
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  playerColor = 'w',
  flipped = false,
  theme = 'nordic_slate',
  lastMove,
  selectedSquare: controlledSelectedSquare,
  onMove,
  showCoordinates = true,
  showEvalBar = false,
  evalScoreCp = 0,
  bestMoveArrow,
  arrows = [],
  dangerSquares = [],
  disabled = false,
  highlightSquares = []
}) => {
  const [internalSelectedSquare, setInternalSelectedSquare] = useState<Square | null>(null);
  const [legalTargetSquares, setLegalTargetSquares] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const selectedSquare = controlledSelectedSquare !== undefined ? controlledSelectedSquare : internalSelectedSquare;
  const boardRef = useRef<HTMLDivElement>(null);

  // Parse FEN
  const chess = React.useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const isCheck = chess.isCheck();
  const turn = chess.turn() as Color;

  const boardTheme = THEME_STYLES[theme] || THEME_STYLES.nordic_slate;

  // Find king square in check
  let checkSquare: Square | null = null;
  if (isCheck) {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          checkSquare = (String.fromCharCode(97 + c) + (8 - r)) as Square;
        }
      }
    }
  }

  const handleSquareClick = (sq: Square) => {
    if (disabled) return;

    // If we have a pending promotion, wait for selection
    if (pendingPromotion) return;

    // If square already selected
    if (selectedSquare) {
      if (selectedSquare === sq) {
        // Deselect
        setInternalSelectedSquare(null);
        setLegalTargetSquares([]);
        return;
      }

      // Check if clicked square is legal move target
      if (legalTargetSquares.includes(sq)) {
        // Check for promotion
        const piece = chess.get(selectedSquare as ChessJsSquare);
        const isPawn = piece && piece.type === 'p';
        const isPromotionRank = (piece?.color === 'w' && sq.endsWith('8')) || (piece?.color === 'b' && sq.endsWith('1'));

        if (isPawn && isPromotionRank) {
          setPendingPromotion({ from: selectedSquare, to: sq });
          return;
        }

        // Execute Move
        if (onMove) {
          onMove(selectedSquare, sq);
        }
        setInternalSelectedSquare(null);
        setLegalTargetSquares([]);
        return;
      }
    }

    // Select piece on square if it belongs to active turn player
    const pieceOnSquare = chess.get(sq as ChessJsSquare);
    if (pieceOnSquare && pieceOnSquare.color === turn) {
      setInternalSelectedSquare(sq);

      // Compute legal targets
      const moves = chess.moves({ square: sq as ChessJsSquare, verbose: true });
      setLegalTargetSquares(moves.map(m => m.to as Square));
      sounds.playMove();
    } else {
      setInternalSelectedSquare(null);
      setLegalTargetSquares([]);
    }
  };

  const handlePromotionSelection = (pieceType: PieceSymbol) => {
    if (!pendingPromotion) return;
    if (onMove) {
      onMove(pendingPromotion.from, pendingPromotion.to, pieceType);
    }
    setPendingPromotion(null);
    setInternalSelectedSquare(null);
    setLegalTargetSquares([]);
  };

  // Convert square to pixel % coordinates for SVG arrows
  const getSquareCoordinates = (sq: Square) => {
    const fileIdx = sq.charCodeAt(0) - 97; // 0 (a) to 7 (h)
    const rankNum = parseInt(sq[1], 10);   // 1 to 8

    let x = (fileIdx + 0.5) * 12.5;
    let y = ((8 - rankNum) + 0.5) * 12.5;

    if (flipped) {
      x = (7 - fileIdx + 0.5) * 12.5;
      y = ((rankNum - 1) + 0.5) * 12.5;
    }

    return { x, y };
  };

  // Build files & ranks grid based on flipped state
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Calculate Evaluation Bar Percentage
  const evalNormalized = Math.min(1000, Math.max(-1000, evalScoreCp));
  const evalWhitePercent = 50 + (evalNormalized / 1000) * 45; // 5% to 95%

  const allArrows: BoardArrow[] = [...arrows];
  if (bestMoveArrow) {
    allArrows.push({
      from: bestMoveArrow.from,
      to: bestMoveArrow.to,
      color: '#10B981',
      width: 4
    });
  }

  return (
    <div className="relative flex select-none w-full max-w-[560px] mx-auto aspect-square">
      {/* Dynamic Centipawn Evaluation Bar */}
      {showEvalBar && (
        <div className="w-2.5 sm:w-3 mr-2 sm:mr-2.5 rounded-full overflow-hidden bg-slate-800 border border-slate-700/80 flex flex-col justify-end shadow-sm">
          <div
            className="w-full bg-slate-100 transition-all duration-300 ease-out"
            style={{ height: `${evalWhitePercent}%` }}
          />
        </div>
      )}

      {/* Main Chess Board Frame */}
      <div
        ref={boardRef}
        className={`relative w-full h-full border-2 sm:border-3 rounded-2xl overflow-hidden ${boardTheme.border}`}
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranks.map((rank, rIdx) =>
            files.map((file, fIdx) => {
              const sq = `${file}${rank}` as Square;
              const isDark = (fIdx + rIdx) % 2 === 1;
              const piece = chess.get(sq as ChessJsSquare);

              const isSelected = selectedSquare === sq;
              const isLastMoveFrom = lastMove?.from === sq;
              const isLastMoveTo = lastMove?.to === sq;
              const isLegalTarget = legalTargetSquares.includes(sq);
              const isInCheck = checkSquare === sq;
              const isCustomHighlighted = highlightSquares.includes(sq);
              const isDanger = dangerSquares.includes(sq);

              return (
                <button
                  type="button"
                  key={sq}
                  id={`square-${sq}`}
                  onClick={() => handleSquareClick(sq)}
                  className={`relative flex items-center justify-center p-1 transition-colors duration-150 outline-none cursor-pointer ${
                    isDark ? boardTheme.dark : boardTheme.light
                  } ${
                    isSelected ? 'ring-inset ring-4 ring-amber-400 bg-amber-400/40' : ''
                  } ${
                    isLastMoveFrom || isLastMoveTo ? 'bg-amber-200/40' : ''
                  } ${
                    isCustomHighlighted ? 'ring-inset ring-4 ring-cyan-400 bg-cyan-400/30' : ''
                  } ${
                    isDanger ? 'ring-inset ring-4 ring-rose-500/80 bg-rose-500/25' : ''
                  }`}
                >
                  {/* Coordinates on outer rim */}
                  {showCoordinates && (
                    <>
                      {fIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[9px] font-bold leading-none pointer-events-none ${
                            isDark ? 'text-slate-300/60' : 'text-slate-700/60'
                          }`}
                        >
                          {rank}
                        </span>
                      )}
                      {rIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[9px] font-bold leading-none pointer-events-none ${
                            isDark ? 'text-slate-300/60' : 'text-slate-700/60'
                          }`}
                        >
                          {file}
                        </span>
                      )}
                    </>
                  )}

                  {/* King Check Red Pulse Glow */}
                  {isInCheck && (
                    <div className="absolute inset-0 bg-red-600/75 rounded-full animate-pulse blur-[2px] pointer-events-none" />
                  )}

                  {/* Danger Indicator Marker */}
                  {isDanger && !isInCheck && (
                    <div className="absolute inset-1 rounded-full border-2 border-rose-500/80 animate-pulse pointer-events-none" />
                  )}

                  {/* Legal Move Marker */}
                  {isLegalTarget && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {piece ? (
                        <div className="w-full h-full border-4 border-slate-900/40 rounded-full" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-900/35 shadow-sm" />
                      )}
                    </div>
                  )}

                  {/* Chess Piece Vector */}
                  {piece && (
                    <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform active:scale-95">
                      <PieceSvg type={piece.type as PieceSymbol} color={piece.color as Color} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* SVG Multi-Arrow Overlay (Coach Plans, Threats, Candidate Moves) */}
        {allArrows.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <defs>
              <marker
                id="arrowhead-emerald"
                markerWidth="6"
                markerHeight="6"
                refX="4.5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0.5, 5.5 3, 0 5.5" fill="#10B981" />
              </marker>
              <marker
                id="arrowhead-rose"
                markerWidth="6"
                markerHeight="6"
                refX="4.5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0.5, 5.5 3, 0 5.5" fill="#F43F5E" />
              </marker>
              <marker
                id="arrowhead-amber"
                markerWidth="6"
                markerHeight="6"
                refX="4.5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0.5, 5.5 3, 0 5.5" fill="#F59E0B" />
              </marker>
              <marker
                id="arrowhead-cyan"
                markerWidth="6"
                markerHeight="6"
                refX="4.5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0.5, 5.5 3, 0 5.5" fill="#06B6D4" />
              </marker>
            </defs>

            {allArrows.map((arr, idx) => {
              const start = getSquareCoordinates(arr.from);
              const end = getSquareCoordinates(arr.to);
              const color = arr.color || '#10B981';
              let markerId = 'arrowhead-emerald';
              if (color.includes('#F43F5E') || color.includes('rose') || color.includes('red')) markerId = 'arrowhead-rose';
              else if (color.includes('#F59E0B') || color.includes('amber')) markerId = 'arrowhead-amber';
              else if (color.includes('#06B6D4') || color.includes('cyan')) markerId = 'arrowhead-cyan';

              return (
                <g key={`${arr.from}-${arr.to}-${idx}`} opacity={arr.opacity || 0.85}>
                  <line
                    x1={`${start.x}%`}
                    y1={`${start.y}%`}
                    x2={`${end.x}%`}
                    y2={`${end.y}%`}
                    stroke={color}
                    strokeWidth={arr.width || 4}
                    strokeLinecap="round"
                    strokeDasharray={arr.dashed ? '6,4' : undefined}
                    markerEnd={`url(#${markerId})`}
                  />
                  <circle cx={`${start.x}%`} cy={`${start.y}%`} r="3" fill={color} />
                </g>
              );
            })}
          </svg>
        )}

        {/* Promotion Dialog Modal */}
        {pendingPromotion && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Promotion Piece
              </span>
              <div className="flex gap-2">
                {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map(pt => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => handlePromotionSelection(pt)}
                    className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-lg p-2 border border-slate-600 transition hover:scale-105 active:scale-95 flex items-center justify-center"
                  >
                    <PieceSvg type={pt} color={playerColor} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

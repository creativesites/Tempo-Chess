import React, { useState } from 'react';
import { Chess, Square as ChessJsSquare, Move as ChessJsMove } from 'chess.js';
import { Square, Color, PieceSymbol } from '../../types';
import { BoardArrow } from '../chess/ChessBoard';
import { PIECE_VALUES } from '../../chess/rules';
import { useTheme } from '../../context/ThemeContext';
import { ShieldAlert, AlertTriangle, Eye, EyeOff, Crosshair } from 'lucide-react';

interface ThreatRadarProps {
  fen: string;
  playerColor: Color;
  onThreatArrowsChange?: (arrows: BoardArrow[], dangerSquares: Square[]) => void;
}

export interface ThreatItem {
  attackerSquare: Square;
  attackerPiece: PieceSymbol;
  targetSquare: Square;
  targetPiece?: PieceSymbol;
  type: 'hanging_piece' | 'check_threat' | 'fork_potential' | 'pawn_tension';
  description: string;
}

export const ThreatRadar: React.FC<ThreatRadarProps> = ({
  fen,
  playerColor,
  onThreatArrowsChange
}) => {
  const { tokens } = useTheme();
  const [isRadarActive, setIsRadarActive] = useState<boolean>(false);

  const opponentColor = playerColor === 'w' ? 'b' : 'w';

  // Compute immediate threats
  const threats: ThreatItem[] = React.useMemo(() => {
    try {
      // Create clone chess with opponent's turn to see what they could do immediately
      const chess = new Chess(fen);
      const board = chess.board();
      const detected: ThreatItem[] = [];

      // Find all opponent pieces and check their attack targets
      const opponentMoves = chess.moves({ verbose: true });

      // If opponent can capture player piece or give check
      opponentMoves.forEach(m => {
        if (m.captured) {
          const victimVal = PIECE_VALUES[m.captured as PieceSymbol] || 0;
          const attackerVal = PIECE_VALUES[m.piece as PieceSymbol] || 0;

          // Check if victim is hanging or under attack
          detected.push({
            attackerSquare: m.from as Square,
            attackerPiece: m.piece as PieceSymbol,
            targetSquare: m.to as Square,
            targetPiece: m.captured as PieceSymbol,
            type: victimVal >= attackerVal ? 'hanging_piece' : 'pawn_tension',
            description: `${m.piece.toUpperCase()} on ${m.from} is threatening ${m.captured.toUpperCase()} on ${m.to}`
          });
        }

        if (m.san.includes('+')) {
          detected.push({
            attackerSquare: m.from as Square,
            attackerPiece: m.piece as PieceSymbol,
            targetSquare: m.to as Square,
            type: 'check_threat',
            description: `Check threat: ${m.piece.toUpperCase()} on ${m.from} can strike ${m.to}`
          });
        }
      });

      // Deduplicate by target square
      const uniqueTargets = new Map<string, ThreatItem>();
      detected.forEach(t => {
        if (!uniqueTargets.has(t.targetSquare)) {
          uniqueTargets.set(t.targetSquare, t);
        }
      });

      return Array.from(uniqueTargets.values()).slice(0, 3);
    } catch {
      return [];
    }
  }, [fen, playerColor]);

  // When toggle changes, update board arrows
  const toggleRadar = () => {
    const nextState = !isRadarActive;
    setIsRadarActive(nextState);

    if (onThreatArrowsChange) {
      if (nextState && threats.length > 0) {
        const arrows: BoardArrow[] = threats.map(t => ({
          from: t.attackerSquare,
          to: t.targetSquare,
          color: '#F43F5E', // Rose red for threat arrows
          width: 3.5,
          dashed: true
        }));
        const dangerSquares = threats.map(t => t.targetSquare);
        onThreatArrowsChange(arrows, dangerSquares);
      } else {
        onThreatArrowsChange([], []);
      }
    }
  };

  return (
    <div className={`w-full ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3 ${tokens.cardShadow}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/80 border border-rose-300 flex items-center justify-center">
            <Crosshair className="w-3 h-3 text-rose-800 dark:text-rose-400" />
          </div>
          <span className={`text-xs font-bold ${tokens.appText}`}>
            Opponent Threat Radar
          </span>
        </div>

        <button
          type="button"
          onClick={toggleRadar}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-2xs ${
            isRadarActive
              ? 'bg-rose-600 text-white'
              : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} ${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`
          }`}
        >
          {isRadarActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-rose-500" />}
          <span>{isRadarActive ? 'Hide Threats' : 'Spot Threats'}</span>
        </button>
      </div>

      {/* Threats List */}
      <div className="mt-2 space-y-1.5">
        {threats.length === 0 ? (
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-50/80 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <span>✓ No immediate tactical forks or unprotected pieces detected.</span>
          </p>
        ) : (
          threats.map((threat, idx) => (
            <div
              key={`${threat.targetSquare}-${idx}`}
              className="p-2 rounded-lg bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] flex items-start gap-1.5 text-rose-950 dark:text-rose-200"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{threat.description}</span>
                <span className="block text-[10px] text-rose-800 dark:text-rose-300">
                  {threat.type === 'hanging_piece' ? 'Defend or move this piece to safety.' : 'Look out for king infiltration.'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

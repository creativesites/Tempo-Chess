import React, { useState } from 'react';
import { Chess, Move as ChessJsMove } from 'chess.js';
import { Square, Color, PieceSymbol } from '../../types';
import { BoardArrow } from '../chess/ChessBoard';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Eye, Shield, Swords, Compass, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CandidateMoveSpotterProps {
  fen: string;
  playerColor: Color;
  onPreviewMoveArrow?: (arrows: BoardArrow[]) => void;
  onSelectCandidateMove?: (from: Square, to: Square, promotion?: PieceSymbol) => void;
}

export interface CandidatePlan {
  id: string;
  type: 'positional' | 'central_break' | 'tactical_shot';
  title: string;
  san: string;
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  socraticReasoning: string;
  arrowColor: string;
}

export const CandidateMoveSpotter: React.FC<CandidateMoveSpotterProps> = ({
  fen,
  playerColor,
  onPreviewMoveArrow,
  onSelectCandidateMove
}) => {
  const { tokens } = useTheme();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Compute 3 thematic candidate plans using chess analysis
  const candidatePlans: CandidatePlan[] = React.useMemo(() => {
    try {
      const chess = new Chess(fen);
      if (chess.turn() !== playerColor) return [];

      const legalMoves = chess.moves({ verbose: true });
      if (legalMoves.length === 0) return [];

      const plans: CandidatePlan[] = [];

      // 1. Tactical / Forcing Move (Checks, captures, high-value threats)
      const tacticalMove = legalMoves.find(m => m.captured || m.san.includes('+') || m.piece === 'q');
      if (tacticalMove) {
        plans.push({
          id: 'tactical',
          type: 'tactical_shot',
          title: 'Option A: Tactical Forcing Line',
          san: tacticalMove.san,
          from: tacticalMove.from as Square,
          to: tacticalMove.to as Square,
          promotion: tacticalMove.promotion as PieceSymbol | undefined,
          socraticReasoning: tacticalMove.captured
            ? `Captures on ${tacticalMove.to} to test opponent recapture coordination and material balance.`
            : `Creates direct forcing pressure on the opponent's position.`,
          arrowColor: '#F59E0B' // Amber
        });
      }

      // 2. Central Pawn Break / Space Move
      const centralPawnMove = legalMoves.find(m => m.piece === 'p' && (m.to.includes('d4') || m.to.includes('e4') || m.to.includes('d5') || m.to.includes('e5') || m.to.includes('c5') || m.to.includes('c4')));
      if (centralPawnMove && (!tacticalMove || centralPawnMove.san !== tacticalMove.san)) {
        plans.push({
          id: 'central_break',
          type: 'central_break',
          title: 'Option B: Central Stake / Pawn Leverage',
          san: centralPawnMove.san,
          from: centralPawnMove.from as Square,
          to: centralPawnMove.to as Square,
          socraticReasoning: `Stakes space in the center to restrict opponent minor piece outposts.`,
          arrowColor: '#10B981' // Emerald
        });
      }

      // 3. Piece Harmony / Development (Knights, Bishops, Castling, Rooks)
      const positionalMove = legalMoves.find(m =>
        m.san.includes('O-O') ||
        (m.piece === 'n' && ['f3', 'c3', 'f6', 'c6', 'd4', 'd5', 'e4', 'e5'].includes(m.to)) ||
        (m.piece === 'b' && ['c4', 'f4', 'e3', 'd3', 'c5', 'f5', 'e6', 'd6'].includes(m.to)) ||
        (m.piece === 'r' && (m.to.includes('e1') || m.to.includes('d1') || m.to.includes('e8') || m.to.includes('d8') || m.to.includes('c1') || m.to.includes('c8')))
      );

      if (positionalMove && !plans.some(p => p.san === positionalMove.san)) {
        plans.push({
          id: 'positional',
          type: 'positional',
          title: 'Option C: Piece Coordination & Safety',
          san: positionalMove.san,
          from: positionalMove.from as Square,
          to: positionalMove.to as Square,
          socraticReasoning: positionalMove.san.includes('O-O')
            ? `Secures the king behind a protective pawn barrier and activates the rook.`
            : `Improves piece activity and coordinates with existing friendly pieces.`,
          arrowColor: '#06B6D4' // Cyan
        });
      }

      // Fallback: Fill up to 3 candidate moves from remaining legal moves
      if (plans.length < 3) {
        for (const m of legalMoves) {
          if (!plans.some(p => p.san === m.san)) {
            plans.push({
              id: `candidate-${plans.length}`,
              type: 'positional',
              title: `Option ${String.fromCharCode(65 + plans.length)}: Prophylactic Move`,
              san: m.san,
              from: m.from as Square,
              to: m.to as Square,
              socraticReasoning: `Solid alternative continuation to maintain flexible options.`,
              arrowColor: '#6366F1'
            });
            if (plans.length >= 3) break;
          }
        }
      }

      return plans;
    } catch {
      return [];
    }
  }, [fen, playerColor]);

  const handleSelectPlan = (plan: CandidatePlan) => {
    setSelectedPlanId(plan.id);
    sounds.playCoachChime();

    if (onPreviewMoveArrow) {
      onPreviewMoveArrow([
        {
          from: plan.from,
          to: plan.to,
          color: plan.arrowColor,
          width: 4
        }
      ]);
    }
  };

  const handleExecutePlan = (plan: CandidatePlan) => {
    if (onSelectCandidateMove) {
      onSelectCandidateMove(plan.from, plan.to, plan.promotion);
    }
  };

  if (candidatePlans.length === 0) return null;

  return (
    <div className={`w-full ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3 ${tokens.cardShadow} space-y-2.5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/80 border border-amber-300 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-amber-800 dark:text-amber-400" />
          </div>
          <span className={`text-xs font-bold ${tokens.appText}`}>
            Candidate Plans & Socratic Ideas
          </span>
        </div>
        <span className={`text-[10px] ${tokens.appTextMuted}`}>
          3 Strategic Branches
        </span>
      </div>

      {/* Plans List */}
      <div className="space-y-2">
        {candidatePlans.map(plan => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                isSelected
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400'
                  : `${tokens.cardBg} border-slate-200 dark:border-slate-800 hover:border-amber-300`
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold ${tokens.appText}`}>
                    {plan.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    {plan.san}
                  </span>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecutePlan(plan);
                      }}
                      className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-0.5 shadow-2xs"
                    >
                      <span>Play</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed mt-1`}>
                {plan.socraticReasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

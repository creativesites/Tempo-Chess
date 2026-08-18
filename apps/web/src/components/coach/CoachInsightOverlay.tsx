import React, { useEffect, useState } from 'react';
import { Square } from '../../types';
import { EvalShiftData, EvalShiftType } from '@tempo/game-review';
import { BoardArrow } from '../chess/ChessBoard';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Lightbulb,
  X,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export type { EvalShiftData, EvalShiftType };

interface CoachInsightOverlayProps {
  shiftData: EvalShiftData | null;
  fen: string;
  onDismiss: () => void;
  onTakeback?: () => void;
  onHighlightArrows?: (arrows: BoardArrow[], dangerSquares?: Square[]) => void;
}

export const CoachInsightOverlay: React.FC<CoachInsightOverlayProps> = ({
  shiftData,
  fen,
  onDismiss,
  onTakeback,
  onHighlightArrows
}) => {
  const { tokens } = useTheme();

  // Trigger sound effect on appearance
  useEffect(() => {
    if (shiftData) {
      if (shiftData.type === 'blunder' || shiftData.type === 'tactical_alarm') {
        sounds.playBlunder();
      } else if (shiftData.type === 'breakthrough') {
        sounds.playSuccess();
      } else {
        sounds.playCoachChime();
      }

      // If there are danger squares or suggested moves, highlight them on the board
      if (onHighlightArrows) {
        const arrows: BoardArrow[] = [];
        if (shiftData.fromSquare && shiftData.toSquare) {
          arrows.push({
            from: shiftData.fromSquare,
            to: shiftData.toSquare,
            color: shiftData.type === 'blunder' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)'
          });
        }
        onHighlightArrows(arrows, shiftData.dangerSquares || []);
      }
    }
  }, [shiftData?.id]);

  if (!shiftData) return null;

  const isAlarm = shiftData.type === 'blunder' || shiftData.type === 'tactical_alarm' || shiftData.type === 'mistake';
  const isPositive = shiftData.type === 'breakthrough';

  // Format Eval Shift
  const formatEvalChange = () => {
    const before = (shiftData.evalBeforeCp / 100).toFixed(1);
    const after = (shiftData.evalAfterCp / 100).toFixed(1);
    const delta = (Math.abs(shiftData.deltaCp) / 100).toFixed(1);
    return { before, after, delta };
  };

  const evalInfo = formatEvalChange();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-2xl border-2 ${
          isAlarm
            ? 'border-rose-500/80 bg-slate-900 text-white shadow-2xl shadow-rose-950/50'
            : isPositive
            ? 'border-emerald-500/80 bg-slate-900 text-white shadow-2xl shadow-emerald-950/50'
            : 'border-amber-500/80 bg-slate-900 text-white shadow-2xl shadow-amber-950/50'
        } p-4 space-y-3.5 relative overflow-hidden transition-all duration-300 scale-in-95`}
      >
        {/* Ambient Top Glow Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isAlarm
              ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
              : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500'
          }`}
        />

        {/* Header Strip */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isAlarm ? 'bg-rose-500 text-white' : isPositive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'
              }`}
            >
              {isAlarm ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : isPositive ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  {isAlarm ? 'AI Coach Alarm' : isPositive ? 'Tactical Breakthrough' : 'Evaluation Shift'}
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  Elo {shiftData.userElo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {isAlarm ? 'Significant evaluation swing detected' : 'Engine identified critical shift'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Dismiss insight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Eval Shift Badge & Metric Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Position Swing:</span>
            <div className="flex items-center gap-1 font-mono font-bold">
              <span className="text-slate-400">{evalInfo.before}</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className={isAlarm ? 'text-rose-400' : 'text-emerald-400'}>
                {evalInfo.after}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1 ${
              isAlarm
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isAlarm ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            <span>Δ {evalInfo.delta} pawns</span>
          </span>
        </div>

        {/* The Core Elo-Tailored Single-Sentence Hint (Highlighted) */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-inner">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-slate-100 leading-relaxed">
              "{shiftData.hintSentence}"
            </p>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onTakeback && isAlarm && shiftData.isPlayerMove && (
            <button
              type="button"
              onClick={() => {
                onTakeback();
                onDismiss();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Takeback & Try Again</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className={`flex-1 py-2 px-3 rounded-xl ${
              !isAlarm || !shiftData.isPlayerMove ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            } font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Continue Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

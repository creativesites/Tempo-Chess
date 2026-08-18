import React from 'react';
import { Timer, Zap, Flame, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface VisualMoveTimerProps {
  currentTurnTime: number; // Seconds spent on current move
  targetTimePerMove?: number; // Target seconds (e.g. 30s)
  isPlayerTurn: boolean;
  totalPlayerTime: number; // Seconds remaining in game clock
  totalOpponentTime: number; // Seconds remaining in opponent clock
  averageMoveTime: number; // Average move time across the match
  moveCount: number;
}

export const VisualMoveTimer: React.FC<VisualMoveTimerProps> = ({
  currentTurnTime,
  targetTimePerMove = 25,
  isPlayerTurn,
  totalPlayerTime,
  totalOpponentTime,
  averageMoveTime,
  moveCount
}) => {
  const { tokens } = useTheme();

  // Progress of current move time relative to target
  const moveProgressPercent = Math.min(100, (currentTurnTime / targetTimePerMove) * 100);

  // Time status evaluation
  const isOptimal = currentTurnTime <= targetTimePerMove * 0.6; // Quick & crisp
  const isModerate = currentTurnTime > targetTimePerMove * 0.6 && currentTurnTime <= targetTimePerMove; // Solid deliberation
  const isOvertime = currentTurnTime > targetTimePerMove; // Spending high clock resources
  const isCritical = currentTurnTime > targetTimePerMove * 1.5; // Burning excessive clock

  // Dynamic progress bar color
  const getProgressColor = () => {
    if (isCritical) return 'bg-gradient-to-r from-rose-500 to-red-600';
    if (isOvertime) return 'bg-gradient-to-r from-amber-500 to-rose-500';
    if (isModerate) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-emerald-400 to-teal-500';
  };

  // Coaching pacing feedback
  const getPacingFeedback = () => {
    if (!isPlayerTurn) {
      return { text: 'Opponent thinking...', color: 'text-slate-400', icon: 'wait' };
    }
    if (isCritical) {
      return { text: 'Time Warning: Over budget on this move', color: 'text-rose-500 font-bold', icon: 'alarm' };
    }
    if (isOvertime) {
      return { text: 'Deliberation: Commit or calculate forcing lines', color: 'text-amber-500 font-semibold', icon: 'flame' };
    }
    if (isModerate) {
      return { text: 'Healthy Pacing: Validating piece coordination', color: 'text-emerald-600 font-medium', icon: 'zap' };
    }
    return { text: 'Quick Calculation: Keep developing flow', color: 'text-teal-600 font-medium', icon: 'zap' };
  };

  const pacing = getPacingFeedback();

  return (
    <div className={`w-full rounded-xl border ${tokens.cardBorder} ${tokens.cardBg} px-3 py-2 shadow-2xs space-y-1.5 transition-all`}>
      {/* Top row: Move Timer Counter + Real-time Pacing status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-md ${isPlayerTurn ? (isOvertime ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800') : 'bg-slate-100 text-slate-500'}`}>
            <Timer className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Move Time:</span>
            <span className={`font-mono text-xs font-black ${isPlayerTurn ? (isCritical ? 'text-rose-600' : isOvertime ? 'text-amber-600' : tokens.appText) : tokens.appTextMuted}`}>
              {currentTurnTime}s
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/ {targetTimePerMove}s target</span>
          </div>
        </div>

        {/* Avg pace indicator */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <span>Avg:</span>
          <span className="font-bold text-slate-600">{averageMoveTime > 0 ? `${averageMoveTime.toFixed(1)}s` : '--'}</span>
        </div>
      </div>

      {/* Progress Bar with target markers */}
      <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()} ${isPlayerTurn && isCritical ? 'animate-pulse' : ''}`}
          style={{ width: `${moveProgressPercent}%` }}
        />
      </div>

      {/* Dynamic Pacing Coach Tip Bar */}
      <div className="flex items-center justify-between text-[10px] pt-0.5">
        <div className="flex items-center gap-1">
          {pacing.icon === 'alarm' && <AlertCircle className="w-3 h-3 text-rose-500 animate-bounce" />}
          {pacing.icon === 'flame' && <Flame className="w-3 h-3 text-amber-500" />}
          {pacing.icon === 'zap' && <Zap className="w-3 h-3 text-teal-500" />}
          <span className={`${pacing.color} truncate max-w-[240px]`}>{pacing.text}</span>
        </div>

        <div className="text-[9px] font-semibold text-slate-400">
          Move #{Math.floor(moveCount / 2) + 1}
        </div>
      </div>
    </div>
  );
};

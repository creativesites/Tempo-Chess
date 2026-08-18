import React, { useState } from 'react';
import { PlayerModel, RepertoireItem, Color } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  Shield,
  Layers,
  CheckCircle2,
  Brain,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Plus,
  Compass
} from 'lucide-react';

interface RepertoireSectionProps {
  playerModel: PlayerModel;
}

export const RepertoireSection: React.FC<RepertoireSectionProps> = ({ playerModel }) => {
  const { tokens } = useTheme();
  const [selectedColor, setSelectedColor] = useState<Color>('w');
  const [selectedRepertoireId, setSelectedRepertoireId] = useState<string>('rep-white-ruy');

  const repertoireList = playerModel.openingRepertoire || [];
  const filteredList = repertoireList.filter(item => item.color === selectedColor);
  const activeItem = filteredList.find(item => item.id === selectedRepertoireId) || filteredList[0] || repertoireList[0];

  return (
    <div className="space-y-5">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className={`text-base font-bold ${tokens.appText} flex items-center gap-2`}>
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Personal Opening Repertoire</span>
          </h2>
          <p className={`text-xs ${tokens.appTextMuted} mt-0.5`}>
            Track and master your core opening responses with 3-dimensional readiness metrics.
          </p>
        </div>

        {/* Color Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setSelectedColor('w'); }}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedColor === 'w'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            As White (1.e4 / 1.d4)
          </button>
          <button
            type="button"
            onClick={() => { setSelectedColor('b'); }}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedColor === 'b'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            As Black (vs 1.e4 / vs 1.d4)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Repertoire Cards */}
        <div className="lg:col-span-5 space-y-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
            Repertoire Lines ({filteredList.length})
          </span>

          <div className="space-y-2">
            {filteredList.map(rep => {
              const isSelected = rep.id === activeItem?.id;
              const avgScore = Math.round((rep.understandingPercentage + rep.memorizationPercentage + rep.applicationPercentage) / 3);
              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setSelectedRepertoireId(rep.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 shadow-2xs ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20'
                      : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-200`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                      {rep.eco}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {rep.responseTo}
                    </span>
                  </div>

                  <span className={`text-xs font-bold ${tokens.appText}`}>
                    {rep.name}
                  </span>

                  {rep.variation && (
                    <span className={`text-[11px] ${tokens.appTextMuted} line-clamp-1`}>
                      {rep.variation}
                    </span>
                  )}

                  {/* Readiness Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500">Mastery Score</span>
                      <span className="text-emerald-700 font-mono">{avgScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${avgScore}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Repertoire Details & 3-Metric Gauges */}
        {activeItem && (
          <div className="lg:col-span-7 space-y-4">
            <div className={`${tokens.cardBg} p-5 rounded-2xl border ${tokens.cardBorder} shadow-2xs space-y-4`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {activeItem.eco}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    Target: {activeItem.responseTo}
                  </span>
                  {activeItem.mastered && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Mastered Line
                    </span>
                  )}
                </div>
                <h3 className={`text-base font-bold ${tokens.appText} mt-1`}>
                  {activeItem.name}
                </h3>
              </div>

              {/* 3-Dimensional Readiness Meters */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1 text-center`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Understanding
                  </span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {activeItem.understandingPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Principles & Plans</span>
                </div>

                <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1 text-center`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Memorization
                  </span>
                  <span className="text-xl font-black text-blue-700 font-mono">
                    {activeItem.memorizationPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Move Order Recall</span>
                </div>

                <div className={`${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder} space-y-1 text-center`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Application
                  </span>
                  <span className="text-xl font-black text-amber-700 font-mono">
                    {activeItem.applicationPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Live Game Win Rate</span>
                </div>
              </div>

              {/* Move Sequence */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Core Move Sequence
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs font-bold text-slate-800">
                  {activeItem.movesSan.map((mv, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-100 border border-slate-200 shadow-2xs">
                      {i + 1}. {mv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pawn Structure & Key Plans */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className={`${tokens.pillBg} p-3.5 rounded-xl border ${tokens.pillBorder} space-y-1`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Characteristic Pawn Structure
                  </span>
                  <p className="text-xs font-bold text-slate-900">{activeItem.pawnStructure}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Primary Strategic Directives
                  </span>
                  <ul className="text-xs space-y-1 list-disc list-inside text-slate-800">
                    {activeItem.keyPlans.map((plan, i) => (
                      <li key={i}>{plan}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

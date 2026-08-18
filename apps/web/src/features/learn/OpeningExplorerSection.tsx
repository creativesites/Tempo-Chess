import React, { useState } from 'react';
import { PlayerModel, Color, RepertoireItem, Square } from '../../types';
import {
  generatePersonalizedRepertoire,
  RepertoireRecommendation
} from '../../chess/repertoireRecommender';
import { ChessBoard } from '../../components/chess/ChessBoard';
import { ChessGameWrapper } from '../../chess/rules';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../utils/audio';
import { AppStorage } from '../../database/storage';
import {
  Compass,
  Sparkles,
  Shield,
  Zap,
  Brain,
  CheckCircle2,
  Plus,
  RotateCcw,
  Layers,
  Check,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OpeningExplorerSectionProps {
  playerModel: PlayerModel;
  onUpdatePlayerModel?: (model: PlayerModel) => void;
  onPracticeVariation?: (variationId: string) => void;
}

export const OpeningExplorerSection: React.FC<OpeningExplorerSectionProps> = ({
  playerModel,
  onUpdatePlayerModel,
  onPracticeVariation
}) => {
  const { tokens, boardTheme } = useTheme();

  // Color Filter for repertoire suggestions
  const [selectedColor, setSelectedColor] = useState<Color | 'all'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'repertoire' | 'playstyle' | 'performance'>('repertoire');

  // Compute live repertoire suggestions & playstyle diagnostics
  const report = generatePersonalizedRepertoire(playerModel);
  const { playstyle, variationStats, recommendedRepertoire, weakestOpeningRemedies } = report;

  // Selected Recommendation for interactive inspection
  const [selectedRecId, setSelectedRecId] = useState<string>(recommendedRepertoire[0]?.id || 'rec-white-ruy-lopez');
  const activeRec: RepertoireRecommendation =
    recommendedRepertoire.find(r => r.id === selectedRecId) || recommendedRepertoire[0];

  // Interactive board preview state for the selected opening variation
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [addedRepertoireIds, setAddedRepertoireIds] = useState<string[]>(
    (playerModel.openingRepertoire || []).map(r => r.id)
  );

  // Compute FEN for current step
  const movesToPlay = activeRec?.movesSan.slice(0, stepIndex) || [];
  const previewGame = new ChessGameWrapper();
  let lastPlayedMove: { from: Square; to: Square } | null = null;
  movesToPlay.forEach(san => {
    try {
      const res = previewGame.chess.move(san);
      if (res) {
        lastPlayedMove = { from: res.from as Square, to: res.to as Square };
      }
    } catch {
      // safe fallback
    }
  });
  const currentFen = previewGame.getFen();

  const handleSelectRecommendation = (rec: RepertoireRecommendation) => {
    setSelectedRecId(rec.id);
    setStepIndex(rec.movesSan.length > 6 ? 4 : rec.movesSan.length);
    sounds.playMove();
  };

  const handleStepForward = () => {
    if (activeRec && stepIndex < activeRec.movesSan.length) {
      setStepIndex(stepIndex + 1);
      sounds.playMove();
    }
  };

  const handleStepBackward = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      sounds.playMove();
    }
  };

  const handleResetBoard = () => {
    setStepIndex(0);
    sounds.playMove();
  };

  const handleJumpToEnd = () => {
    if (activeRec) {
      setStepIndex(activeRec.movesSan.length);
      sounds.playMove();
    }
  };

  // Add to User's Personal Repertoire
  const handleAddToRepertoire = (rec: RepertoireRecommendation) => {
    const existing = playerModel.openingRepertoire || [];
    const isAlready = existing.some(
      r => r.eco === rec.eco || r.name.toLowerCase() === rec.name.toLowerCase()
    );

    if (isAlready) return;

    const newRepertoireItem: RepertoireItem = {
      id: `rep-${rec.color === 'w' ? 'white' : 'black'}-${rec.eco.toLowerCase()}-${Date.now()}`,
      color: rec.color,
      name: rec.name,
      variation: rec.variation,
      movesSan: rec.movesSan,
      eco: rec.eco,
      responseTo: rec.responseTo,
      keyPlans: rec.corePlans,
      pawnStructure: rec.pawnStructure,
      understandingPercentage: Math.min(85, rec.matchScore - 10),
      memorizationPercentage: 60,
      applicationPercentage: 65,
      mastered: false
    };

    const updatedRepertoire = [...existing, newRepertoireItem];
    const updatedModel: PlayerModel = {
      ...playerModel,
      openingRepertoire: updatedRepertoire
    };

    AppStorage.savePlayerModel(updatedModel);
    if (onUpdatePlayerModel) {
      onUpdatePlayerModel(updatedModel);
    }

    setAddedRepertoireIds([...addedRepertoireIds, rec.id, newRepertoireItem.id]);
    sounds.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Filter recommendations by color
  const filteredRecommendations = recommendedRepertoire.filter(r => {
    if (selectedColor === 'all') return true;
    return r.color === selectedColor;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner with Playstyle Summary */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-5 sm:p-6 rounded-2xl shadow-2xs space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${tokens.pillBg} border ${tokens.pillBorder} text-emerald-800 flex items-center gap-1.5`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Repertoire Recommender & Explorer</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {playerModel.gamesPlayed} games analyzed
              </span>
            </div>
            <h2 className={`text-xl font-bold ${tokens.appText} tracking-tight`}>
              Personalized Opening Repertoire for {playerModel.playerName || 'Winston'}
            </h2>
            <p className={`text-xs ${tokens.appTextMuted} max-w-2xl leading-relaxed`}>
              Tailored specifically to your <strong className="text-emerald-700 font-semibold">{playstyle.label}</strong> playstyle, tactical strengths, and current win-rates across specific variations.
            </p>
          </div>

          {/* Archetype Badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-700/80 shrink-0">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                Detected Archetype
              </span>
              <span className="text-sm font-bold text-slate-100">
                {playstyle.label}
              </span>
              <span className="text-[11px] text-slate-400 block max-w-[200px] truncate">
                {playstyle.tagline}
              </span>
            </div>
          </div>
        </div>

        {/* Playstyle Metric Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Tactical Aggression</span>
              <span className="font-bold font-mono text-emerald-700">{playstyle.tacticalBiasScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${playstyle.tacticalBiasScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Prefers active piece play over dry endgames</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Positional Patience</span>
              <span className="font-bold font-mono text-emerald-700">{playstyle.positionalPatienceScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${playstyle.positionalPatienceScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Comfortable maneuvering in structured centers</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Risk Profile</span>
              <span className="font-bold font-mono text-emerald-700">{playstyle.riskToleranceScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${playstyle.riskToleranceScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block">Prefers solid castled king with clean defense</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('repertoire')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'repertoire'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Recommended Lines ({filteredRecommendations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('performance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'performance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Win-Rate Performance by Variation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('playstyle')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'playstyle'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Playstyle DNA Breakdown</span>
          </button>
        </div>

        {/* Color Switcher */}
        {activeSubTab === 'repertoire' && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setSelectedColor('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedColor === 'all'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedColor('w')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedColor === 'w'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              As White (1.e4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedColor('b')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedColor === 'b'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              As Black
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECOMMENDED REPERTOIRE WITH INTERACTIVE BOARD                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'repertoire' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Recommended Openings */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
                Personalized Recommendations ({filteredRecommendations.length})
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ranked by AI Fit
              </span>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredRecommendations.map(rec => {
                const isSelected = rec.id === activeRec?.id;
                const isAlreadyIn = (playerModel.openingRepertoire || []).some(
                  r => r.eco.slice(0, 3) === rec.eco.slice(0, 3) || r.name.toLowerCase().includes(rec.name.toLowerCase())
                ) || addedRepertoireIds.includes(rec.id);

                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => handleSelectRecommendation(rec)}
                    className={`w-full text-left p-4 rounded-2xl border transition flex flex-col gap-2 shadow-2xs relative ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20'
                        : `${tokens.cardBg} border ${tokens.cardBorder} hover:border-emerald-300`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                          {rec.eco}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          rec.color === 'w' ? 'bg-slate-100 text-slate-800' : 'bg-slate-800 text-white'
                        }`}>
                          {rec.color === 'w' ? 'White' : 'Black'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {rec.responseTo}
                        </span>
                      </div>

                      {/* Match Score Badge */}
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        <span>{rec.matchScore}% Fit</span>
                      </span>
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${tokens.appText} leading-snug`}>
                        {rec.name}
                      </h4>
                      <p className={`text-[11px] ${tokens.appTextMuted} line-clamp-1`}>
                        {rec.variation}
                      </p>
                    </div>

                    {/* Role & Win-Rate Info Pill */}
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Role: {rec.recommendedRole}
                      </span>
                      {rec.currentWinRate !== undefined ? (
                        <span className={`font-semibold flex items-center gap-1 ${
                          rec.currentWinRate >= 60 ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          Your Win Rate: <strong>{rec.currentWinRate}%</strong>
                        </span>
                      ) : (
                        <span className="text-slate-400">New Weapon Line</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Variation Board & Master Strategic Plans */}
          {activeRec && (
            <div className="lg:col-span-7 space-y-4">
              <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-5 rounded-2xl shadow-2xs space-y-4`}>
                {/* Header of Active Variation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {activeRec.eco}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {activeRec.responseTo}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {activeRec.recommendedRole}
                      </span>
                    </div>
                    <h3 className={`text-base font-bold ${tokens.appText} mt-1`}>
                      {activeRec.name}
                    </h3>
                    <p className={`text-xs ${tokens.appTextMuted}`}>
                      {activeRec.variation}
                    </p>
                  </div>

                  {/* Add to Repertoire Button */}
                  <div>
                    {addedRepertoireIds.includes(activeRec.id) ? (
                      <button
                        type="button"
                        disabled
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 cursor-default"
                      >
                        <Check className="w-4 h-4" />
                        <span>In Repertoire</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToRepertoire(activeRec)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${tokens.accentPrimary} ${tokens.accentPrimaryHover} flex items-center gap-1.5 shadow-xs transition`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to My Repertoire</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Repertoire Match Justification */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-900">Why this fits your playstyle:</span>
                    <p className="mt-0.5 leading-relaxed text-amber-800">{activeRec.matchReason}</p>
                  </div>
                </div>

                {/* Board + Move List Controller */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Interactive Board */}
                  <div className="md:col-span-7 flex flex-col items-center">
                    <div className="w-full max-w-[340px] aspect-square rounded-xl overflow-hidden shadow-xs border border-slate-200">
                      <ChessBoard
                        fen={currentFen}
                        orientation={activeRec.color}
                        lastMove={lastPlayedMove || undefined}
                        customTheme={boardTheme}
                        interactive={false}
                      />
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex items-center justify-between w-full max-w-[340px] mt-2.5 px-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleResetBoard}
                          title="Starting Position"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleStepBackward}
                          disabled={stepIndex === 0}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-40 transition"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleStepForward}
                          disabled={stepIndex >= activeRec.movesSan.length}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold disabled:opacity-40 transition"
                        >
                          Next Move
                        </button>
                        <button
                          type="button"
                          onClick={handleJumpToEnd}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                        >
                          Tabia (End)
                        </button>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {stepIndex} / {activeRec.movesSan.length} plies
                      </span>
                    </div>
                  </div>

                  {/* Move Sequence & Strategic Plans */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Mainline Sequence
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto text-xs font-mono">
                        {activeRec.movesSan.map((san, idx) => {
                          const isWhiteMove = idx % 2 === 0;
                          const moveNum = Math.floor(idx / 2) + 1;
                          const isCurrentStep = idx === stepIndex - 1;

                          return (
                            <span
                              key={idx}
                              onClick={() => setStepIndex(idx + 1)}
                              className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                                isCurrentStep
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : idx < stepIndex
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {isWhiteMove ? `${moveNum}. ` : ''}{san}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pawn Structure & Complexity Tag */}
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                          Pawn Spine Archetype
                        </span>
                        <span className="font-semibold text-emerald-950 text-[11px]">
                          {activeRec.pawnStructure}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Complexity</span>
                          <span className="font-bold text-slate-800 text-[11px]">{activeRec.tacticalComplexity}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Theory Load</span>
                          <span className="font-bold text-slate-800 text-[11px]">{activeRec.memorizationDemand}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Strategic Plans & Transition to Middlegame */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} flex items-center gap-1.5`}>
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Master Middlegame Plans</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeRec.corePlans.map((plan, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start gap-2 text-slate-700"
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-snug">{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VARIATION WIN-RATE PERFORMANCE                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'performance' && (
        <div className="space-y-4">
          <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-5 rounded-2xl shadow-2xs space-y-2`}>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className={`text-base font-bold ${tokens.appText}`}>
                Opening Variation Performance Tracker
              </h3>
            </div>
            <p className={`text-xs ${tokens.appTextMuted} max-w-2xl`}>
              We analyze your game results across specific variations to find your strongest strongholds and address the tactical lines where you bleed rating points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {variationStats.map((stat, idx) => (
              <div
                key={idx}
                className={`${tokens.cardBg} border ${
                  stat.status === 'stronghold'
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                    : stat.status === 'vulnerable'
                    ? 'border-rose-300 ring-1 ring-rose-400/20'
                    : tokens.cardBorder
                } p-4 rounded-2xl shadow-2xs space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {stat.eco}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    stat.status === 'stronghold'
                      ? 'bg-emerald-100 text-emerald-800'
                      : stat.status === 'vulnerable'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stat.status === 'stronghold' ? 'Stronghold' : stat.status === 'vulnerable' ? 'Vulnerable Line' : 'Developing'}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xs font-bold ${tokens.appText}`}>
                    {stat.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {stat.gamesPlayed} games ({stat.wins}W - {stat.losses}L - {stat.draws}D)
                  </span>
                </div>

                {/* Win Rate Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 text-[11px]">Win Rate</span>
                    <span className={`font-mono ${
                      stat.winRate >= 60 ? 'text-emerald-700' : stat.winRate < 45 ? 'text-rose-700' : 'text-amber-700'
                    }`}>
                      {stat.winRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.winRate >= 60 ? 'bg-emerald-600' : stat.winRate < 45 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${stat.winRate}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {stat.strategicInsight}
                </p>
              </div>
            ))}
          </div>

          {/* Targeted Weakness Remedies Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="w-5 h-5" />
              <h4 className="text-sm font-bold">Recommended Tactical Antidotes for Your Low Win-Rate Lines</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your losses against the Open Sicilian (38% win rate), our recommender recommends switching to the <strong>Alapin 2.c3</strong> as White or adopting the <strong>Caro-Kann Defense</strong> as Black to avoid chaotic King-side races.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLAYSTYLE DNA BREAKDOWN                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'playstyle' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Archetype Profile Card */}
            <div className="md:col-span-2 space-y-4">
              <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-5 sm:p-6 rounded-2xl shadow-2xs space-y-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Chess Playstyle Profile
                    </span>
                    <h3 className={`text-lg font-bold ${tokens.appText}`}>
                      {playstyle.label}
                    </h3>
                  </div>
                </div>

                <p className={`text-xs ${tokens.appText} leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200`}>
                  {playstyle.description}
                </p>

                <div className="space-y-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                    Identified Strengths In Your Games
                  </span>
                  <div className="space-y-1.5">
                    {playstyle.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Advice Card */}
            <div className="space-y-4">
              <div className={`${tokens.cardBg} border ${tokens.cardBorder} p-5 rounded-2xl shadow-2xs space-y-3`}>
                <div className="flex items-center gap-2 text-emerald-800">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Recommended Pawn Formations</h4>
                </div>

                <div className="space-y-2 text-xs">
                  {playstyle.recommendedPawnStructures.map((struct, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 font-medium">
                      {struct}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
                    Openings To Avoid
                  </span>
                  {playstyle.openingsToAvoid.map((avoid, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{avoid}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

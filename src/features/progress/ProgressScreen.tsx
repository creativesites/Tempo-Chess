import React, { useState, useEffect } from 'react';
import { PlayerModel, GameReview, CriticalMoment, SkillProfile, SavedGameRecord } from '../../types';
import { AppStorage } from '../../database/storage';
import { PostGameReviewModal } from '../../components/game/PostGameReviewModal';
import { SqliteGameHistoryModal } from '../../components/game/SqliteGameHistoryModal';
import { GameDetailModal } from '../../components/game/GameDetailModal';
import { OpeningTrainer } from '../../components/openings/OpeningTrainer';
import { generateOpeningReport } from '../../chess/openingDrills';
import { useTheme } from '../../context/ThemeContext';
import {
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  History,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Database,
  FileCode,
  Download,
  Calendar,
  Layers,
  Search,
  Zap,
  Compass,
  BookOpen
} from 'lucide-react';

interface ProgressScreenProps {
  playerModel: PlayerModel;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ playerModel }) => {
  const { tokens } = useTheme();
  const [savedGames, setSavedGames] = useState<SavedGameRecord[]>([]);
  const [selectedGame, setSelectedGame] = useState<SavedGameRecord | null>(null);
  const [selectedReview, setSelectedReview] = useState<GameReview | null>(null);
  const [isSqliteModalOpen, setIsSqliteModalOpen] = useState(false);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const [trainerInitialMode, setTrainerInitialMode] = useState<'practice' | 'drill'>('practice');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss' | 'draw'>('all');
  const [sqliteStats, setSqliteStats] = useState<{ totalGames: number; wins: number; losses: number; avgAccuracy: number }>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    avgAccuracy: 0
  });

  const openingReport = generateOpeningReport(playerModel);

  const fetchGamesList = async () => {
    try {
      const records = await AppStorage.getSavedGames();
      setSavedGames(records);

      const stats = await AppStorage.getSqliteStats();
      setSqliteStats({
        totalGames: stats.totalGames,
        wins: stats.wins,
        losses: stats.losses,
        avgAccuracy: stats.avgAccuracy
      });
    } catch (e) {
      console.error('Failed to load saved games from SQLite', e);
    }
  };

  useEffect(() => {
    fetchGamesList();
  }, [isSqliteModalOpen]);

  const filteredGames = savedGames.filter(game => {
    if (filterResult === 'all') return true;
    return game.result === filterResult;
  });

  const skillsList = Object.values(playerModel.skills) as SkillProfile[];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 animate-in fade-in pb-24">
      {/* Screen Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center`}>
            <TrendingUp className={`w-4 h-4 ${tokens.accentBadgeText}`} />
          </div>
          <h2 className={`text-base font-bold ${tokens.appText}`}>
            Player Intelligence & Progress
          </h2>
        </div>
        <p className={`text-xs ${tokens.appTextMuted}`}>
          Persistent behavioral modeling & SQLite GameHistory records across your {playerModel.gamesPlayed} offline games.
        </p>
      </div>

      {/* SQLite GameHistory Database Quick Stats Card */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 ${tokens.cardShadow} space-y-2.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className={`text-xs font-bold ${tokens.appText}`}>SQLite GameHistory Vault</h3>
              <p className={`text-[10px] ${tokens.appTextMuted}`}>
                {sqliteStats.totalGames} PGNs Saved • {sqliteStats.avgAccuracy}% Avg Acc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSqliteModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl ${tokens.accentPrimary} text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition`}
          >
            <span>PGN Vault</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* "What I've Learned About You" Showcase Card */}
      <div className={`${tokens.heroBg} border ${tokens.heroBorder} rounded-2xl p-4.5 ${tokens.cardShadow} space-y-3 relative overflow-hidden`}>
        <div className="flex items-center gap-2">
          <Brain className={`w-4 h-4 ${tokens.accentBadgeText}`} />
          <h3 className={`text-sm font-bold ${tokens.appText}`}>
            What I've Learned About Your Chess
          </h3>
        </div>

        {/* Strengths */}
        <div className="space-y-1.5 pt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.accentBadgeText} block`}>
            Observed Strengths
          </span>
          <div className="space-y-1">
            {playerModel.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className={`${tokens.appText} font-medium`}>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className={`space-y-1.5 pt-2 border-t ${tokens.cardBorder}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Current Focus Areas
          </span>
          <div className="space-y-1">
            {playerModel.weaknesses.map((weak, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className={`${tokens.appText} font-medium`}>{weak}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opening Report & Adaptive Trainer Card */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4 sm:p-4.5 ${tokens.cardShadow} space-y-3.5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 text-emerald-600`} />
            <h3 className={`text-sm font-bold ${tokens.appText}`}>
              Opening Report & Repertoire Diagnostics
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Score: {openingReport.overallScore}%
            </span>
          </div>
        </div>

        {/* Diagnostic Split: Weakest vs Strongest */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Weakest Openings (Needs Work) */}
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Weakest System</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-mono">
                {openingReport.weakestOpenings[0]?.winRate}% Win Rate
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {openingReport.weakestOpenings[0]?.name} ({openingReport.weakestOpenings[0]?.eco})
              </span>
              <span className="text-[11px] text-slate-700 block mt-0.5">
                {openingReport.weakestOpenings[0]?.keyInsights[0] || 'Vulnerable to central pawn breaks'}
              </span>
            </div>
          </div>

          {/* Strongest Opening */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Strongest System</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-mono">
                {openingReport.strongestOpenings[0]?.winRate}% Win Rate
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {openingReport.strongestOpenings[0]?.name} ({openingReport.strongestOpenings[0]?.eco})
              </span>
              <span className="text-[11px] text-slate-700 block mt-0.5">
                {openingReport.strongestOpenings[0]?.keyInsights[0] || 'Clean harmonic development and strong center'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Practice Variation & Drill Weakest Openings */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setTrainerInitialMode('drill');
              setIsTrainerOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Drill Weakest Openings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTrainerInitialMode('practice');
              setIsTrainerOpen(true);
            }}
            className={`px-3.5 py-2 rounded-xl ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} font-bold text-xs flex items-center gap-1.5 transition active:scale-95`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice Repertoire Variations</span>
          </button>
        </div>
      </div>

      {/* Behavioral Tendency Meters */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
            Identified Behavioral Tendencies
          </h3>
          <span className={`text-[10px] ${tokens.appTextMuted}`}>Pattern Recognition</span>
        </div>

        <div className="space-y-2.5">
          {playerModel.tendencies.map(tend => (
            <div
              key={tend.id}
              className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3.5 space-y-2 ${tokens.cardShadow}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${tokens.appText}`}>{tend.name}</span>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    tend.confidencePercentage >= 75
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {tend.confidencePercentage}% Confidence
                </span>
              </div>

              <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed`}>
                {tend.description}
              </p>

              <div className={`w-full ${tokens.meterTrackBg} h-1.5 rounded-full overflow-hidden border ${tokens.meterBorder}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    tend.confidencePercentage >= 75 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${tend.confidencePercentage}%` }}
                />
              </div>

              {tend.recentExamples && tend.recentExamples.length > 0 && (
                <div className={`text-[10px] ${tokens.appTextSubtle} font-mono pt-1`}>
                  Example: {tend.recentExamples[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skill Breakdown Radar/Bars */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
            Skill Mastery Breakdown
          </h3>
          <span className={`text-[10px] ${tokens.appTextMuted}`}>100% Scale</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {skillsList.map(skill => (
            <div
              key={skill.category}
              className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-xl p-3 space-y-1.5 ${tokens.cardShadow}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${tokens.appText}`}>{skill.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-xs font-bold ${tokens.appText}`}>
                    {skill.score}%
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      skill.trend === 'improving'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : `${tokens.pillBg} ${tokens.appTextMuted} border ${tokens.pillBorder}`
                    }`}
                  >
                    {skill.trend}
                  </span>
                </div>
              </div>

              <div className={`w-full ${tokens.meterTrackBg} h-2 rounded-full overflow-hidden border ${tokens.meterBorder}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    skill.score >= 70
                      ? 'bg-emerald-500'
                      : skill.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>

              <p className={`text-[11px] ${tokens.appTextMuted} leading-relaxed`}>
                {skill.insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* History Section (SQLite Persistent Store) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className={`w-4 h-4 ${tokens.accentBadgeText}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
              History
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {(['all', 'win', 'loss'] as const).map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setFilterResult(filter)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition ${
                  filterResult === filter
                    ? `${tokens.accentPrimary} text-white`
                    : `${tokens.pillBg} ${tokens.appTextMuted} hover:${tokens.appText} border ${tokens.pillBorder}`
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredGames.length === 0 ? (
            <div className={`p-6 text-center ${tokens.cardBg} border ${tokens.cardBorder} rounded-xl text-xs ${tokens.appTextMuted}`}>
              No games found in history. Play a match to record completed PGNs automatically!
            </div>
          ) : (
            filteredGames.map(game => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGame(game)}
                className={`w-full ${tokens.cardBg} ${tokens.cardBgHover} border ${tokens.cardBorder} rounded-xl p-3 text-left transition flex items-center justify-between group ${tokens.cardShadow}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                        game.result === 'win'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {game.result}
                    </span>
                    <span className={`text-xs font-bold ${tokens.appText}`}>
                      {game.openingName}
                    </span>
                  </div>
                  <p className={`text-[11px] ${tokens.appTextMuted} truncate max-w-[250px]`}>
                    {game.headline}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{new Date(game.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{game.movesCount} moves</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-700 font-semibold">{game.accuracyWhite}% acc</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${tokens.accentBadgeText} group-hover:underline text-[11px]`}>
                    View PGN
                  </span>
                  <ChevronRight className={`w-4 h-4 ${tokens.appTextSubtle} group-hover:text-emerald-600 transition`} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Game Detail Modal (PGN & Summary Inspection) */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {/* Review Modal fallback */}
      {selectedReview && (
        <PostGameReviewModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onPlayAgain={() => setSelectedReview(null)}
        />
      )}

      {/* SQLite GameHistory Vault Modal */}
      <SqliteGameHistoryModal
        isOpen={isSqliteModalOpen}
        onClose={() => {
          setIsSqliteModalOpen(false);
          fetchGamesList();
        }}
        onOpenReview={(review) => {
          setIsSqliteModalOpen(false);
          setSelectedReview(review);
        }}
      />

      {/* Opening Trainer Modal */}
      {isTrainerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl w-full max-w-5xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]`}>
            <OpeningTrainer
              playerModel={playerModel}
              initialMode={trainerInitialMode}
              onClose={() => setIsTrainerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { PlayerModel, DailyTrainingPlan, SkillProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Play, Brain, Flame, GraduationCap, ChevronRight, Award, ShieldAlert, ArrowRight, Palette } from 'lucide-react';

interface HomeScreenProps {
  playerModel: PlayerModel;
  dailyTraining: DailyTrainingPlan;
  onNavigatePlay: () => void;
  onNavigateLearn: () => void;
  onNavigateProgress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  playerModel,
  dailyTraining,
  onNavigatePlay,
  onNavigateLearn,
  onNavigateProgress
}) => {
  const { tokens, openDesignModal } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const primaryInsight = playerModel.recentObservations[0] ||
    "You've been attacking strongly this week, but you're leaving your king exposed.";

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 animate-in fade-in pb-24">
      {/* Personalized Coach Greeting */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h2 className={`text-xl font-bold ${tokens.appText} tracking-tight`}>
            {getGreeting()}, {playerModel.playerName}
          </h2>
          <p className={`text-xs ${tokens.appTextMuted}`}>
            Your offline AI coach is ready for today's match.
          </p>
        </div>
      </div>

      {/* Coach Insight Hero Card */}
      <div className={`${tokens.heroBg} border ${tokens.heroBorder} rounded-2xl p-4.5 ${tokens.cardShadow} relative overflow-hidden transition-all duration-200`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-full ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center`}>
            <Brain className={`w-3.5 h-3.5 ${tokens.accentBadgeText}`} />
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${tokens.accentBadgeText}`}>
            Coach Observation
          </span>
        </div>

        <p className={`text-sm font-semibold ${tokens.appText} leading-relaxed mb-3`}>
          "{primaryInsight}"
        </p>

        <div className={`flex items-center justify-between pt-2.5 border-t ${tokens.cardBorder}`}>
          <span className={`text-[11px] ${tokens.appTextMuted}`}>
            Based on your last 7 games
          </span>
          <button
            type="button"
            onClick={onNavigateLearn}
            className={`inline-flex items-center gap-1 text-xs font-bold ${tokens.accentBadgeText} hover:opacity-80 transition`}
          >
            <span>Work on this</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Play & Match Card */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4.5 ${tokens.cardShadow} space-y-3 transition-all duration-200`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
            Game Session
          </span>
          <span className={`text-[10px] ${tokens.accentBadgeText} ${tokens.accentBadgeBg} px-2 py-0.5 rounded-md border ${tokens.accentBadgeBorder} font-mono font-bold`}>
            Adaptive AI Opponent
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className={`text-base font-bold ${tokens.appText}`}>Play Tempo AI</h3>
            <p className={`text-xs ${tokens.appTextMuted}`}>
              Offline engine tuned to your playstyle
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigatePlay}
            className={`px-5 py-2.5 ${tokens.accentPrimary} ${tokens.accentPrimaryHover} text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Match</span>
          </button>
        </div>
      </div>

      {/* Today's Personalized Training */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4.5 ${tokens.cardShadow} space-y-3 transition-all duration-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
              Today's Training
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono font-bold">
            {dailyTraining.estimatedMinutes} min
          </span>
        </div>

        <div>
          <h4 className={`text-sm font-bold ${tokens.appText}`}>{dailyTraining.themeTitle}</h4>
          <p className={`text-xs ${tokens.appTextMuted} mt-0.5 leading-relaxed`}>
            {dailyTraining.themeDescription}
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateLearn}
          className={`w-full py-2.5 ${tokens.btnSecondaryBg} ${tokens.btnSecondaryHover} ${tokens.btnSecondaryText} text-xs font-bold rounded-xl border ${tokens.btnSecondaryBorder} transition flex items-center justify-center gap-1.5`}
        >
          <span>Start Daily Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Breakdown Preview */}
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl p-4.5 ${tokens.cardShadow} space-y-3 transition-all duration-200`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
            Skill Competency
          </span>
          <button
            type="button"
            onClick={onNavigateProgress}
            className="text-[11px] text-emerald-600 hover:underline font-bold"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {(Object.values(playerModel.skills) as SkillProfile[]).slice(0, 4).map(skill => (
            <div key={skill.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${tokens.appText}`}>{skill.label}</span>
                <span className={`font-mono text-[11px] font-bold ${tokens.appTextMuted}`}>{skill.score}%</span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

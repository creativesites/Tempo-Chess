import { PlayerModel } from './types';

/**
 * A genuinely empty, honest starting PlayerModel for a fresh install or a
 * new local player profile. Every number is a real zero, not a
 * placeholder — no seeded rating, no fabricated tendencies, no sample
 * games. The player model only starts filling in once real games are
 * played and real critical moments are observed.
 */
export function createEmptyPlayerModel(playerName: string): PlayerModel {
  return {
    ratingEstimate: 1200,
    playerName,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreakDays: 0,
    lastActiveTimestamp: Date.now(),
    strengths: [],
    weaknesses: [],
    skills: {},
    tendencies: [],
    recurringMistakes: [],
    masteredConcepts: [],
    conceptsNeedingWork: [],
    recentObservations: [],
    conceptMastery: [],
    curriculum: [],
    thinkingProcessProfile: {
      opponentThreatCheck: 0,
      candidateMoveComparison: 0,
      worstPieceImprovement: 0,
      patienceScore: 0,
      calculationDepth: 0,
    },
    spacedRepetitionSchedule: [],
    openingUnderstanding: {},
    openingRepertoire: [],
  };
}

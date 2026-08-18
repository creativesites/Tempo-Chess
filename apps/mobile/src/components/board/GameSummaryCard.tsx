import { Ionicons } from '@expo/vector-icons';
import { BotProfile } from '@tempo/chess';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import type { LiveGameSummary } from '@/hooks/game/useLiveGame';

interface GameSummaryCardProps {
  summary: LiveGameSummary;
  bot: BotProfile;
  onPlayAgain: () => void;
  onChangeOpponent: () => void;
}

const RESULT_COPY: Record<LiveGameSummary['result'], { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  win: { label: 'You won', icon: 'trophy' },
  loss: { label: 'You lost', icon: 'flag' },
  draw: { label: 'Draw', icon: 'remove-circle' },
};

/**
 * Every number here is computed directly from real move classifications
 * gathered during play (see useLiveGame) — no templated narrative, no
 * invented "frequency pattern" strings. If there's nothing real to say
 * yet, this simply doesn't say it.
 */
export function GameSummaryCard({ summary, bot, onPlayAgain, onChangeOpponent }: GameSummaryCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const copy = RESULT_COPY[summary.result];
  const resultColor = summary.result === 'win' ? theme.accent : summary.result === 'loss' ? theme.danger : theme.textSecondary;

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.headerRow}>
        <Ionicons name={copy.icon} size={22} color={resultColor} />
        <ThemedText type="subtitle" style={{ color: resultColor }}>
          {copy.label}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        vs {bot.name} ({bot.rating})
      </ThemedText>

      {summary.totalPlayerMoves > 0 ? (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText type="title" style={styles.statNumber}>
              {summary.playerAccuracyPercent}%
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Move accuracy
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <ThemedText type="title" style={[styles.statNumber, { color: theme.danger }]}>
              {summary.blunderCount + summary.mistakeCount}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Blunders/mistakes
            </ThemedText>
          </View>
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary" style={styles.noMoves}>
          Game ended before you made a move.
        </ThemedText>
      )}

      <View style={styles.actions}>
        <Pressable style={[styles.primaryBtn, { backgroundColor: theme.accent }]} onPress={onPlayAgain}>
          <ThemedText type="smallBold" style={{ color: '#04140C' }}>
            Rematch
          </ThemedText>
        </Pressable>
        <Pressable style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={onChangeOpponent}>
          <ThemedText type="smallBold">Change opponent</ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  statsRow: { flexDirection: 'row', gap: Spacing.five, marginTop: Spacing.two },
  stat: { gap: 2 },
  statNumber: { fontSize: 28, lineHeight: 32 },
  noMoves: { marginTop: Spacing.one },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  primaryBtn: { flex: 1, paddingVertical: Spacing.two, borderRadius: 12, alignItems: 'center' },
  secondaryBtn: { flex: 1, paddingVertical: Spacing.two, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
});

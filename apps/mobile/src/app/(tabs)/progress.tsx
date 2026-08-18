import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { AggregateStats, getAggregateStats, getPlayerModel, getRecentGames, SavedGameRow } from '@/storage';
import { PlayerModel } from '@tempo/player-model';

const RESULT_META: Record<SavedGameRow['result'], { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  win: { label: 'Win', icon: 'trophy' },
  loss: { label: 'Loss', icon: 'close-circle' },
  draw: { label: 'Draw', icon: 'remove-circle' },
};

/**
 * Every number here comes straight from SQLite — real games, real
 * classifications, real win/loss/draw counts. No seeded demo stats (see
 * product spec section 30): a fresh install starts at zero and only
 * shows what has actually happened.
 */
export default function ProgressScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [playerModel, setPlayerModel] = useState<PlayerModel | null>(null);
  const [games, setGames] = useState<SavedGameRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([getAggregateStats(), getPlayerModel('You'), getRecentGames(20)]).then(
        ([aggregateStats, model, recentGames]) => {
          if (cancelled) return;
          setStats(aggregateStats);
          setPlayerModel(model);
          setGames(recentGames);
        }
      );
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const hasGames = (stats?.totalGames ?? 0) > 0;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Progress
          </ThemedText>
        </View>

        {!hasGames ? (
          <View style={styles.empty}>
            <Ionicons name="trending-up-outline" size={40} color={theme.textSecondary} />
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No games yet
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyBody}>
              Play a few games and Tempo will start building your skill profile and behavioural
              patterns here.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={games}
            keyExtractor={(g) => g.id}
            ListHeaderComponent={
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <ThemedText type="title" style={styles.statNumber}>
                    {playerModel?.ratingEstimate}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Rating
                  </ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText type="title" style={styles.statNumber}>
                    {stats?.totalGames}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Games
                  </ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText type="title" style={[styles.statNumber, { color: theme.accent }]}>
                    {stats?.wins}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Wins
                  </ThemedText>
                </View>
                <View style={styles.statBox}>
                  <ThemedText type="title" style={[styles.statNumber, { color: theme.danger }]}>
                    {stats?.losses}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Losses
                  </ThemedText>
                </View>
              </View>
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const meta = RESULT_META[item.result];
              const resultColor = item.result === 'win' ? theme.accent : item.result === 'loss' ? theme.danger : theme.textSecondary;
              return (
                <View style={[styles.gameRow, { borderColor: theme.border }]}>
                  <Ionicons name={meta.icon} size={18} color={resultColor} />
                  <View style={styles.gameInfo}>
                    <ThemedText type="smallBold">
                      {meta.label} vs {item.opponentName} ({item.opponentRating})
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.openingName ?? 'Standard game'} · {item.movesCount} moves · {item.playerAccuracyPercent}% accuracy
                    </ThemedText>
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  headerTitle: { fontSize: 32, lineHeight: 38 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.five },
  emptyTitle: { marginTop: Spacing.one },
  emptyBody: { textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  statBox: { alignItems: 'center', gap: 2 },
  statNumber: { fontSize: 22, lineHeight: 26 },
  listContent: { paddingBottom: Spacing.six },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  gameInfo: { flex: 1, gap: 2 },
});

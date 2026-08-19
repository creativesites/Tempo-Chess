import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { getActiveChessEngineBackend, getChessEngine } from '@/native-chess-engine';
import { getCoachAI } from '@/native-ai';

interface EngineStatus {
  backend: 'native_stockfish' | 'fallback_ts_engine';
}

interface AiStatus {
  ready: boolean;
  downloadedCount: number;
  totalCount: number;
}

/**
 * Real, live status — not a static label. Resolves the actual chess
 * engine backend and queries the actual LocalCoachAI implementation, so
 * this screen tells the truth about what's running on this device.
 */
export default function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      getChessEngine().then(() => {
        if (!cancelled) {
          setEngineStatus({ backend: getActiveChessEngineBackend() ?? 'fallback_ts_engine' });
        }
      });

      const coachAI = getCoachAI();
      Promise.all([coachAI.isReady(), coachAI.listAvailableModels()]).then(([ready, models]) => {
        if (!cancelled) {
          setAiStatus({
            ready,
            downloadedCount: models.filter((m) => m.isDownloaded).length,
            totalCount: models.length,
          });
        }
      });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const engineLabel =
    engineStatus === null
      ? 'Checking…'
      : engineStatus.backend === 'native_stockfish'
        ? 'Native Stockfish'
        : 'Fallback engine (TypeScript)';

  const aiLabel =
    aiStatus === null
      ? 'Checking…'
      : aiStatus.ready
        ? 'Model loaded and ready'
        : aiStatus.downloadedCount > 0
          ? `${aiStatus.downloadedCount}/${aiStatus.totalCount} models downloaded, none loaded`
          : 'No model downloaded yet';

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Profile
          </ThemedText>
        </View>

        <View style={[styles.row, { borderColor: theme.border }]}>
          <Ionicons name="hardware-chip-outline" size={22} color={theme.textSecondary} />
          <View style={styles.rowInfo}>
            <ThemedText type="smallBold">Chess engine</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {engineLabel}
            </ThemedText>
          </View>
          {engineStatus === null && <ActivityIndicator size="small" color={theme.textSecondary} />}
        </View>

        <View style={[styles.row, { borderColor: theme.border }]}>
          <Ionicons name="sparkles-outline" size={22} color={theme.textSecondary} />
          <View style={styles.rowInfo}>
            <ThemedText type="smallBold">Local coach model</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {aiLabel}
            </ThemedText>
          </View>
          {aiStatus === null && <ActivityIndicator size="small" color={theme.textSecondary} />}
        </View>

        <View style={[styles.row, { borderColor: theme.border }]}>
          <Ionicons name="cloud-offline-outline" size={22} color={theme.textSecondary} />
          <View style={styles.rowInfo}>
            <ThemedText type="smallBold">Network</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Tempo runs fully offline — no account required
            </ThemedText>
          </View>
        </View>

        {/* Temporary dev entry point for the Skia board-rewrite smoke
            test (Phase B) — remove once Phase C's Canvas board ships. */}
        <Pressable style={[styles.row, { borderColor: theme.border }]} onPress={() => router.push('/skia-test')}>
          <Ionicons name="color-wand-outline" size={22} color={theme.textSecondary} />
          <View style={styles.rowInfo}>
            <ThemedText type="smallBold">Skia smoke test (dev)</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Verify the Skia canvas renders and responds to gestures on this device
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three },
  headerTitle: { fontSize: 32, lineHeight: 38 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { flex: 1, gap: 2 },
});

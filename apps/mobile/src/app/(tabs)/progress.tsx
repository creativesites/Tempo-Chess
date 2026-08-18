import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Honest empty state: the player model / game history persistence layer
 * (SQLite) hasn't landed yet, so this deliberately doesn't show seeded
 * or fabricated stats. See product spec section 30 — a fresh install
 * must not behave like it belongs to a pre-populated demo player.
 */
export default function ProgressScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Progress
          </ThemedText>
        </View>
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
});

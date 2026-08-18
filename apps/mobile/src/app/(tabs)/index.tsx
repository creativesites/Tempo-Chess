import { Ionicons } from '@expo/vector-icons';
import { CHESS_BOTS } from '@tempo/chess';
import { useColorScheme, StyleSheet, View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Play tab — the dominant Tempo experience (product spec section 10).
 * This is the pre-game bot picker; the live board (drag/tap-to-move,
 * clocks, coach overlay) is built in a follow-up pass — see
 * src/components/board once it lands.
 */
export default function PlayScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Play
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Pick an opponent. Tempo watches the whole game and coaches when it matters.
          </ThemedText>
        </View>

        <FlatList
          data={CHESS_BOTS}
          keyExtractor={(bot) => bot.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: bot }) => (
            <Pressable
              style={[
                styles.botCard,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <View style={[styles.botAvatar, { backgroundColor: bot.avatarBg }]}>
                <ThemedText style={{ color: bot.avatarTextColor, fontWeight: '700' }}>{bot.avatar}</ThemedText>
              </View>
              <View style={styles.botInfo}>
                <ThemedText type="smallBold">{bot.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {bot.title ?? bot.category} · {bot.rating}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  headerTitle: { fontSize: 32, lineHeight: 38 },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  botCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botInfo: { flex: 1, gap: 2 },
});

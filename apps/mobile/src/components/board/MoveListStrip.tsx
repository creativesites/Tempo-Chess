import { ChessMove } from '@tempo/shared';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface MoveListStripProps {
  moves: ChessMove[];
}

export function MoveListStrip({ moves }: MoveListStripProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (moves.length === 0) {
    return null;
  }

  const pairs: { num: number; white?: ChessMove; black?: ChessMove }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.strip, { borderColor: theme.border }]}
      contentContainerStyle={styles.content}
    >
      {pairs.map((pair) => (
        <View key={pair.num} style={styles.pair}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.num}>
            {pair.num}.
          </ThemedText>
          <ThemedText type="small" style={styles.san}>
            {pair.white?.san}
          </ThemedText>
          {pair.black && (
            <ThemedText type="small" style={styles.san}>
              {pair.black.san}
            </ThemedText>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { maxHeight: 30, borderTopWidth: StyleSheet.hairlineWidth },
  content: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.one, alignItems: 'center', gap: Spacing.three },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  num: { fontSize: 11 },
  san: { fontSize: 12, fontWeight: '600' },
});

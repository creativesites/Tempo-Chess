import { STRUCTURED_OPENING_LESSONS } from '@tempo/openings';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function LearnScreen() {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Learn
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Opening academy — why the moves work, not just what they are.
          </ThemedText>
        </View>

        <FlatList
          data={STRUCTURED_OPENING_LESSONS}
          keyExtractor={(lesson) => lesson.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: lesson }) => (
            <View style={styles.lessonRow}>
              <ThemedText type="smallBold">{lesson.lessonTitle}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {lesson.openingName}
                {lesson.variationName ? ` · ${lesson.variationName}` : ''} · {lesson.estimatedMinutes} min
              </ThemedText>
            </View>
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
  listContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  lessonRow: { gap: 2 },
});

import { THINKING_FRAMEWORK_STEPS } from '@tempo/coaching';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function TrainScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Train
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            The 7-step thinking framework. One habit at a time.
          </ThemedText>
        </View>

        <FlatList
          data={THINKING_FRAMEWORK_STEPS}
          keyExtractor={(step) => step.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: step }) => (
            <View style={[styles.stepRow, { borderColor: theme.border }]}>
              <View style={[styles.stepNumber, { backgroundColor: theme.accentMuted }]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {step.stepNumber}
                </ThemedText>
              </View>
              <View style={styles.stepInfo}>
                <ThemedText type="smallBold">{step.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {step.shortPrompt}
                </ThemedText>
              </View>
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
  listContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfo: { flex: 1, gap: 2 },
});

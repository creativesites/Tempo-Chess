import { Ionicons } from '@expo/vector-icons';
import { CoachIntervention } from '@tempo/coaching';
import { EvalShiftData } from '@tempo/game-review';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface CoachBubbleProps {
  intervention: CoachIntervention | null;
  evalShift: EvalShiftData | null;
  onDismissIntervention: () => void;
  onDismissEvalShift: () => void;
}

const LEVEL_ICON: Record<CoachIntervention['level'], keyof typeof Ionicons.glyphMap> = {
  celebration: 'sparkles',
  teaching_moment: 'bulb',
  gentle: 'chatbubble-ellipses',
  silent: 'chatbubble-ellipses',
};

/**
 * The coach is quiet most of the time — this only renders when there is
 * something worth saying, and only ever speaks about the player's own
 * moves (see @tempo/coaching's color-gated rules). Prefers a real
 * teaching intervention over a raw eval-shift hint when both are present.
 */
export function CoachBubble({ intervention, evalShift, onDismissIntervention, onDismissEvalShift }: CoachBubbleProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (intervention) {
    return (
      <Animated.View
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(150)}
        style={[styles.card, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}
      >
        <Ionicons name={LEVEL_ICON[intervention.level]} size={18} color={theme.accent} />
        <View style={styles.textCol}>
          {intervention.title && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {intervention.title}
            </ThemedText>
          )}
          <ThemedText type="small">{intervention.message}</ThemedText>
        </View>
        <Pressable onPress={onDismissIntervention} hitSlop={10}>
          <Ionicons name="close" size={16} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>
    );
  }

  if (evalShift) {
    const isGood = evalShift.type === 'breakthrough' || evalShift.type === 'missed_opportunity';
    return (
      <Animated.View
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(150)}
        style={[
          styles.card,
          { backgroundColor: isGood ? theme.accentMuted : `${theme.danger}22`, borderColor: isGood ? theme.accent : theme.danger },
        ]}
      >
        <Ionicons
          name={isGood ? 'trending-up' : 'warning'}
          size={18}
          color={isGood ? theme.accent : theme.danger}
        />
        <View style={styles.textCol}>
          <ThemedText type="small">{evalShift.hintSentence}</ThemedText>
        </View>
        <Pressable onPress={onDismissEvalShift} hitSlop={10}>
          <Ionicons name="close" size={16} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  textCol: { flex: 1, gap: 2 },
});

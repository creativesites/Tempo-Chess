import { Ionicons } from '@expo/vector-icons';
import { BotProfile } from '@tempo/chess';
import { Color } from '@tempo/shared';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

interface BotPickerProps {
  bots: BotProfile[];
  onStart: (bot: BotProfile, color: Color) => void;
}

const COLOR_OPTIONS: { id: Color; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'w', label: 'White', icon: 'sunny' },
  { id: 'b', label: 'Black', icon: 'moon' },
];

export function BotPicker({ bots, onStart }: BotPickerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [color, setColor] = useState<Color>('w');

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

        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((opt) => {
            const active = color === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setColor(opt.id)}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: active ? theme.accentMuted : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}
              >
                <Ionicons name={opt.icon} size={16} color={active ? theme.accent : theme.textSecondary} />
                <ThemedText type="smallBold" style={active ? { color: theme.accent } : undefined}>
                  Play as {opt.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={bots}
          keyExtractor={(bot) => bot.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: bot }) => (
            <Pressable
              onPress={() => onStart(bot, color)}
              style={[styles.botCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
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
  header: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.two, gap: Spacing.one },
  headerTitle: { fontSize: 32, lineHeight: 38 },
  colorRow: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  colorOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  listContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  botCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  botAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  botInfo: { flex: 1, gap: 2 },
});

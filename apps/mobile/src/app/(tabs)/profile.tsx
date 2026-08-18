import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

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
            <ThemedText type="smallBold">Local coach model</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Not installed yet
            </ThemedText>
          </View>
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
  rowInfo: { gap: 2 },
});

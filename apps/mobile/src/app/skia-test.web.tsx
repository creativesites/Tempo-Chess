import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

/**
 * @shopify/react-native-skia's web backend loads CanvasKit as WASM
 * asynchronously — Skia.Path.MakeFromSVGString isn't available at module
 * evaluation time the way it is on native's synchronous JSI binding, and
 * this smoke test exists to de-risk the *native* Skia board rewrite, not
 * to prove out a separate web WASM loading path. Kept as a simple stub so
 * Metro's web bundle never even attempts to import Skia here — see
 * @/native-chess-engine/index.web.ts for the same platform-split pattern.
 */
export default function SkiaTestWebStub() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Skia smoke test</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
        This screen only runs on a native build (Android/iOS) — it verifies the Skia canvas on real device
        hardware ahead of the board rewrite. Use a preview build to test it.
      </ThemedText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  body: { textAlign: 'center' },
});

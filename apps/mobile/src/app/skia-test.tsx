import { Canvas, Fill, Group, Path, Skia } from '@shopify/react-native-skia';
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

// Same knight path data as ChessPiece.tsx's 'n' case — reused verbatim to
// prove Skia.Path.MakeFromSVGString can parse the real piece art before
// committing to the full board rewrite.
const KNIGHT_PATH_D =
  'M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18 ' +
  'M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10';

const knightPath = Skia.Path.MakeFromSVGString(KNIGHT_PATH_D);

/**
 * De-risk smoke test for the Skia board rewrite (Part 2 of the board
 * rework plan): a colored rect, one piece parsed from the real SVG path
 * data, one pan gesture moving it. Proves Skia links and responds to
 * gestures on real hardware under Expo SDK 57 New Architecture before the
 * full board investment. Reachable from Profile > "Skia smoke test" — not
 * part of the normal app flow, remove once Phase C ships.
 */
export default function SkiaTestScreen() {
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(width - 32, 360);
  const pieceScale = canvasSize / 45 / 3;

  const x = useSharedValue(canvasSize / 2 - 22.5 * pieceScale);
  const y = useSharedValue(canvasSize / 2 - 22.5 * pieceScale);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const [dropCount, setDropCount] = useState(0);

  const transform = useDerivedValue(() => [{ translateX: x.value }, { translateY: y.value }, { scale: pieceScale }]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((e) => {
      x.value = startX.value + e.translationX;
      y.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(setDropCount)(dropCount + 1);
    });

  if (!knightPath) {
    return (
      <SafeAreaView style={styles.flex}>
        <ThemedText>Skia.Path.MakeFromSVGString failed to parse the piece path.</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.header}>
        <ThemedText type="title">Skia smoke test</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Drag the knight. Drops so far: {dropCount}
        </ThemedText>
      </View>

      <GestureDetector gesture={pan}>
        <View style={{ width: canvasSize, height: canvasSize }}>
          <Canvas style={{ width: canvasSize, height: canvasSize }}>
            <Fill color="#B58863" />
            <Group transform={transform}>
              <Path path={knightPath} color="#F8FAFC" style="fill" />
              <Path path={knightPath} color="#0F172A" style="stroke" strokeWidth={1.5} />
            </Group>
          </Canvas>
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: 'center' },
  header: { alignItems: 'center', gap: 4, paddingVertical: 24 },
});

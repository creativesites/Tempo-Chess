import { Color, MaterialState, PieceSymbol } from '@tempo/shared';
import { StyleSheet, View } from 'react-native';

import { ChessPiece } from './ChessPiece';
import { ThemedText } from '@/components/themed-text';

interface CapturedRowProps {
  captured: PieceSymbol[];
  pieceColor: Color;
  advantage: number;
}

const ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

export function CapturedRow({ captured, pieceColor, advantage }: CapturedRowProps) {
  if (captured.length === 0 && advantage <= 0) {
    return <View style={styles.spacer} />;
  }
  const sorted = [...captured].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

  return (
    <View style={styles.row}>
      {sorted.map((type, i) => (
        <View key={`${type}-${i}`} style={styles.piece}>
          <ChessPiece type={type} color={pieceColor} size={14} />
        </View>
      ))}
      {advantage > 0 && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.advantage}>
          +{advantage}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 16 },
  piece: { marginRight: -4 },
  advantage: { marginLeft: 6, fontSize: 11 },
  spacer: { height: 16 },
});

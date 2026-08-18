import { Color, PieceSymbol, Square } from '@tempo/shared';
import { Chess, Square as ChessJsSquare } from 'chess.js';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ChessPiece } from './ChessPiece';
import { BOARD_THEMES, BoardTheme } from './boardThemes';
import { Colors } from '@/constants/theme';

export interface ChessBoardProps {
  fen: string;
  playerColor?: Color;
  flipped?: boolean;
  theme?: BoardTheme;
  size: number;
  lastMove?: { from: Square; to: Square } | null;
  onMove?: (from: Square, to: Square, promotion?: PieceSymbol) => void;
  disabled?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function squareToRowCol(sq: Square, flipped: boolean) {
  const file = sq.charCodeAt(0) - 97; // 0..7 (a..h)
  const rank = parseInt(sq[1], 10); // 1..8
  const col = flipped ? 7 - file : file;
  const row = flipped ? rank - 1 : 8 - rank;
  return { row, col };
}

function rowColToSquare(row: number, col: number, flipped: boolean): Square {
  const file = flipped ? 7 - col : col;
  const rank = flipped ? row + 1 : 8 - row;
  return `${FILES[file]}${rank}` as Square;
}

export function ChessBoard({
  fen,
  playerColor = 'w',
  flipped,
  theme = 'nordic_slate',
  size,
  lastMove,
  onMove,
  disabled = false,
}: ChessBoardProps) {
  const scheme = useColorScheme();
  const appTheme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const boardTheme = BOARD_THEMES[theme] ?? BOARD_THEMES.nordic_slate;
  const isFlipped = flipped ?? playerColor === 'b';
  const cell = size / 8;

  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [dragSquare, setDragSquare] = useState<Square | null>(null);

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragActive = useSharedValue(false);

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const turn = chess.turn() as Color;
  const isCheck = chess.isCheck();

  let checkSquare: Square | null = null;
  if (isCheck) {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          checkSquare = `${FILES[c]}${8 - r}` as Square;
        }
      }
    }
  }

  const clearSelection = () => {
    setSelected(null);
    setLegalTargets([]);
  };

  const attemptMove = (from: Square, to: Square) => {
    const piece = chess.get(from as ChessJsSquare);
    const isPawn = piece?.type === 'p';
    const isPromotionRank = (piece?.color === 'w' && to.endsWith('8')) || (piece?.color === 'b' && to.endsWith('1'));

    if (isPawn && isPromotionRank) {
      setPendingPromotion({ from, to });
      return;
    }
    onMove?.(from, to);
    clearSelection();
  };

  const selectSquare = (sq: Square) => {
    const piece = chess.get(sq as ChessJsSquare);
    if (piece && piece.color === turn) {
      setSelected(sq);
      const moves = chess.moves({ square: sq as ChessJsSquare, verbose: true });
      setLegalTargets(moves.map((m) => m.to as Square));
    } else {
      clearSelection();
    }
  };

  const handleSquarePress = (sq: Square) => {
    if (disabled || pendingPromotion) return;

    if (selected === sq) {
      clearSelection();
      return;
    }
    if (selected && legalTargets.includes(sq)) {
      attemptMove(selected, sq);
      return;
    }
    selectSquare(sq);
  };

  const finishDrag = (fromSquare: Square, dropRow: number, dropCol: number) => {
    setDragSquare(null);
    dragActive.value = false;
    const clampedRow = Math.min(7, Math.max(0, dropRow));
    const clampedCol = Math.min(7, Math.max(0, dropCol));
    const toSquare = rowColToSquare(clampedRow, clampedCol, isFlipped);

    if (toSquare === fromSquare) {
      // Treated as a tap: leave the piece selected so the player can tap a target next.
      return;
    }
    const moves = chess.moves({ square: fromSquare as ChessJsSquare, verbose: true });
    const isLegal = moves.some((m) => m.to === toSquare);
    if (isLegal) {
      attemptMove(fromSquare, toSquare);
    } else {
      clearSelection();
    }
  };

  const makeDragGesture = (sq: Square, canDrag: boolean) => {
    const origin = squareToRowCol(sq, isFlipped);
    return Gesture.Pan()
      .enabled(canDrag && !disabled && !pendingPromotion)
      .minDistance(4)
      .onStart(() => {
        dragActive.value = true;
        dragX.value = 0;
        dragY.value = 0;
        runOnJS(selectSquare)(sq);
        runOnJS(setDragSquare)(sq);
      })
      .onUpdate((e) => {
        dragX.value = e.translationX;
        dragY.value = e.translationY;
      })
      .onEnd((e) => {
        const absoluteX = (origin.col + 0.5) * cell + e.translationX;
        const absoluteY = (origin.row + 0.5) * cell + e.translationY;
        const dropCol = Math.floor(absoluteX / cell);
        const dropRow = Math.floor(absoluteY / cell);
        dragX.value = withTiming(0, { duration: 120 });
        dragY.value = withTiming(0, { duration: 120 });
        runOnJS(finishDrag)(sq, dropRow, dropCol);
      });
  };

  const draggedPieceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
    opacity: dragActive.value ? 1 : 0,
  }));

  const squares: React.ReactElement[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = rowColToSquare(row, col, isFlipped);
      const isDark = (row + col) % 2 === 1;
      const piece = chess.get(sq as ChessJsSquare);
      const isSelected = selected === sq;
      const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
      const isLegalTarget = legalTargets.includes(sq);
      const isInCheck = checkSquare === sq;
      const isBeingDragged = dragSquare === sq;
      const canDrag = !!piece && piece.color === turn;

      squares.push(
        <Pressable
          key={sq}
          onPress={() => handleSquarePress(sq)}
          style={[
            styles.square,
            {
              width: cell,
              height: cell,
              left: col * cell,
              top: row * cell,
              backgroundColor: isDark ? boardTheme.dark : boardTheme.light,
            },
          ]}
        >
          {isLastMove && <View style={[StyleSheet.absoluteFill, { backgroundColor: boardTheme.lastMove }]} />}
          {isInCheck && <View style={[StyleSheet.absoluteFill, styles.checkGlow]} />}
          {isSelected && <View style={[StyleSheet.absoluteFill, { backgroundColor: boardTheme.selected }]} />}

          {isLegalTarget &&
            (piece ? (
              <View style={[styles.captureRing, { width: cell, height: cell, borderRadius: cell / 2 }]} />
            ) : (
              <View style={[styles.moveDot, { width: cell * 0.28, height: cell * 0.28, borderRadius: cell * 0.14 }]} />
            ))}

          {piece && !isBeingDragged && (
            <GestureDetector gesture={makeDragGesture(sq, canDrag)}>
              <View style={styles.pieceWrap}>
                <ChessPiece type={piece.type as PieceSymbol} color={piece.color as Color} size={cell * 0.86} />
              </View>
            </GestureDetector>
          )}
        </Pressable>
      );
    }
  }

  const draggedPiece = dragSquare ? chess.get(dragSquare as ChessJsSquare) : null;
  const draggedOrigin = dragSquare ? squareToRowCol(dragSquare, isFlipped) : null;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.board,
          { width: size, height: size, borderColor: boardTheme.border, backgroundColor: appTheme.backgroundElement },
        ]}
      >
        {squares}

        {draggedPiece && draggedOrigin && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pieceWrap,
              styles.draggedPiece,
              {
                width: cell,
                height: cell,
                left: draggedOrigin.col * cell,
                top: draggedOrigin.row * cell,
              },
              draggedPieceStyle,
            ]}
          >
            <ChessPiece type={draggedPiece.type as PieceSymbol} color={draggedPiece.color as Color} size={cell * 0.95} />
          </Animated.View>
        )}
      </View>

      <Modal visible={!!pendingPromotion} transparent animationType="fade">
        <View style={styles.promotionBackdrop}>
          <View style={[styles.promotionCard, { backgroundColor: appTheme.backgroundElement, borderColor: appTheme.border }]}>
            {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pt) => (
              <Pressable
                key={pt}
                style={[styles.promotionOption, { borderColor: appTheme.border }]}
                onPress={() => {
                  if (pendingPromotion) {
                    onMove?.(pendingPromotion.from, pendingPromotion.to, pt);
                  }
                  setPendingPromotion(null);
                  clearSelection();
                }}
              >
                <ChessPiece type={pt} color={playerColor} size={40} />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  square: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggedPiece: {
    position: 'absolute',
    zIndex: 50,
  },
  moveDot: {
    position: 'absolute',
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  captureRing: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(15,23,42,0.35)',
  },
  checkGlow: {
    backgroundColor: 'rgba(220,38,38,0.55)',
  },
  promotionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  promotionOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

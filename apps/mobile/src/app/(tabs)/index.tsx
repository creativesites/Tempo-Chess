import { Ionicons } from '@expo/vector-icons';
import { createEmptyPlayerModel } from '@tempo/player-model';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotPicker } from '@/components/board/BotPicker';
import { CapturedRow } from '@/components/board/CapturedRow';
import { ChessBoard } from '@/components/board/ChessBoard';
import { CoachBubble } from '@/components/board/CoachBubble';
import { GameSummaryCard } from '@/components/board/GameSummaryCard';
import { MoveListStrip } from '@/components/board/MoveListStrip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useLiveGame } from '@/hooks/game/useLiveGame';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function PlayScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - Spacing.four * 2, 520);

  // No persistence layer yet (that's Phase 6) — a real, honest, empty
  // player model rather than fabricated demo stats. "You" until the
  // player sets a name in Profile.
  const playerModel = useMemo(() => createEmptyPlayerModel('You'), []);
  const game = useLiveGame(playerModel, 'You');
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return (
      <BotPicker
        bots={game.availableBots}
        onStart={(bot, color) => {
          setHasStarted(true);
          game.newGame(color, bot);
        }}
      />
    );
  }

  const bot = game.selectedBot;
  const opponentCapture = game.playerColor === 'w' ? game.material.capturedByBlack : game.material.capturedByWhite;
  const playerCapture = game.playerColor === 'w' ? game.material.capturedByWhite : game.material.capturedByBlack;
  const opponentAdvantage = game.playerColor === 'w' ? Math.max(0, -game.material.advantage) : Math.max(0, game.material.advantage);
  const playerAdvantage = game.playerColor === 'w' ? Math.max(0, game.material.advantage) : Math.max(0, -game.material.advantage);
  const opponentToMove = !game.isPlayerTurn && game.isGameActive;
  const playerToMove = game.isPlayerTurn;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.bar}>
          <Pressable
            onPress={() => {
              setHasStarted(false);
            }}
            style={styles.opponentIdentity}
          >
            <View style={[styles.avatar, { backgroundColor: bot.avatarBg }]}>
              <ThemedText style={{ color: bot.avatarTextColor, fontWeight: '700', fontSize: 12 }}>{bot.avatar}</ThemedText>
            </View>
            <View>
              <View style={styles.nameRow}>
                <ThemedText type="smallBold">{bot.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {bot.rating}
                </ThemedText>
              </View>
              <CapturedRow captured={opponentCapture} pieceColor={game.playerColor === 'w' ? 'b' : 'w'} advantage={opponentAdvantage} />
            </View>
          </Pressable>

          <View
            style={[
              styles.clock,
              {
                backgroundColor: opponentToMove ? theme.accentMuted : theme.backgroundElement,
                borderColor: opponentToMove ? theme.accent : theme.border,
              },
            ]}
          >
            {game.isBotThinking && <Ionicons name="ellipsis-horizontal" size={12} color={theme.accent} style={styles.thinkingIcon} />}
            <ThemedText type="smallBold" style={opponentToMove ? { color: theme.accent } : undefined}>
              {formatTime(game.opponentTimeSec)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.boardWrap}>
          <ChessBoard
            fen={game.fen}
            playerColor={game.playerColor}
            size={boardSize}
            lastMove={game.lastMove}
            onMove={game.makePlayerMove}
            disabled={!game.isPlayerTurn}
          />
        </View>

        <View style={styles.bar}>
          <View style={styles.opponentIdentity}>
            <View style={[styles.avatar, { backgroundColor: theme.accentMuted }]}>
              <ThemedText style={{ color: theme.accent, fontWeight: '700', fontSize: 12 }}>
                {game.playerName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View>
              <View style={styles.nameRow}>
                <ThemedText type="smallBold">{game.playerName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {playerModel.gamesPlayed > 0 ? playerModel.ratingEstimate : 'New player'}
                </ThemedText>
              </View>
              <CapturedRow captured={playerCapture} pieceColor={game.playerColor} advantage={playerAdvantage} />
            </View>
          </View>

          <View
            style={[
              styles.clock,
              {
                backgroundColor: playerToMove ? theme.accentMuted : theme.backgroundElement,
                borderColor: playerToMove ? theme.accent : theme.border,
              },
            ]}
          >
            <ThemedText type="smallBold" style={playerToMove ? { color: theme.accent } : undefined}>
              {formatTime(game.playerTimeSec)}
            </ThemedText>
          </View>
        </View>

        <CoachBubble
          intervention={game.activeIntervention}
          evalShift={game.activeEvalShift}
          onDismissIntervention={game.dismissIntervention}
          onDismissEvalShift={game.dismissEvalShift}
        />

        {game.summary ? (
          <GameSummaryCard
            summary={game.summary}
            bot={bot}
            onPlayAgain={() => game.newGame(game.playerColor, bot)}
            onChangeOpponent={() => setHasStarted(false)}
          />
        ) : (
          <>
            <MoveListStrip moves={game.moveHistory} />
            <View style={styles.controls}>
              <Pressable
                style={[styles.controlBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
                onPress={game.takeback}
                disabled={game.moveHistory.length === 0 || !game.isGameActive}
              >
                <Ionicons name="arrow-undo" size={16} color={theme.text} />
                <ThemedText type="small">Takeback</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.controlBtn, styles.controlBtnCompact, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
                onPress={game.resign}
                disabled={!game.isGameActive}
              >
                <Ionicons name="flag" size={16} color={theme.danger} />
              </Pressable>
              <Pressable
                style={[styles.controlBtn, styles.controlBtnCompact, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
                onPress={() => game.newGame(game.playerColor, bot)}
              >
                <Ionicons name="refresh" size={16} color={theme.text} />
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
  },
  opponentIdentity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clock: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thinkingIcon: { marginRight: 2 },
  boardWrap: { alignItems: 'center', paddingVertical: Spacing.two },
  controls: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
  },
  // Note: the base controlBtn's `flex: 1` sets flex-basis: 0%, which beats
  // an explicit width in flex layout even with flexGrow/Shrink zeroed —
  // flexBasis must be overridden explicitly too, or this collapses to ~0
  // width on react-native-web.
  controlBtnCompact: { flexGrow: 0, flexShrink: 0, flexBasis: 44, width: 44 },
});

import { Chess } from 'chess.js';
import { ChessMove, Color, Square, PieceSymbol } from '@tempo/shared';
import { PlayerModel } from '@tempo/player-model';
import { defaultChessEngine } from '@tempo/chess';
import { EvalShiftData, EvalShiftType } from './types';

export class EvalShiftDetector {
  /**
   * Thresholds in centipawns to trigger an overlay popup.
   * A shift > 140 cp (1.4 pawns) represents a significant blunder or tactical shift.
   */
  public static readonly SIGNIFICANT_SHIFT_THRESHOLD_CP = 140;

  /**
   * Generates an Elo-tailored, single-sentence tactical hint or strategic warning.
   */
  public static generateEloTailoredHint(
    category: 'tactics' | 'king_safety' | 'hanging_piece' | 'fork_pin' | 'pawn_structure' | 'piece_activity',
    isPlayerBlunder: boolean,
    userElo: number,
    suggestedMoveSan?: string,
    pieceType?: PieceSymbol,
    involvedSquare?: Square
  ): string {
    const isBeginner = userElo < 1000;
    const isIntermediate = userElo >= 1000 && userElo < 1600;
    const isAdvanced = userElo >= 1600;

    if (category === 'hanging_piece') {
      if (isPlayerBlunder) {
        if (isBeginner) {
          return `Check your undefended pieces—a free piece was left unprotected on ${involvedSquare || 'the board'}.`;
        }
        if (isIntermediate) {
          return `A piece on ${involvedSquare || 'the board'} is lacking sufficient tactical defense against opponent attackers.`;
        }
        return `Tactical overload: an undefended piece on ${involvedSquare || 'the sector'} compromised your defensive equilibrium.`;
      } else {
        if (isBeginner) {
          return `Opponent left a piece undefended—look for an immediate free capture!`;
        }
        if (isIntermediate) {
          return `Your opponent has a loose, undefended piece available for immediate tactical exploitation.`;
        }
        return `Loose piece vulnerability detected: capitalize on the opponent's uncoordinated tactical alignment.`;
      }
    }

    if (category === 'fork_pin') {
      if (isPlayerBlunder) {
        if (isBeginner) {
          return `Watch out for double attacks—two of your pieces can be attacked at the same time.`;
        }
        if (isIntermediate) {
          return `Beware of geometric tactics like forks or pins targeting your high-value pieces.`;
        }
        return `A tactical fork or alignment vulnerability allows your opponent to win forced material.`;
      } else {
        if (isBeginner) {
          return `Look for a fork or double attack to capture your opponent's material!`;
        }
        if (isIntermediate) {
          return `A fork, pin, or skewer tactic is now available to seize decisive material advantage.`;
        }
        return `Exploit the tactical motif: force an advantageous piece exchange or decisive material gain.`;
      }
    }

    if (category === 'king_safety') {
      if (isPlayerBlunder) {
        if (isBeginner) {
          return `Your King is exposed to checkmate threats—keep your king shielded behind your pawns.`;
        }
        if (isIntermediate) {
          return `King safety alert: open diagonals and files are allowing dangerous attacking vectors toward your monarch.`;
        }
        return `Critical king shelter breakdown: calculate defensive retreat squares to parry the impending mating net.`;
      } else {
        if (isBeginner) {
          return `Opponent's king is wide open—bring all your attacking pieces forward!`;
        }
        if (isIntermediate) {
          return `The enemy king shield is shattered—mobilize rooks and queen to coordinate a direct attack.`;
        }
        return `Decisive king-hunt opportunity: execute the attacking breakthrough before defensive reinforcements arrive.`;
      }
    }

    if (category === 'pawn_structure') {
      if (isPlayerBlunder) {
        if (isBeginner) {
          return `Try to keep your pawns connected so they can protect each other.`;
        }
        if (isIntermediate) {
          return `Pawn structure damage: created an isolated or doubled pawn that becomes an easy target.`;
        }
        return `Positional compromise: structural weaknesses on the pawn chain allow permanent outpost infiltration.`;
      } else {
        if (isBeginner) {
          return `Push your passed pawn forward towards promotion!`;
        }
        if (isIntermediate) {
          return `Target the opponent's weak isolated pawn and establish a strong knight outpost in front of it.`;
        }
        return `Exploit structural asymmetry by locking the pawn chain and executing the thematic minority attack.`;
      }
    }

    // Default Piece Activity / General Tactics
    if (isPlayerBlunder) {
      if (isBeginner) {
        return `That move gave away an easy advantage—always scan for checks, captures, and threats before moving.`;
      }
      if (isIntermediate) {
        return suggestedMoveSan
          ? `A missed tactical defensive resource: candidate move ${suggestedMoveSan} preserves equality.`
          : `That move yielded the initiative and opened tactical counterplay for your opponent.`;
      }
      return suggestedMoveSan
        ? `Evaluation dropped significantly: ${suggestedMoveSan} was essential to maintain piece coordination.`
        : `Positional collapse: dynamic compensation was surrendered under engine scrutiny.`;
    } else {
      if (isBeginner) {
        return `Great job! You found an excellent move that took control of the game.`;
      }
      if (isIntermediate) {
        return suggestedMoveSan
          ? `Decisive breakthrough achieved—maintain piece pressure and convert with ${suggestedMoveSan}.`
          : `You seized a dominant evaluation swing through superior piece coordination.`;
      }
      return `Masterful execution: converted positional pressure into a concrete, winning advantage.`;
    }
  }

  /**
   * Analyzes an updated position against the previous evaluation to detect significant shifts.
   */
  public static async checkEvalShift(
    fenBefore: string,
    fenAfter: string,
    lastMove: ChessMove,
    playerColor: Color,
    playerModel: PlayerModel
  ): Promise<EvalShiftData | null> {
    try {
      // 1. Run quick depth analysis for before and after
      const analysisBefore = await defaultChessEngine.analyze(fenBefore, { depth: 3 });
      const analysisAfter = await defaultChessEngine.analyze(fenAfter, { depth: 3 });

      // Convert engine evaluations relative to playerColor
      // In engine, positive eval is always White advantage
      const playerSign = playerColor === 'w' ? 1 : -1;
      const playerEvalBefore = analysisBefore.evaluationCp * playerSign;
      const playerEvalAfter = analysisAfter.evaluationCp * playerSign;

      const evalDelta = playerEvalAfter - playerEvalBefore;
      const isPlayerMove = lastMove.color === playerColor;
      const userElo = playerModel.ratingEstimate || 1200;

      // Check if shift meets significant threshold
      if (Math.abs(evalDelta) < this.SIGNIFICANT_SHIFT_THRESHOLD_CP) {
        return null;
      }

      // Determine category and shift type
      let type: EvalShiftType = 'mistake';
      let category: 'tactics' | 'king_safety' | 'hanging_piece' | 'fork_pin' | 'pawn_structure' | 'piece_activity' = 'tactics';

      const chess = new Chess(fenAfter);

      // Check for hanging piece or fork
      if (lastMove.captured) {
        category = 'tactics';
      } else if (chess.inCheck()) {
        category = 'king_safety';
      } else if (lastMove.piece === 'p') {
        category = 'pawn_structure';
      }

      if (isPlayerMove) {
        if (evalDelta <= -250) {
          type = 'blunder';
        } else if (evalDelta <= -140) {
          type = 'mistake';
        } else if (evalDelta >= 200) {
          type = 'breakthrough';
        }
      } else {
        // Opponent move
        if (evalDelta >= 200) {
          type = 'missed_opportunity'; // Opponent blundered into player's hands
        } else if (evalDelta <= -200) {
          type = 'tactical_alarm'; // Opponent found a killer blow
        }
      }

      const isNegativeForPlayer = evalDelta < 0;

      const hintSentence = this.generateEloTailoredHint(
        category,
        isNegativeForPlayer,
        userElo,
        analysisAfter.bestMoveSan,
        lastMove.piece,
        lastMove.to
      );

      return {
        id: `shift_${Date.now()}`,
        type,
        evalBeforeCp: playerEvalBefore,
        evalAfterCp: playerEvalAfter,
        deltaCp: evalDelta,
        userElo,
        hintSentence,
        category,
        suggestedMoveSan: analysisAfter.bestMoveSan,
        fromSquare: lastMove.from,
        toSquare: lastMove.to,
        isPlayerMove,
        timestamp: Date.now()
      };
    } catch (e) {
      console.error('Error analyzing eval shift:', e);
      return null;
    }
  }
}

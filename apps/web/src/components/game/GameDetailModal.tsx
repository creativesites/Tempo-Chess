import React, { useState, useEffect } from 'react';
import { SavedGameRecord, Color } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { PgnUtils } from '@tempo/chess';
import { Chess } from 'chess.js';
import { ChessBoard } from '../chess/ChessBoard';
import {
  Trophy,
  Brain,
  Copy,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  FileText,
  Calendar,
  Layers,
  Award,
  Download,
  Database
} from 'lucide-react';

interface GameDetailModalProps {
  game: SavedGameRecord;
  onClose: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, onClose }) => {
  const { tokens, boardTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'summary' | 'pgn' | 'replay'>('summary');
  const [copiedPgn, setCopiedPgn] = useState(false);

  // Replay board state
  const [replayFen, setReplayFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [replayMoves, setReplayMoves] = useState<string[]>([]);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(-1);

  const isWin = game.result === 'win';
  const isLoss = game.result === 'loss';
  const isDraw = game.result === 'draw';

  useEffect(() => {
    try {
      const parsed = PgnUtils.parsePgn(game.pgn);
      setReplayMoves(parsed.movesSan);
      setCurrentMoveIdx(-1);
      setReplayFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    } catch (e) {
      console.warn('Could not parse PGN for game detail', e);
    }
  }, [game]);

  const handleStepMove = (targetIdx: number) => {
    if (targetIdx < -1 || targetIdx >= replayMoves.length) return;

    const chess = new Chess();
    for (let i = 0; i <= targetIdx; i++) {
      chess.move(replayMoves[i]);
    }
    setReplayFen(chess.fen());
    setCurrentMoveIdx(targetIdx);
  };

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(game.pgn);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleDownloadPgn = () => {
    const blob = new Blob([game.pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `game-${game.id}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header Ribbon */}
        <div className={`p-4 border-b ${
          isWin ? 'bg-emerald-50 border-emerald-200' : isLoss ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
        } flex items-start justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isWin ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : isLoss ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {isWin ? <Trophy className="w-3 h-3 text-amber-500" /> : <Brain className="w-3 h-3 text-rose-600" />}
                <span>{isWin ? 'Victory' : isLoss ? 'Learning Match' : 'Draw'}</span>
              </span>

              <span className="text-[10px] font-mono text-slate-500">
                {new Date(game.timestamp).toLocaleDateString()}
              </span>
            </div>

            <h2 className={`text-base font-bold text-slate-900`}>{game.headline || game.openingName}</h2>
            <p className="text-xs text-slate-600 mt-0.5">{game.openingName} • {game.movesCount} moves</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex border-b ${tokens.cardBorder} ${tokens.pillBg} p-1 gap-1`}>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'summary'
                ? `${tokens.cardBg} ${tokens.appText} shadow-2xs border ${tokens.cardBorder}`
                : `${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            Summary & Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pgn')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'pgn'
                ? `${tokens.cardBg} ${tokens.appText} shadow-2xs border ${tokens.cardBorder}`
                : `${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>PGN Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('replay')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'replay'
                ? `${tokens.cardBg} ${tokens.appText} shadow-2xs border ${tokens.cardBorder}`
                : `${tokens.appTextMuted} hover:${tokens.appText}`
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Move Replay</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
          {activeTab === 'summary' && (
            <div className="space-y-3">
              {/* Accuracy Bar */}
              <div className={`grid grid-cols-2 gap-3 ${tokens.pillBg} p-3 rounded-xl border ${tokens.pillBorder}`}>
                <div>
                  <span className={`text-[10px] uppercase font-bold ${tokens.appTextSubtle} tracking-wider block`}>
                    {game.playerName} Accuracy
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-emerald-600 font-mono">
                      {game.accuracyWhite}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className={`text-[10px] uppercase font-bold ${tokens.appTextSubtle} tracking-wider block`}>
                    {game.opponentName} Accuracy
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-xl font-black ${tokens.appText} font-mono`}>
                      {game.accuracyBlack}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Coach Overview */}
              {game.review?.overviewSummary && (
                <div className={`${tokens.cardBg} p-3.5 rounded-xl border ${tokens.cardBorder} space-y-1 shadow-2xs`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coach Game Overview</span>
                  </div>
                  <p className={`${tokens.appText} text-xs leading-relaxed`}>
                    {game.review.overviewSummary}
                  </p>
                </div>
              )}

              {/* Biggest Lesson */}
              {game.review?.biggestLesson && (
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Key Tactical Lesson
                  </span>
                  <p className="text-xs font-semibold text-amber-950 italic">
                    "{game.review.biggestLesson}"
                  </p>
                </div>
              )}

              {/* Turning Points List */}
              {game.review?.moments && game.review.moments.length > 0 && (
                <div className="space-y-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                    Key Moments ({game.review.moments.length})
                  </span>
                  <div className="space-y-2">
                    {game.review.moments.map(moment => (
                      <div
                        key={moment.id}
                        className={`${tokens.cardBg} p-2.5 rounded-xl border ${tokens.cardBorder} space-y-1`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${tokens.appText}`}>
                            Move {moment.moveNumber}: {moment.headline}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            moment.classification === 'blunder' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {moment.classification}
                          </span>
                        </div>
                        <p className={`text-[11px] ${tokens.appTextMuted}`}>
                          {moment.coachExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SQLite Confirmation */}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-1">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Indexed in SQLite GameHistory Store</span>
              </div>
            </div>
          )}

          {activeTab === 'pgn' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle}`}>
                  Standard PGN Notation
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyPgn}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      copiedPgn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`
                    } flex items-center gap-1 transition`}
                  >
                    {copiedPgn ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPgn ? 'Copied' : 'Copy PGN'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPgn}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .pgn</span>
                  </button>
                </div>
              </div>

              <pre className={`p-3 rounded-xl font-mono text-[11px] whitespace-pre-wrap break-all ${tokens.pillBg} border ${tokens.pillBorder} ${tokens.appText} max-h-[350px] overflow-y-auto leading-relaxed shadow-inner`}>
                {game.pgn}
              </pre>
            </div>
          )}

          {activeTab === 'replay' && (
            <div className="space-y-3">
              {/* Interactive Board */}
              <div className="w-64 max-w-full mx-auto">
                <ChessBoard
                  fen={replayFen}
                  playerColor={game.playerColor}
                  isInteractive={false}
                  theme={boardTheme}
                />
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentMoveIdx <= -1}
                  onClick={() => handleStepMove(-1)}
                  className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} disabled:opacity-30 border ${tokens.btnSecondaryBorder}`}
                  title="Start of Game"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentMoveIdx <= -1}
                  onClick={() => handleStepMove(currentMoveIdx - 1)}
                  className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} disabled:opacity-30 border ${tokens.btnSecondaryBorder}`}
                  title="Previous Move"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`text-xs font-mono font-bold px-2 ${tokens.appText}`}>
                  {currentMoveIdx === -1 ? 'Start' : `Move ${Math.floor(currentMoveIdx / 2) + 1} (${replayMoves[currentMoveIdx]})`}
                </span>
                <button
                  type="button"
                  disabled={currentMoveIdx >= replayMoves.length - 1}
                  onClick={() => handleStepMove(currentMoveIdx + 1)}
                  className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} disabled:opacity-30 border ${tokens.btnSecondaryBorder}`}
                  title="Next Move"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Moves SAN List */}
              <div className={`p-2 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg} max-h-28 overflow-y-auto flex flex-wrap gap-1 font-mono text-[11px]`}>
                {replayMoves.map((san, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStepMove(idx)}
                    className={`px-1.5 py-0.5 rounded transition ${
                      idx === currentMoveIdx
                        ? 'bg-emerald-600 text-white font-bold'
                        : `${tokens.cardBg} ${tokens.appText} hover:bg-slate-200 border ${tokens.cardBorder}`
                    }`}
                  >
                    {idx % 2 === 0 && <span className="opacity-50 mr-0.5">{Math.floor(idx / 2) + 1}.</span>}
                    {san}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 ${tokens.pillBg} border-t ${tokens.cardBorder} flex items-center justify-between`}>
          <button
            type="button"
            onClick={handleCopyPgn}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1.5`}
          >
            {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPgn ? 'PGN Copied' : 'Copy PGN'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 ${tokens.accentPrimary} text-white font-bold text-xs rounded-xl shadow-xs`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

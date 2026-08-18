import React, { useState, useEffect } from 'react';
import { SavedGameRecord, GameReview, ChessMove } from '../../types';
import { SQLiteGameHistoryStore } from '../../database/sqliteStore';
import { useTheme } from '../../context/ThemeContext';
import { PgnUtils } from '@tempo/chess';
import { Chess } from 'chess.js';
import {
  Database,
  Search,
  Download,
  Upload,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Brain,
  Calendar,
  Layers,
  Award,
  Trash2,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ChessBoard } from '../chess/ChessBoard';

interface SqliteGameHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReview: (review: GameReview) => void;
}

export const SqliteGameHistoryModal: React.FC<SqliteGameHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenReview
}) => {
  const { tokens, boardTheme } = useTheme();
  const [games, setGames] = useState<SavedGameRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<SavedGameRecord | null>(null);

  // Board replay state for selected game
  const [replayFen, setReplayFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [replayMoves, setReplayMoves] = useState<string[]>([]);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(-1);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showImportBox, setShowImportBox] = useState(false);
  const [importPgnText, setImportPgnText] = useState('');

  // Stats from SQLite
  const [stats, setStats] = useState<{ totalGames: number; wins: number; losses: number; draws: number; avgAccuracy: number }>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    avgAccuracy: 0
  });

  const loadGames = async () => {
    setLoading(true);
    try {
      const records = searchQuery.trim()
        ? await SQLiteGameHistoryStore.searchGames(searchQuery.trim())
        : await SQLiteGameHistoryStore.getAllGames();
      setGames(records);

      const aggregateStats = await SQLiteGameHistoryStore.getAggregateStats();
      setStats(aggregateStats);
    } catch (e) {
      console.error('Error loading SQLite games', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadGames();
    }
  }, [isOpen, searchQuery]);

  // When a game is selected, prepare the replay board
  useEffect(() => {
    if (!selectedGame) return;

    try {
      const parsed = PgnUtils.parsePgn(selectedGame.pgn);
      setReplayMoves(parsed.movesSan);
      setCurrentMoveIdx(-1);
      setReplayFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    } catch (err) {
      console.warn('Could not parse PGN for replay', err);
    }
  }, [selectedGame]);

  const handleStepMove = (targetIdx: number) => {
    if (!selectedGame || targetIdx < -1 || targetIdx >= replayMoves.length) return;

    const chess = new Chess();
    for (let i = 0; i <= targetIdx; i++) {
      chess.move(replayMoves[i]);
    }
    setReplayFen(chess.fen());
    setCurrentMoveIdx(targetIdx);
  };

  const handleCopyPgn = () => {
    if (selectedGame) {
      navigator.clipboard.writeText(selectedGame.pgn);
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    }
  };

  const handleExportAll = async () => {
    const pgnExport = await SQLiteGameHistoryStore.exportAllPgns();
    const blob = new Blob([pgnExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tempo-chess-games-${new Date().toISOString().slice(0, 10)}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async () => {
    if (!importPgnText.trim()) return;
    try {
      await SQLiteGameHistoryStore.importPgn(importPgnText);
      setImportStatus('Game successfully parsed and imported into SQLite!');
      setImportPgnText('');
      setShowImportBox(false);
      loadGames();
      setTimeout(() => setImportStatus(null), 3000);
    } catch (e) {
      setImportStatus('Invalid PGN format. Please check and retry.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleDeleteGame = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this game record from SQLite storage?')) {
      await SQLiteGameHistoryStore.deleteGame(id);
      if (selectedGame?.id === id) {
        setSelectedGame(null);
      }
      loadGames();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`${tokens.cardBg} border ${tokens.cardBorder} rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
        {/* Header Bar */}
        <div className={`p-4 border-b ${tokens.cardBorder} flex items-center justify-between ${tokens.pillBg}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${tokens.accentBadgeBg} border ${tokens.accentBadgeBorder} flex items-center justify-center`}>
              <Database className={`w-4 h-4 ${tokens.accentBadgeText}`} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${tokens.appText}`}>SQLite GameHistory Store</h2>
              <p className={`text-xs ${tokens.appTextMuted}`}>
                Persistent local PGN storage & post-game database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aggregate SQL Stats Bar */}
        <div className={`grid grid-cols-4 gap-2 p-3 ${tokens.cardBg} border-b ${tokens.cardBorder} text-center`}>
          <div className={`p-2 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
              Total Saved
            </span>
            <span className={`text-sm font-black ${tokens.appText} font-mono`}>{stats.totalGames}</span>
          </div>
          <div className={`p-2 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider text-emerald-700 block`}>
              Wins
            </span>
            <span className="text-sm font-black text-emerald-600 font-mono">{stats.wins}</span>
          </div>
          <div className={`p-2 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider text-rose-700 block`}>
              Losses
            </span>
            <span className="text-sm font-black text-rose-600 font-mono">{stats.losses}</span>
          </div>
          <div className={`p-2 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
              Avg Accuracy
            </span>
            <span className={`text-sm font-black ${tokens.appText} font-mono`}>{stats.avgAccuracy}%</span>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Search & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${tokens.appTextSubtle}`} />
              <input
                type="text"
                placeholder="Search openings, headlines, moves..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl border ${tokens.cardBorder} ${tokens.cardBg} ${tokens.appText} text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500`}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className={`px-2.5 py-1.5 rounded-xl font-bold ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import PGN</span>
              </button>
              <button
                type="button"
                onClick={handleExportAll}
                className={`px-2.5 py-1.5 rounded-xl font-bold ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} hover:${tokens.btnSecondaryHover} border ${tokens.btnSecondaryBorder} flex items-center gap-1`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All PGNs</span>
              </button>
            </div>
          </div>

          {/* PGN Import Text Area */}
          {showImportBox && (
            <div className={`p-3 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg} space-y-2`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${tokens.appTextSubtle} block`}>
                Paste PGN String to Import
              </span>
              <textarea
                rows={4}
                value={importPgnText}
                onChange={e => setImportPgnText(e.target.value)}
                placeholder={'[Event "My Match"]\n1. e4 e5 2. Nf3 Nc6 3. Bc4 1-0'}
                className={`w-full p-2 rounded-lg font-mono text-[11px] border ${tokens.cardBorder} ${tokens.cardBg} ${tokens.appText}`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportBox(false)}
                  className={`px-3 py-1 text-xs font-semibold ${tokens.appTextMuted}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className={`px-3 py-1 rounded-lg ${tokens.accentPrimary} text-white font-bold text-xs`}
                >
                  Save to SQLite
                </button>
              </div>
            </div>
          )}

          {/* Selected Game Replay & Analysis View */}
          {selectedGame ? (
            <div className={`p-3 rounded-2xl border ${tokens.cardBorder} ${tokens.cardBg} space-y-3 shadow-2xs`}>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className={`flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Game List</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyPgn}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      copiedPgn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : `${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} border ${tokens.btnSecondaryBorder}`
                    } flex items-center gap-1`}
                  >
                    {copiedPgn ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPgn ? 'Copied PGN' : 'Copy PGN'}</span>
                  </button>

                  {selectedGame.review && (
                    <button
                      type="button"
                      onClick={() => onOpenReview(selectedGame.review!)}
                      className={`px-2.5 py-1 rounded-lg ${tokens.accentPrimary} text-white font-bold text-xs flex items-center gap-1`}
                    >
                      <Brain className="w-3 h-3" />
                      <span>Open Coach Review</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Game Metadata Banner */}
              <div className={`p-3 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg} space-y-1`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedGame.result === 'win' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {selectedGame.result}
                    </span>
                    <span className={`font-bold ${tokens.appText}`}>{selectedGame.openingName}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${tokens.appText}`}>
                    Accuracy: {selectedGame.accuracyWhite}%
                  </span>
                </div>
                <p className={`text-xs ${tokens.appTextMuted}`}>{selectedGame.headline}</p>
              </div>

              {/* Interactive Board & Stepper */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-64 max-w-full shrink-0">
                  <ChessBoard
                    fen={replayFen}
                    playerColor={selectedGame.playerColor}
                    isInteractive={false}
                    theme={boardTheme}
                  />
                </div>

                <div className="flex-1 w-full space-y-3">
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

                  {/* Moves SAN Chip Grid */}
                  <div className={`p-2 rounded-xl border ${tokens.cardBorder} ${tokens.pillBg} max-h-36 overflow-y-auto flex flex-wrap gap-1 font-mono text-[11px]`}>
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

                  {/* Raw PGN preview accordion */}
                  <details className="text-[10px]">
                    <summary className={`cursor-pointer font-bold ${tokens.appTextSubtle} select-none`}>
                      Raw PGN Code
                    </summary>
                    <pre className={`mt-1 p-2 rounded-lg font-mono whitespace-pre-wrap ${tokens.pillBg} border ${tokens.pillBorder} ${tokens.appText} max-h-24 overflow-y-auto`}>
                      {selectedGame.pgn}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          ) : (
            /* Game List */
            <div className="space-y-2">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading SQLite database records...</div>
              ) : games.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No games matched your query. Complete a match vs Tempo AI to automatically record it in SQLite!
                </div>
              ) : (
                games.map(game => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full ${tokens.cardBg} ${tokens.cardBgHover} border ${tokens.cardBorder} rounded-xl p-3 text-left transition flex items-center justify-between cursor-pointer group ${tokens.cardShadow}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                          game.result === 'win' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {game.result}
                        </span>
                        <span className={`text-xs font-bold ${tokens.appText}`}>
                          {game.openingName}
                        </span>
                      </div>
                      <p className={`text-[11px] ${tokens.appTextMuted} truncate max-w-[280px]`}>
                        {game.headline}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{new Date(game.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{game.movesCount} moves</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold ${tokens.appText} block`}>
                          {game.accuracyWhite}%
                        </span>
                        <span className="text-[10px] text-slate-400">Accuracy</span>
                      </div>

                      <button
                        type="button"
                        onClick={e => handleDeleteGame(game.id, e)}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-rose-600 transition`}
                        title="Delete from SQLite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className={`w-4 h-4 ${tokens.appTextSubtle} group-hover:text-emerald-600 transition`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-3 ${tokens.pillBg} border-t ${tokens.cardBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SQLite Offline Engine Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl ${tokens.btnSecondaryBg} ${tokens.btnSecondaryText} font-bold text-xs border ${tokens.btnSecondaryBorder}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

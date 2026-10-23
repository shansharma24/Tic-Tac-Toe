import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ReplayModal } from './ReplayModal.jsx';
import { History, Play, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export const HistoryView = ({ onBackToPlay }) => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMatchHistory(page, 10);
      setHistory(data.history || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch match history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 uppercase tracking-widest font-bold">
            <History className="w-4 h-4" />
            <span>Match Archives</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Personal Match History
          </h2>
          <p className="text-xs text-slate-400">
            Review past games, outcomes, and watch step-by-step game replays.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={onBackToPlay}>
          Back to Play
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading your match archives...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-sm glass-card rounded-2xl">{error}</div>
        ) : history.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-400 space-y-3">
            <p className="text-sm font-medium">No completed matches found yet.</p>
            <p className="text-xs text-slate-500">
              Complete a multiplayer match and your game sequence will be archived here for replay!
            </p>
          </GlassCard>
        ) : (
          history.map((match) => {
            const isWin = match.outcome === 'WIN';
            const isLoss = match.outcome === 'LOSS';
            const isDraw = match.outcome === 'DRAW';

            return (
              <GlassCard
                key={match.roundId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5"
              >
                <div className="flex items-center gap-3.5">
                  {/* Outcome Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                      isWin
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isLoss
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {match.outcome}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        vs. {match.opponent?.nickname || 'Opponent'}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        (You played {match.myMark})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>Room: {match.roomCode}</span>
                      <span>•</span>
                      <span>{match.totalMoves} moves</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(match.endedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Watch Replay Button */}
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setSelectedRoundId(match.roundId)}
                  className="w-full sm:w-auto"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Replay Match</span>
                </Button>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-4 glass-card rounded-2xl flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchHistory(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="glass"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchHistory(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Replay Modal */}
      <ReplayModal
        roundId={selectedRoundId}
        isOpen={!!selectedRoundId}
        onClose={() => setSelectedRoundId(null)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Trophy, Medal, Award, Flame, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export const LeaderboardView = ({ onBackToPlay }) => {
  const { player } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLeaderboard(page, 15);
      setLeaderboard(data.leaderboard || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
          <Trophy className="w-4 h-4 text-amber-400" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40">
          <Medal className="w-4 h-4 text-slate-300" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40">
          <Award className="w-4 h-4 text-amber-600" />
        </span>
      );
    }
    return <span className="font-mono text-sm font-bold text-slate-400">{rank}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
            <Trophy className="w-4 h-4" />
            <span>Global Hall of Fame</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Floyd Arena Leaderboard
          </h2>
          <p className="text-xs text-slate-400">
            Authoritative player rankings based on completed multiplayer matches.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={onBackToPlay}>
          Back to Play
        </Button>
      </div>

      {/* Leaderboard Table Card */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading rankings...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 text-sm">{error}</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No matches recorded yet. Play your first match to claim the #1 spot!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                  <th className="py-3 px-4 text-center">Wins</th>
                  <th className="py-3 px-4 text-center">Losses</th>
                  <th className="py-3 px-4 text-center">Draws</th>
                  <th className="py-3 px-4 text-center">Best Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {leaderboard.map((item) => {
                  const isCurrent = item.playerId === player?.playerId;
                  return (
                    <tr
                      key={item.playerId}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-cyan-500/10 text-cyan-200'
                          : 'hover:bg-white/[0.03] text-slate-200'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">{getRankBadge(item.rank)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-black text-slate-950">
                            {item.nickname.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white">{item.nickname}</span>
                            {isCurrent && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-400">
                        {item.stats.winRate}%
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">
                        {item.stats.wins}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-rose-400">
                        {item.stats.losses}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {item.stats.draws}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <div className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{item.stats.bestStreak}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchLeaderboard(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="glass"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLeaderboard(pagination.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

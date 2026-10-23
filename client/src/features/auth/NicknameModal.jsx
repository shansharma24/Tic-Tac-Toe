import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, AlertCircle } from 'lucide-react';

export const NicknameModal = ({ isOpen, onClose }) => {
  const { player, login, updateNickname } = useAuth();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (player?.nickname) {
      setNickname(player.nickname);
    } else {
      setNickname('');
    }
    setError('');
  }, [player, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      setError('Nickname must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Nickname cannot exceed 20 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
      setError('Only letters, numbers, spaces, hyphens, and underscores allowed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (player) {
        await updateNickname(trimmed);
      } else {
        await login(trimmed);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save nickname. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={player ? 'Update Display Nickname' : 'Enter Guest Nickname'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-400">
          Choose a nickname to identify yourself in multiplayer matches, chat, and leaderboards. No registration required.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Player Nickname
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. CyberKnight, NeonPulse"
              maxLength={20}
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium"
              autoFocus
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
            <span>2 to 20 characters</span>
            <span>{nickname.length}/20</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {player && (
            <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button variant="primary" size="md" type="submit" loading={loading}>
            {player ? 'Save Changes' : 'Start Playing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

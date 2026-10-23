import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { LobbyView } from './features/lobby/LobbyView.jsx';
import { WaitingRoom } from './features/lobby/WaitingRoom.jsx';
import { GameScreen } from './features/game/GameScreen.jsx';
import { LeaderboardView } from './features/leaderboard/LeaderboardView.jsx';
import { HistoryView } from './features/history/HistoryView.jsx';
import { HowToPlayModal } from './features/lobby/HowToPlayModal.jsx';
import { NicknameModal } from './features/auth/NicknameModal.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useSound } from './context/SoundContext.jsx';
import { getSocket, connectSocket } from './services/socket.js';
import { api } from './services/api.js';

export const App = () => {
  const { player, isAuthenticated, login } = useAuth();
  const { playMove, playGameStart, playChat } = useSound();

  const [currentView, setCurrentView] = useState('lobby'); // 'lobby' | 'waiting' | 'game' | 'leaderboard' | 'history'
  const [currentRoom, setCurrentRoom] = useState(null);
  const [localMark, setLocalMark] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [reconnectingCountdown, setReconnectingCountdown] = useState(null);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchStatus, setRematchStatus] = useState(null);

  const [loadingAction, setLoadingAction] = useState({ creating: false, joining: false });
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  // Auto-prompt nickname if not set
  useEffect(() => {
    if (!player && !localStorage.getItem('floyd_player_nickname')) {
      setNicknameModalOpen(true);
    }
  }, [player]);

  // Setup Socket.IO Event Listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = connectSocket();

    const handleRoomCreated = (data) => {
      setCurrentRoom(data.room);
      setLocalMark('X');
      setCurrentView('waiting');
      setLoadingAction({ creating: false, joining: false });
      setErrorMessage('');
    };

    const handleRoomJoined = (data) => {
      setCurrentRoom(data.room);
      setLocalMark(data.mark);
      if (data.room.status === 'PLAYING') {
        setCurrentView('game');
        playGameStart();
      } else {
        setCurrentView('waiting');
      }
      setLoadingAction({ creating: false, joining: false });
      setErrorMessage('');
    };

    const handlePlayerJoined = (data) => {
      setCurrentRoom(data.room);
      if (data.room.status === 'PLAYING') {
        setCurrentView('game');
        playGameStart();
      }
    };

    const handleGameStarted = (data) => {
      setCurrentRoom(data.room);
      setCurrentView('game');
      playGameStart();
    };

    const handleMoveAccepted = (data) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        const newBoard = [...data.board];
        return {
          ...prev,
          board: newBoard,
          currentTurn: data.nextTurn,
          stateVersion: data.stateVersion,
          lastMove: data.lastMove,
        };
      });
      playMove(data.mark);
    };

    const handleMoveRejected = (data) => {
      setErrorMessage(data.error || 'Move was rejected by server.');
      // Resync room state
      socket.emit('game:sync-request', { roomCode: currentRoom?.roomCode });
    };

    const handleRoundFinished = (data) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'FINISHED',
          board: data.finalBoard || prev.board,
          roundResult: {
            winnerMark: data.winnerMark,
            winnerId: data.winnerId,
            isDraw: data.isDraw,
            winningLine: data.winningLine,
          },
          scores: data.scores || prev.scores,
        };
      });
      setRematchRequested(false);
      setRematchStatus(null);
    };

    const handleRematchStatus = (data) => {
      setRematchStatus(data);
    };

    const handleRematchStarted = (data) => {
      setCurrentRoom(data.room);
      setRematchRequested(false);
      setRematchStatus(null);
      playGameStart();
    };

    const handleChatMessage = (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (msg.senderId !== player?.playerId) {
        playChat();
      }
    };

    const handleConnectionStatus = (data) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map((p) =>
          p.playerId === data.playerId ? { ...p, connected: data.connected } : p
        );
        return { ...prev, players: updatedPlayers };
      });

      if (!data.connected && data.gracePeriodMs) {
        setReconnectingCountdown(Math.round(data.gracePeriodMs / 1000));
      } else {
        setReconnectingCountdown(null);
      }
    };

    const handleServerError = (data) => {
      setErrorMessage(data.message || 'Server error occurred.');
      setLoadingAction({ creating: false, joining: false });
    };

    socket.on('room:created', handleRoomCreated);
    socket.on('room:joined', handleRoomJoined);
    socket.on('room:player-joined', handlePlayerJoined);
    socket.on('game:started', handleGameStarted);
    socket.on('game:move-accepted', handleMoveAccepted);
    socket.on('game:move-rejected', handleMoveRejected);
    socket.on('game:round-finished', handleRoundFinished);
    socket.on('game:rematch-status', handleRematchStatus);
    socket.on('game:rematch-started', handleRematchStarted);
    socket.on('chat:message', handleChatMessage);
    socket.on('player:connection-status', handleConnectionStatus);
    socket.on('server:error', handleServerError);

    return () => {
      socket.off('room:created', handleRoomCreated);
      socket.off('room:joined', handleRoomJoined);
      socket.off('room:player-joined', handlePlayerJoined);
      socket.off('game:started', handleGameStarted);
      socket.off('game:move-accepted', handleMoveAccepted);
      socket.off('game:move-rejected', handleMoveRejected);
      socket.off('game:round-finished', handleRoundFinished);
      socket.off('game:rematch-status', handleRematchStatus);
      socket.off('game:rematch-started', handleRematchStarted);
      socket.off('chat:message', handleChatMessage);
      socket.off('player:connection-status', handleConnectionStatus);
      socket.off('server:error', handleServerError);
    };
  }, [isAuthenticated, player, playMove, playGameStart, playChat, currentRoom?.roomCode]);

  // Reconnection countdown timer tick
  useEffect(() => {
    if (reconnectingCountdown === null || reconnectingCountdown <= 0) return;
    const interval = setInterval(() => {
      setReconnectingCountdown((prev) => (prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [reconnectingCountdown]);

  // Ensure Guest Authentication before Room Actions
  const ensureAuth = async () => {
    if (!player) {
      const defaultName = `Player_${Math.floor(1000 + Math.random() * 9000)}`;
      await login(defaultName);
    }
  };

  // Action: Create Private Room
  const handleCreateRoom = async () => {
    setLoadingAction((prev) => ({ ...prev, creating: true }));
    setErrorMessage('');
    try {
      await ensureAuth();
      const socket = connectSocket();
      socket.emit('room:create', {}, (response) => {
        if (!response?.success) {
          setErrorMessage(response?.error || 'Failed to create room.');
          setLoadingAction((prev) => ({ ...prev, creating: false }));
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate guest.');
      setLoadingAction((prev) => ({ ...prev, creating: false }));
    }
  };

  // Action: Join Private Room
  const handleJoinRoom = async (roomCode) => {
    setLoadingAction((prev) => ({ ...prev, joining: true }));
    setErrorMessage('');
    try {
      await ensureAuth();
      const socket = connectSocket();
      socket.emit('room:join', { roomCode }, (response) => {
        if (!response?.success) {
          setErrorMessage(response?.error || 'Failed to join room.');
          setLoadingAction((prev) => ({ ...prev, joining: false }));
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate guest.');
      setLoadingAction((prev) => ({ ...prev, joining: false }));
    }
  };

  // Action: Move placement
  const handleCellClick = (cellIndex) => {
    if (!currentRoom || currentRoom.status !== 'PLAYING') return;
    const socket = getSocket();
    socket.emit('game:move', {
      roomCode: currentRoom.roomCode,
      cellIndex,
      stateVersion: currentRoom.stateVersion,
    });
  };

  // Action: Send Chat
  const handleSendMessage = (text) => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('chat:send', {
      roomCode: currentRoom.roomCode,
      text,
    });
  };

  // Action: Rematch Request
  const handleRematchRequest = () => {
    if (!currentRoom) return;
    setRematchRequested(true);
    const socket = getSocket();
    socket.emit('game:rematch-request', {
      roomCode: currentRoom.roomCode,
    });
  };

  // Action: Leave / Cancel Room
  const handleLeaveRoom = () => {
    if (currentRoom) {
      const socket = getSocket();
      socket.emit('room:leave', { roomCode: currentRoom.roomCode });
    }
    setCurrentRoom(null);
    setLocalMark(null);
    setChatMessages([]);
    setRematchRequested(false);
    setRematchStatus(null);
    setCurrentView('lobby');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070913] bg-grid-pattern relative">
      {/* Ambient background glow accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      {/* Branded Header & Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'lobby' && currentRoom) {
            // Keep game active if leaving to check stats
          }
          setCurrentView(view);
        }}
        onOpenHowToPlay={() => setHowToPlayOpen(true)}
        onOpenNicknameModal={() => setNicknameModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 relative z-10 flex flex-col">
        {currentView === 'lobby' && (
          <LobbyView
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onViewLeaderboard={() => setCurrentView('leaderboard')}
            onViewHistory={() => setCurrentView('history')}
            onOpenHowToPlay={() => setHowToPlayOpen(true)}
            creating={loadingAction.creating}
            joining={loadingAction.joining}
            error={errorMessage}
          />
        )}

        {currentView === 'waiting' && currentRoom && (
          <WaitingRoom
            roomCode={currentRoom.roomCode}
            onCancel={handleLeaveRoom}
          />
        )}

        {currentView === 'game' && currentRoom && (
          <GameScreen
            room={currentRoom}
            localMark={localMark}
            chatMessages={chatMessages}
            reconnectingCountdown={reconnectingCountdown}
            rematchRequested={rematchRequested}
            rematchStatus={rematchStatus}
            onCellClick={handleCellClick}
            onSendMessage={handleSendMessage}
            onRematchRequest={handleRematchRequest}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView onBackToPlay={() => setCurrentView('lobby')} />
        )}

        {currentView === 'history' && (
          <HistoryView onBackToPlay={() => setCurrentView('lobby')} />
        )}
      </main>

      {/* Branded Footer */}
      <Footer />

      {/* Reusable Modals */}
      <NicknameModal
        isOpen={nicknameModalOpen}
        onClose={() => setNicknameModalOpen(false)}
      />
      <HowToPlayModal
        isOpen={howToPlayOpen}
        onClose={() => setHowToPlayOpen(false)}
      />
    </div>
  );
};

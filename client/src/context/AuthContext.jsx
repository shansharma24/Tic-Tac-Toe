import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('floyd_guest_token'));
  const [loading, setLoading] = useState(true);

  // Initialize guest session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('floyd_guest_token');
      if (savedToken) {
        try {
          const data = await api.getCurrentGuest();
          setPlayer(data.player);
          setToken(savedToken);
          connectSocket();
        } catch {
          // Token expired or invalid
          localStorage.removeItem('floyd_guest_token');
          setPlayer(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (nickname) => {
    try {
      const savedPlayerId = localStorage.getItem('floyd_player_id') || undefined;
      const data = await api.createSession(nickname, savedPlayerId);
      
      localStorage.setItem('floyd_guest_token', data.token);
      localStorage.setItem('floyd_player_id', data.player.playerId);
      localStorage.setItem('floyd_player_nickname', data.player.nickname);

      setToken(data.token);
      setPlayer(data.player);

      connectSocket();
      return data.player;
    } catch (err) {
      throw err;
    }
  };

  const updateNickname = async (nickname) => {
    try {
      const data = await api.updateNickname(nickname);
      localStorage.setItem('floyd_guest_token', data.token);
      localStorage.setItem('floyd_player_nickname', data.player.nickname);

      setToken(data.token);
      setPlayer((prev) => ({ ...prev, ...data.player }));
      return data.player;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('floyd_guest_token');
    disconnectSocket();
    setPlayer(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        token,
        isAuthenticated: !!token && !!player,
        loading,
        login,
        updateNickname,
        logout,
        setPlayer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

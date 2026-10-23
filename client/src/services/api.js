const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('floyd_guest_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json.error || 'A network error occurred. Please try again.';
    const err = new Error(errorMsg);
    err.status = res.status;
    err.code = json.code;
    throw err;
  }
  return json.data !== undefined ? json.data : json;
};

export const api = {
  // Auth & Session
  async createSession(nickname, existingPlayerId) {
    const body = { nickname };
    if (existingPlayerId) {
      body.existingPlayerId = existingPlayerId;
    }
    const res = await fetch(`${API_BASE_URL}/guest/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async getCurrentGuest() {
    const res = await fetch(`${API_BASE_URL}/guest/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateNickname(nickname) {
    const res = await fetch(`${API_BASE_URL}/guest/nickname`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ nickname }),
    });
    return handleResponse(res);
  },

  // Rooms
  async createRoom() {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async joinRoom(roomCode) {
    const res = await fetch(`${API_BASE_URL}/rooms/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roomCode }),
    });
    return handleResponse(res);
  },

  async getRoom(roomCode) {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomCode}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Leaderboard
  async getLeaderboard(page = 1, limit = 20) {
    const res = await fetch(`${API_BASE_URL}/leaderboard?page=${page}&limit=${limit}`);
    return handleResponse(res);
  },

  async getPlayerStats(playerId) {
    const res = await fetch(`${API_BASE_URL}/players/${playerId}/stats`);
    return handleResponse(res);
  },

  // History & Replay
  async getMatchHistory(page = 1, limit = 15) {
    const res = await fetch(`${API_BASE_URL}/history?page=${page}&limit=${limit}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getRoundReplay(roundId) {
    const res = await fetch(`${API_BASE_URL}/history/${roundId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

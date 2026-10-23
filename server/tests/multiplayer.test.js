import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { io as ClientIO } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { setupSocketServer } from '../src/sockets/socketHandler.js';
import { generateGuestToken } from '../src/utils/token.js';
import { GuestPlayer } from '../src/models/GuestPlayer.js';

describe('Real-Time Multiplayer Socket.IO Full Match Simulation', () => {
  let server;
  let serverUrl;
  let p1Socket;
  let p2Socket;
  let p1Token;
  let p2Token;
  let testRoomCode;

  beforeAll(async () => {
    await connectDB();
    const app = createApp();
    server = http.createServer(app);
    setupSocketServer(server);

    await new Promise((resolve) => {
      server.listen(0, () => {
        const port = server.address().port;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Create 2 test players
    const p1 = new GuestPlayer({ playerId: 'guest_p1_sim', nickname: 'Alice' });
    const p2 = new GuestPlayer({ playerId: 'guest_p2_sim', nickname: 'Bob' });
    await p1.save();
    await p2.save();

    p1Token = generateGuestToken({ playerId: 'guest_p1_sim', nickname: 'Alice' });
    p2Token = generateGuestToken({ playerId: 'guest_p2_sim', nickname: 'Bob' });
  }, 180000);

  afterAll(async () => {
    if (p1Socket?.connected) p1Socket.disconnect();
    if (p2Socket?.connected) p2Socket.disconnect();
    await new Promise((r) => setTimeout(r, 100));
    if (server?.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
  });

  it('Player 1 connects and creates a private room', async () => {
    p1Socket = ClientIO(serverUrl, {
      auth: { token: p1Token },
      transports: ['websocket'],
    });

    const createPromise = new Promise((resolve) => {
      p1Socket.on('room:created', (data) => {
        resolve(data);
      });
    });

    p1Socket.emit('room:create');
    const res = await createPromise;

    expect(res.roomCode).toBeDefined();
    expect(res.mark).toBe('X');
    expect(res.room.status).toBe('WAITING');
    testRoomCode = res.roomCode;
  });

  it('Player 2 joins the room and game starts', async () => {
    p2Socket = ClientIO(serverUrl, {
      auth: { token: p2Token },
      transports: ['websocket'],
    });

    const p2JoinedPromise = new Promise((resolve) => {
      p2Socket.on('room:joined', (data) => resolve(data));
    });

    const p1StartedPromise = new Promise((resolve) => {
      p1Socket.on('game:started', (data) => resolve(data));
    });

    p2Socket.emit('room:join', { roomCode: testRoomCode });

    const [p2Data, p1Data] = await Promise.all([p2JoinedPromise, p1StartedPromise]);

    expect(p2Data.mark).toBe('O');
    expect(p1Data.room.status).toBe('PLAYING');
  });

  it('Players chat in real time within the room', async () => {
    const chatPromise = new Promise((resolve) => {
      p2Socket.on('chat:message', (msg) => resolve(msg));
    });

    p1Socket.emit('chat:send', {
      roomCode: testRoomCode,
      text: 'Good luck have fun!',
    });

    const receivedMsg = await chatPromise;
    expect(receivedMsg.text).toBe('Good luck have fun!');
    expect(receivedMsg.senderNickname).toBe('Alice');
    expect(receivedMsg.senderMark).toBe('X');
  });

  it('Players play moves until Player 1 wins with Row 1', async () => {
    // Sequence:
    // P1 -> Cell 0 (X)
    // P2 -> Cell 3 (O)
    // P1 -> Cell 1 (X)
    // P2 -> Cell 4 (O)
    // P1 -> Cell 2 (X) => WINS

    const roundFinishedPromise = new Promise((resolve) => {
      p2Socket.on('game:round-finished', (data) => resolve(data));
    });

    const moveWait = (socket, cellIndex) =>
      new Promise((resolve) => {
        const handler = (data) => {
          if (data.cellIndex === cellIndex) {
            socket.off('game:move-accepted', handler);
            resolve(data);
          }
        };
        socket.on('game:move-accepted', handler);
      });

    // Move 1: P1 plays cell 0
    p1Socket.emit('game:move', { roomCode: testRoomCode, cellIndex: 0 });
    await moveWait(p1Socket, 0);

    // Move 2: P2 plays cell 3
    p2Socket.emit('game:move', { roomCode: testRoomCode, cellIndex: 3 });
    await moveWait(p2Socket, 3);

    // Move 3: P1 plays cell 1
    p1Socket.emit('game:move', { roomCode: testRoomCode, cellIndex: 1 });
    await moveWait(p1Socket, 1);

    // Move 4: P2 plays cell 4
    p2Socket.emit('game:move', { roomCode: testRoomCode, cellIndex: 4 });
    await moveWait(p2Socket, 4);

    // Move 5: P1 plays cell 2 (Winning move!)
    p1Socket.emit('game:move', { roomCode: testRoomCode, cellIndex: 2 });
    const finishData = await roundFinishedPromise;

    expect(finishData.winnerMark).toBe('X');
    expect(finishData.isDraw).toBe(false);
    expect(finishData.winningLine).toEqual([0, 1, 2]);
  });

  it('Both players agree to rematch and start a new round', async () => {
    const rematchStartPromise = new Promise((resolve) => {
      p1Socket.on('game:rematch-started', (data) => resolve(data));
    });

    const p1RematchStatusPromise = new Promise((resolve) => {
      p1Socket.on('game:rematch-status', (data) => resolve(data));
    });

    // P1 requests rematch
    p1Socket.emit('game:rematch-request', { roomCode: testRoomCode });
    const statusData = await p1RematchStatusPromise;
    expect(statusData.rematchRequests).toContain('guest_p1_sim');

    // P2 accepts rematch
    p2Socket.emit('game:rematch-request', { roomCode: testRoomCode });
    const rematchData = await rematchStartPromise;

    expect(rematchData.roundNumber).toBe(2);
    expect(rematchData.room.status).toBe('PLAYING');
    expect(rematchData.room.board.every((c) => c === '')).toBe(true);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

describe('Floyd Technology Hub API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await connectDB();
    app = createApp();
  }, 180000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Health Checks', () => {
    it('GET /api/v1/health returns healthy', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });

    it('GET /api/v1/ready returns ready', async () => {
      const res = await request(app).get('/api/v1/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });
  });

  describe('Guest Authentication & Session Recovery', () => {
    let token;
    let playerId;

    it('POST /api/v1/guest/session creates a new guest session', async () => {
      const res = await request(app)
        .post('/api/v1/guest/session')
        .send({ nickname: 'CyberPlayer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.player.nickname).toBe('CyberPlayer');
      expect(res.body.data.player.playerId).toMatch(/^guest_/);

      token = res.body.data.token;
      playerId = res.body.data.player.playerId;
    });

    it('POST /api/v1/guest/session rejects invalid nicknames', async () => {
      // Too short
      const res1 = await request(app)
        .post('/api/v1/guest/session')
        .send({ nickname: 'A' });
      expect(res1.status).toBe(400);

      // Inappropriate characters
      const res2 = await request(app)
        .post('/api/v1/guest/session')
        .send({ nickname: '<script>alert(1)</script>' });
      expect(res2.status).toBe(400);
    });

    it('GET /api/v1/guest/me retrieves authenticated player profile', async () => {
      const res = await request(app)
        .get('/api/v1/guest/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.player.playerId).toBe(playerId);
      expect(res.body.data.player.nickname).toBe('CyberPlayer');
    });

    it('GET /api/v1/guest/me rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/guest/me');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });

    it('PATCH /api/v1/guest/nickname updates guest nickname', async () => {
      const res = await request(app)
        .patch('/api/v1/guest/nickname')
        .set('Authorization', `Bearer ${token}`)
        .send({ nickname: 'NeoFloyd' });

      expect(res.status).toBe(200);
      expect(res.body.data.player.nickname).toBe('NeoFloyd');
    });
  });

  describe('Game Rooms Lifecycle', () => {
    let p1Token;
    let p2Token;
    let p3Token;
    let createdRoomCode;

    beforeAll(async () => {
      const s1 = await request(app).post('/api/v1/guest/session').send({ nickname: 'PlayerOne' });
      const s2 = await request(app).post('/api/v1/guest/session').send({ nickname: 'PlayerTwo' });
      const s3 = await request(app).post('/api/v1/guest/session').send({ nickname: 'PlayerThree' });
      p1Token = s1.body.data.token;
      p2Token = s2.body.data.token;
      p3Token = s3.body.data.token;
    });

    it('POST /api/v1/rooms creates a waiting room', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${p1Token}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomCode).toBeDefined();
      expect(res.body.data.room.status).toBe('WAITING');
      expect(res.body.data.room.players[0].mark).toBe('X');

      createdRoomCode = res.body.data.roomCode;
    });

    it('GET /api/v1/rooms/:roomCode fetches room details', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms/${createdRoomCode}`)
        .set('Authorization', `Bearer ${p1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.room.roomCode).toBe(createdRoomCode);
    });

    it('POST /api/v1/rooms/join allows player 2 to join', async () => {
      const res = await request(app)
        .post('/api/v1/rooms/join')
        .set('Authorization', `Bearer ${p2Token}`)
        .send({ roomCode: createdRoomCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mark).toBe('O');
      expect(res.body.data.room.status).toBe('PLAYING');
      expect(res.body.data.room.players.length).toBe(2);
    });

    it('POST /api/v1/rooms/join rejects third player (room full)', async () => {
      const res = await request(app)
        .post('/api/v1/rooms/join')
        .set('Authorization', `Bearer ${p3Token}`)
        .send({ roomCode: createdRoomCode });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ROOM_FULL');
    });

    it('POST /api/v1/rooms/join allows existing seated player to rejoin (seat recovery)', async () => {
      const res = await request(app)
        .post('/api/v1/rooms/join')
        .set('Authorization', `Bearer ${p1Token}`)
        .send({ roomCode: createdRoomCode });

      expect(res.status).toBe(200);
      expect(res.body.data.isRejoin).toBe(true);
      expect(res.body.data.mark).toBe('X');
    });
  });

  describe('Leaderboard & History', () => {
    it('GET /api/v1/leaderboard returns ranked players list', async () => {
      const res = await request(app).get('/api/v1/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.leaderboard)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });
  });
});

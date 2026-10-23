import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_ORIGINS: process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
  MONGODB_URI: process.env.MONGODB_URI || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'floyd_super_secret_session_key_2026_dev',
  ROOM_CODE_SECRET: process.env.ROOM_CODE_SECRET || 'floyd_super_secret_room_key_2026_dev',
  ROOM_INACTIVITY_TIMEOUT_MS: parseInt(process.env.ROOM_INACTIVITY_TIMEOUT_MS || '1800000', 10), // 30 mins
  RECONNECTION_GRACE_PERIOD_MS: parseInt(process.env.RECONNECTION_GRACE_PERIOD_MS || '45000', 10), // 45s
  MAX_CHAT_MESSAGE_LENGTH: parseInt(process.env.MAX_CHAT_MESSAGE_LENGTH || '300', 10),
};

import crypto from 'crypto';

// 32-character unambiguous alphabet (avoiding 0, O, 1, I)
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateRoomCode = (length = 6) => {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
};

export const isValidRoomCode = (code) => {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length !== 6) return false;
  return /^[A-Z0-9]{6}$/.test(trimmed);
};

export const normalizeRoomCode = (code) => {
  if (typeof code !== 'string') return '';
  return code.trim().toUpperCase();
};

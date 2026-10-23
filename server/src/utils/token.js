import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateGuestToken = (payload) => {
  return jwt.sign(payload, ENV.SESSION_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyGuestToken = (token) => {
  try {
    return jwt.verify(token, ENV.SESSION_SECRET);
  } catch {
    return null;
  }
};

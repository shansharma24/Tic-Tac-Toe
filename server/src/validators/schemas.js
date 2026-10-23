import { z } from 'zod';

export const createSessionSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, 'Nickname must be at least 2 characters')
    .max(20, 'Nickname must be 20 characters or fewer')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Nickname can only contain letters, numbers, spaces, underscores, and hyphens'),
  existingPlayerId: z.string().nullable().optional(),
});

export const updateNicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, 'Nickname must be at least 2 characters')
    .max(20, 'Nickname must be 20 characters or fewer')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Nickname can only contain letters, numbers, spaces, underscores, and hyphens'),
});

export const joinRoomSchema = z.object({
  roomCode: z
    .string()
    .trim()
    .min(4, 'Room code is invalid')
    .max(10, 'Room code is invalid')
    .transform((val) => val.toUpperCase()),
});

import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderNickname: {
      type: String,
      required: true,
    },
    senderMark: {
      type: String,
      enum: ['X', 'O', 'SYSTEM'],
      default: 'SYSTEM',
    },
    text: {
      type: String,
      required: true,
      maxlength: 300,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '7d' }, // 7 day retention
    },
  },
  {
    timestamps: false,
  }
);

ChatMessageSchema.index({ roomCode: 1, createdAt: 1 });

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSound } from '../../context/SoundContext.jsx';

const EMOJIS = ['👍', '🔥', '😎', '😮', '👏', '🧠', '⚔️', '🤝'];

export const ChatBox = ({
  messages = [],
  onSendMessage,
  disabled = false,
  className = '',
}) => {
  const { player } = useAuth();
  const { playChat } = useSound();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText('');
    playChat();
  };

  const handleEmojiClick = (emoji) => {
    if (disabled) return;
    onSendMessage(emoji);
    playChat();
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl bg-slate-950/70 border border-white/10 overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Live Match Chat
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">Encrypted & Isolated</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto min-h-[220px] max-h-[350px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Smile className="w-8 h-8 mb-2 text-slate-600" />
            <p className="text-xs font-medium">Say hello to your opponent!</p>
            <p className="text-[11px] text-slate-600">Messages will appear here in real time.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === player?.playerId;
            return (
              <div
                key={msg.messageId || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender & Timestamp */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                  <span
                    className={`font-mono font-bold ${
                      msg.senderMark === 'X'
                        ? 'text-cyan-400'
                        : msg.senderMark === 'O'
                        ? 'text-pink-400'
                        : 'text-violet-400'
                    }`}
                  >
                    [{msg.senderMark || '?'}] {msg.senderNickname}
                  </span>
                  <span>•</span>
                  <span>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] break-words leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reaction Bar */}
      <div className="px-3 py-1.5 border-t border-white/5 bg-black/20 flex items-center gap-1 overflow-x-auto">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => handleEmojiClick(emoji)}
            className="p-1 rounded hover:bg-white/10 transition-colors text-sm hover:scale-115 active:scale-95 disabled:opacity-30 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/[0.02] flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'Chat disabled' : 'Type a message...'}
          maxLength={300}
          disabled={disabled}
          className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs font-medium focus:ring-1 focus:ring-cyan-400"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Send chat message"
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

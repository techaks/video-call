import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/hooks/useWebRTC';

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ messages, onSendMessage, isOpen, onClose }: ChatSidebarProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full rounded-l-2xl md:rounded-2xl overflow-hidden",
        isOpen ? "translate-x-0" : "translate-x-full hidden md:flex"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900">
        <h3 className="font-semibold text-slate-100">In-call Messages</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-100">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex flex-col max-w-[85%]", msg.isLocal ? "ml-auto items-end" : "mr-auto items-start")}
            >
              <span className="text-[10px] text-slate-400 mb-1 ml-1">{msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div
                className={cn(
                  "px-3 py-2 rounded-2xl text-sm shadow-sm",
                  msg.isLocal
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-100 rounded-bl-sm"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-white/10">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
          />
          <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

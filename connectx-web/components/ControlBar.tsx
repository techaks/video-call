import React from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MessageSquare } from 'lucide-react';

interface ControlBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onLeaveCall: () => void;
  onSendReaction: (emoji: string) => void;
  unreadCount?: number;
}


export function ControlBar({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isChatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onLeaveCall,
  onSendReaction,
  unreadCount = 0,
}: ControlBarProps) {
  const reactions = ['❤️', '😂', '👍', '🔥'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6 rounded-2xl bg-white/5 px-4 md:px-6 py-3 md:py-4 backdrop-blur-xl border border-white/10 shadow-2xl">
      <Button
        variant={isMicOn ? 'secondary' : 'destructive'}
        size="icon"
        className="rounded-full h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105 shrink-0"
        onClick={onToggleMic}
      >
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      <Button
        variant={isCameraOn ? 'secondary' : 'destructive'}
        size="icon"
        className="rounded-full h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105 shrink-0"
        onClick={onToggleCamera}
      >
        {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      <Button
        variant={isScreenSharing ? 'default' : 'secondary'}
        size="icon"
        className="rounded-full h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105 shrink-0 hidden sm:flex"
        onClick={onToggleScreenShare}
      >
        <MonitorUp className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 glass-card rounded-full border-slate-700/50">
        {reactions.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="text-xl md:text-2xl hover:scale-125 transition-transform active:scale-95 p-1"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="relative md:hidden shrink-0">
        <Button
          variant={isChatOpen ? 'default' : 'secondary'}
          size="icon"
          className="rounded-full h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105"
          onClick={onToggleChat}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        {unreadCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse border-2 border-slate-900 pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

      <Button
        variant="destructive"
        className="rounded-full h-10 md:h-12 px-4 md:px-6 font-semibold transition-all hover:scale-105 shrink-0"
        onClick={onLeaveCall}
      >
        <PhoneOff className="h-4 w-4 md:h-5 md:w-5 sm:mr-2" />
        <span className="hidden sm:inline">Leave Call</span>
      </Button>
    </div>
  );
}

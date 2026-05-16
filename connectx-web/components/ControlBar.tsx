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
}: ControlBarProps) {
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

      <Button
        variant={isChatOpen ? 'default' : 'secondary'}
        size="icon"
        className="rounded-full h-10 w-10 md:h-12 md:w-12 transition-all hover:scale-105 md:hidden shrink-0"
        onClick={onToggleChat}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

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

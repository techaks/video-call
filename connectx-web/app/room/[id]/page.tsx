'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ControlBar } from '@/components/ControlBar';
import { ChatSidebar } from '@/components/ChatSidebar';
import { FloatingReactions } from '@/components/FloatingReactions';
import { Button } from '@/components/ui/button';
import { Copy, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userName = searchParams.get('name') || 'Guest';
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;

  const [isCopied, setIsCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const prevMessagesLength = useRef(0);

  const {
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    messages,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
    sendReaction,
    lastReaction,
  } = useWebRTC(roomId, userName);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const newMessages = messages.slice(prevMessagesLength.current);

      const remoteMessages = newMessages.filter((m) => !m.isLocal);

      if (!isChatOpen && remoteMessages.length > 0) {
        setUnreadCount((prev) => prev + remoteMessages.length);
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;

    navigator.clipboard.writeText(url);

    setIsCopied(true);

    toast.success('Invite link copied!');

    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLeaveCall = () => {
    router.push('/');
  };

  return (
    <div className="h-dvh bg-slate-950 overflow-hidden flex">
      {/* MAIN */}
      <div
        className={cn(
          'flex-1 flex flex-col h-full',
          isChatOpen ? 'md:pr-4' : ''
        )}
      >
        {/* ================= HEADER ================= */}
        {/* MOBILE = 10% HEIGHT */}
        {/* DESKTOP = AUTO */}
        <header className="h-[10%] md:h-auto flex items-center justify-between px-3 md:px-6 py-2 md:py-5 shrink-0">
          {/* ROOM ID */}
          <div className="flex items-center gap-2 glass-card rounded-full px-3 md:px-4 py-2">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />

            <span className="text-xs sm:text-sm md:text-base font-medium truncate max-w-[140px] sm:max-w-none">
              Room: {roomId}
            </span>
          </div>

          {/* COPY BUTTON */}
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="rounded-full glass-card border-slate-700 hover:bg-slate-800 text-xs sm:text-sm px-3 md:px-4 h-9 md:h-10 shrink-0"
          >
            {isCopied ? (
              <Check className="w-4 h-4 mr-1 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 mr-1" />
            )}

            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </header>

        {/* ================= VIDEO SECTION ================= */}
        {/* MOBILE = 70% HEIGHT */}
        {/* 50% REMOTE + 50% OWNER */}
        <main className="h-[70%] md:flex-1 px-3 md:px-6 pb-3 md:pb-6 flex flex-col md:flex-row gap-3 md:gap-4 min-h-0">
          {/* REMOTE VIDEO */}
          <div
            className={cn(
              'h-1/2 md:h-full flex-1 min-h-0',
              remoteStream ? 'block' : 'hidden md:block'
            )}
          >
            {remoteStream ? (
              <VideoPlayer
                stream={remoteStream}
                name="Remote User"
                className="h-full w-full rounded-2xl overflow-hidden"
              />
            ) : (
              <div className="h-full w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                Waiting for user...
              </div>
            )}
          </div>

          {/* LOCAL VIDEO */}
          <div
            className={cn(
              'h-1/2 md:h-full flex-1 min-h-0',
              !remoteStream && 'h-full'
            )}
          >
            <VideoPlayer
              stream={localStream}
              isLocal
              isMicOn={isMicOn}
              name={userName}
              className="h-full w-full rounded-2xl overflow-hidden"
            />
          </div>
        </main>

        {/* ================= CONTROL BAR ================= */}
        {/* MOBILE = 20% HEIGHT */}
        <div className="h-[20%] md:h-auto shrink-0 flex items-center justify-center px-3 md:px-6 pb-4 md:pb-8 bg-slate-950/90 backdrop-blur-sm md:bg-transparent">
          <ControlBar
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            isScreenSharing={isScreenSharing}
            isChatOpen={isChatOpen}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onLeaveCall={handleLeaveCall}
            onSendReaction={sendReaction}
            unreadCount={unreadCount}
          />
        </div>
      </div>

      {/* FLOATING REACTIONS */}
      <FloatingReactions lastReaction={lastReaction} />

      {/* CHAT */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
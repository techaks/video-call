'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ControlBar } from '@/components/ControlBar';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Button } from '@/components/ui/button';
import { Copy, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'Guest';
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;

  const [isCopied, setIsCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    messages,
    isConnected,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
  } = useWebRTC(roomId, userName);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLeaveCall = () => {
    // WebRTC cleanup is handled in hook unmount
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isChatOpen ? "md:pr-4" : ""
      )}>
        {/* Header */}
        <header className="flex items-center justify-between p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 glass-card rounded-full px-3 md:px-4 py-1.5 md:py-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0" />
            <span className="font-medium text-xs sm:text-sm md:text-base truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">Room: {roomId}</span>
          </div>
          
          <Button 
            variant="outline" 
            className="rounded-full glass-card border-slate-700 hover:bg-slate-800 text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-3 md:px-4 shrink-0"
            onClick={handleCopyLink}
          >
            {isCopied ? <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-400" /> : <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />}
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </header>

        {/* Video Grid */}
        <main className="flex-1 p-4 md:p-6 pt-0 min-h-0 flex flex-col md:flex-row gap-4">
          <div className={cn(
            "flex-1 transition-all duration-500",
            remoteStream ? "md:w-1/2" : "w-full"
          )}>
            <VideoPlayer
              stream={localStream}
              isLocal
              isMicOn={isMicOn}
              name={userName}
              className="h-full w-full"
            />
          </div>
          
          {remoteStream && (
            <div className="flex-1 md:w-1/2 transition-all duration-500">
              <VideoPlayer
                stream={remoteStream}
                name="Remote User"
                className="h-full w-full"
              />
            </div>
          )}
        </main>

        {/* Control Bar Container */}
        <div className="p-6 pt-2 flex justify-center pb-8">
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
          />
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
      />
    </div>
  );
}

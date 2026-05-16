import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { User, MicOff } from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  isMicOn?: boolean;
  name: string;
  className?: string;
}

export function VideoPlayer({ stream, isLocal = false, isMicOn = true, name, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Autoplay failed:", err);
      });
    }
  }, [stream]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-1 ring-white/10 flex items-center justify-center", className)}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn("h-full w-full object-cover", {
            "scale-x-[-1]": isLocal // Mirror local video
          })}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500">
          <User className="h-20 w-20 mb-4 opacity-20" />
          <p className="text-sm font-medium">Waiting for video...</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-md">
          <span className="text-sm font-medium text-white shadow-sm">{name} {isLocal && '(You)'}</span>
        </div>
        
        {!isMicOn && (
          <div className="rounded-full bg-red-500/90 p-2 text-white shadow-lg backdrop-blur-md">
            <MicOff className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
};

export function useWebRTC(roomId: string, userName: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteStreamTick, setRemoteStreamTick] = useState(0);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  const flushIceCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;
    
    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding queued ice candidate', e);
        }
      }
    }
  }, []);

  const initSocket = useCallback(() => {
    // Determine backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    socketRef.current = io(backendUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
      socketRef.current?.emit('join-room', roomId, userName);
      setIsConnected(true);
    });

    socketRef.current.on('user-connected', async (userId: string) => {
      console.log('User connected:', userId);
      toast.success('User joined the room');
      remoteUserIdRef.current = userId;
      // Start connection
      await createPeerConnection(userId);
      const offer = await peerConnectionRef.current?.createOffer();
      if (offer) {
        await peerConnectionRef.current?.setLocalDescription(offer);
        socketRef.current?.emit('offer', { to: userId, offer });
      }
    });

    socketRef.current.on('offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log('Received offer from:', data.from);
      remoteUserIdRef.current = data.from;
      if (!peerConnectionRef.current) {
        await createPeerConnection(data.from);
      }
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      await flushIceCandidates();
      const answer = await peerConnectionRef.current?.createAnswer();
      if (answer) {
        await peerConnectionRef.current?.setLocalDescription(answer);
        socketRef.current?.emit('answer', { to: data.from, answer });
      }
    });

    socketRef.current.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      console.log('Received answer from:', data.from);
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
      await flushIceCandidates();
    });

    socketRef.current.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      } else {
        iceCandidateQueueRef.current.push(data.candidate);
      }
    });

    socketRef.current.on('chat-message', (data: { text: string; sender: string; timestamp: number; fromId: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp,
          isLocal: false,
        },
      ]);
    });

    socketRef.current.on('user-disconnected', (userId: string) => {
      console.log('User disconnected:', userId);
      toast.error('User left the room');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setRemoteStream(null);
      remoteUserIdRef.current = null;
    });
  }, [roomId, userName]);

  const createPeerConnection = async (remoteUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        setRemoteStream((prevStream) => {
          const stream = prevStream || new MediaStream();
          stream.addTrack(event.track);
          return stream;
        });
      }
      // Force a re-render so VideoPlayer components can react to new tracks
      setRemoteStreamTick(t => t + 1);
    };

    const currentLocalStream = localStreamRef.current;
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentLocalStream);
      });
    }

    peerConnectionRef.current = pc;
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      toast.error('Could not access camera/microphone');
      return null;
    }
  };

  useEffect(() => {
    startLocalStream().then(() => {
      initSocket();
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initSocket]);

  const toggleMic = () => {
    const currentLocalStream = localStreamRef.current;
    if (currentLocalStream) {
      const audioTrack = currentLocalStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    const currentLocalStream = localStreamRef.current;
    if (currentLocalStream) {
      const videoTrack = currentLocalStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        screenTrack.onended = () => {
          stopScreenShare();
        };

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }
        
        // Update local video to show screen
        setLocalStream((prevStream) => {
          if (prevStream) {
            const newStream = new MediaStream([screenTrack, ...prevStream.getAudioTracks()]);
            localStreamRef.current = newStream;
            return newStream;
          }
          return prevStream;
        });
        
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      toast.error('Could not share screen');
    }
  };

  const stopScreenShare = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTrack = stream.getVideoTracks()[0];
    
    if (peerConnectionRef.current) {
      const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(videoTrack);
      }
    }

    setLocalStream((prevStream) => {
      if (prevStream) {
        const newStream = new MediaStream([videoTrack, ...prevStream.getAudioTracks()]);
        localStreamRef.current = newStream;
        return newStream;
      }
      return prevStream;
    });
    
    setIsScreenSharing(false);
    setIsCameraOn(true);
  };

  const sendMessage = (text: string) => {
    const msg = {
      id: Math.random().toString(36).substring(7),
      sender: userName,
      text,
      timestamp: Date.now(),
      isLocal: true,
    };
    
    socketRef.current?.emit('chat-message', {
      text,
      sender: userName,
      timestamp: msg.timestamp,
    });
    
    setMessages((prev) => [...prev, msg]);
  };

  return {
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
  };
}

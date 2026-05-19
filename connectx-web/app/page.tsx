'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Video, Sparkles, ArrowRight, Keyboard } from 'lucide-react';
import { Suspense } from 'react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setRoomId(roomParam);
    }
  }, [searchParams]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !userName) return;
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
  };

  const createRoom = () => {
    if (!userName) {
      alert('Please enter your name first');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${newRoomId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 ring-1 ring-white/10 backdrop-blur-xl">
            <Video className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">ConnectX</span>
          </h1>
          <p className="text-slate-400 text-lg">Premium 1-to-1 video calling. Fast, secure, and beautiful UI.</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Room ID</label>
              <div className="relative flex items-center">
                <Keyboard className="absolute left-4 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter code to join"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!roomId || !userName}
            >
              Join Call
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0f1423] text-slate-500 rounded-full">or</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline"
            className="w-full mt-8 py-6 text-lg rounded-xl font-semibold transition-all hover:bg-slate-800 border-slate-700"
            onClick={createRoom}
          >
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            New Meeting
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

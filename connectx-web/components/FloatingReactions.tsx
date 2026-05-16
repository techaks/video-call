import React, { useState, useEffect, useCallback } from 'react';

interface Reaction {
  id: number;
  emoji: string;
  left: number;
}

interface FloatingReactionsProps {
  lastReaction: { emoji: string; id: number } | null;
}

export function FloatingReactions({ lastReaction }: FloatingReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const addReaction = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    // Randomize position across the screen
    const left = Math.floor(Math.random() * 80) + 10; // 10% to 90%
    
    setReactions((prev) => [...prev, { id, emoji, left }]);

    // Remove reaction after animation finishes
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (lastReaction) {
      addReaction(lastReaction.emoji);
    }
  }, [lastReaction, addReaction]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute bottom-20 text-4xl sm:text-5xl animate-float-up transition-opacity duration-1000"
          style={{
            left: `${reaction.left}%`,
          }}
        >
          {reaction.emoji}
        </div>
      ))}
      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          10% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}

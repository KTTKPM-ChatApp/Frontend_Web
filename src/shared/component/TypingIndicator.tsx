import React, { useEffect, useState } from "react";

export function TypingIndicator({ text }: { text: string }) {
  const [dots, setDots] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => prev.map((d) => (d + 1) % 3));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start px-4 py-2">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-md border border-blue-100 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {text}
          </p>
          <div className="flex items-center gap-1 ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 shadow-sm"
                style={{
                  animation: 'typingBounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                  WebkitAnimation: 'typingBounce 1.4s ease-in-out infinite',
                  WebkitAnimationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

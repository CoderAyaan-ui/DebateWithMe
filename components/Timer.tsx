"use client";
import { useState, useEffect } from 'react';

interface TimerProps {
  initialMinutes: number;
  onTimeUp?: () => void;
}

export default function Timer({ initialMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className={`text-4xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
        {formatTime(timeLeft)}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Time remaining for preparation
      </div>
    </div>
  );
}

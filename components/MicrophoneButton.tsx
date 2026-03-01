"use client";
import { useState } from 'react';

interface MicrophoneButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function MicrophoneButton({ 
  isListening, 
  isSupported, 
  onStart, 
  onStop, 
  disabled = false 
}: MicrophoneButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isSupported) {
    return (
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center cursor-not-allowed">
          <svg
            className="w-12 h-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Speech recognition not supported
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={isListening ? onStop : onStart}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 transform
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isHovered && !disabled ? 'shadow-lg' : 'shadow-md'}
        `}
      >
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>
      <p className="mt-2 text-sm font-medium">
        {isListening ? 'Listening...' : 'Click to speak'}
      </p>
      {isListening && (
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
}

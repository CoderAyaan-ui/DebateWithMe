"use client";
import { useState } from 'react';

interface NotepadProps {
  initialText?: string;
  onTextChange?: (text: string) => void;
  placeholder?: string;
}

export default function Notepad({ initialText = '', onTextChange, placeholder = "Start writing your speech here..." }: NotepadProps) {
  const [text, setText] = useState(initialText);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange?.(newText);
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-base text-gray-900"
        style={{ minHeight: '400px' }}
      />
      <div className="mt-2 text-sm text-gray-500">
        Tip: A typical 7-minute speech is approximately 900-1000 words.
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '../../components/Timer';
import Notepad from '../../components/Notepad';
import { generateMotion, assignRole } from '../../lib/debateUtils';

export default function BritishParliamentaryDebate() {
  const router = useRouter();
  const [motion, setMotion] = useState('');
  const [role, setRole] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    // Generate motion and role when component mounts
    setMotion(generateMotion('british-parliamentary'));
    setRole(assignRole('british-parliamentary'));
  }, []);

  const handleTimeUp = () => {
    setIsTimeUp(true);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleSubmitSpeech = () => {
    // For now, just show an alert. Later this will connect to speech-to-text
    if (speechText.trim().length === 0) {
      alert('Please write your speech before submitting!');
      return;
    }
    
    // Navigate to speech delivery page with speech data
    const params = new URLSearchParams({
      motion: motion,
      role: role,
      speechText: speechText,
      debateType: 'british-parliamentary'
    });
    
    router.push(`/speech-delivery?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToHome}
            className="mb-4 text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
            British Parliamentary Debate
          </h1>
          <p className="text-center text-gray-600">
            Prepare your speech for the debate
          </p>
        </div>

        {/* Motion and Role Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Motion:</h2>
            <div className="text-xl font-medium text-purple-700 bg-purple-50 p-4 rounded border-l-4 border-purple-500">
              {motion}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Role:</h2>
            <div className="text-lg font-medium text-orange-700 bg-orange-50 p-4 rounded border-l-4 border-orange-500">
              {role}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Preparation Time
          </h2>
          <Timer initialMinutes={20} onTimeUp={handleTimeUp} />
          {isTimeUp && (
            <div className="mt-4 text-center text-red-600 font-semibold">
              Time's up! Please submit your speech.
            </div>
          )}
        </div>

        {/* Notepad */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Write Your Speech
          </h2>
          <Notepad
            initialText={speechText}
            onTextChange={setSpeechText}
            placeholder="Write your speech here. Remember to structure it with an introduction, arguments, and conclusion. In British Parliamentary style, focus on clear logical reasoning and engagement with opposing arguments."
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmitSpeech}
            className="bg-purple-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-purple-700 transition"
          >
            Submit Speech
          </button>
        </div>
      </div>
    </div>
  );
}

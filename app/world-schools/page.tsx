"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Timer from '../../components/Timer';
import Notepad from '../../components/Notepad';
import { generateMotion, assignRole } from '../../lib/debateUtils';

export default function WorldSchoolsDebate() {
  const router = useRouter();
  const [motion, setMotion] = useState('');
  const [role, setRole] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [prepTimeUp, setPrepTimeUp] = useState(false);
  const [isPrepPhase, setIsPrepPhase] = useState(true);

  useEffect(() => {
    // Generate motion and role when component mounts
    const timer = setTimeout(() => {
      const newMotion = generateMotion('world-schools');
      const newRole = assignRole('world-schools');
      setMotion(newMotion);
      setRole(newRole);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleStartListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          }
        }
        setTranscript((prev) => prev + finalTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      setIsListening(true);
    } else {
      alert('Speech recognition not supported in your browser');
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const handleSubmitSpeech = () => {
    if (!transcript.trim()) {
      alert('Please record your speech first');
      return;
    }
    
    const params = new URLSearchParams({
      motion: motion,
      role: role,
      speechText: transcript,
      debateType: 'world-schools'
    });
    
    router.push(`/feedback?${params.toString()}`);
  };

  const handlePrepTimeUp = () => {
    setPrepTimeUp(true);
    setIsPrepPhase(false);
  };

  const handleStartSpeech = () => {
    setIsPrepPhase(false);
    setIsTimeUp(false);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
            World Schools Debate
          </h1>
          <p className="text-center text-gray-600">
            Prepare and deliver your speech
          </p>
        </div>

        {/* Debate Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Motion</h2>
              <p className="text-gray-600">{motion || "Loading motion..."}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Role</h2>
              <p className="text-gray-600">{role || "Loading role..."}</p>
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isPrepPhase ? "Preparation Timer" : "Speech Timer"}
          </h2>
          {isPrepPhase ? (
            <Timer 
              initialMinutes={25} // 25 minutes prep time
              onTimeUp={handlePrepTimeUp}
            />
          ) : (
            <Timer 
              initialMinutes={8} // 8 minutes speech time
              onTimeUp={() => setIsTimeUp(true)}
            />
          )}
          {prepTimeUp && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-semibold">Preparation time is up! Start your speech.</p>
              <button
                onClick={handleStartSpeech}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Start Speech
              </button>
            </div>
          )}
          {isTimeUp && !isPrepPhase && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Time's up! Please submit your speech.</p>
            </div>
          )}
        </div>

        {/* Notepad Section - Only show during prep phase */}
        {isPrepPhase && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Speech Preparation Notes</h2>
            <Notepad 
              initialText={speechText}
              onTextChange={setSpeechText}
              placeholder="Use this space to prepare your speech arguments. You can jot down key points, evidence, and structure your speech here..."
            />
          </div>
        )}

        {/* Speech Recording Section - Only show after prep phase */}
        {!isPrepPhase && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Record Your Speech</h2>
            
            <div className="mb-4">
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-blue-100' 
                    : 'bg-green-600 hover:bg-green-700 text-blue-100'
                }`}
              >
                {isListening ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </button>
            </div>

            {isListening && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">🎤 Recording... Speak clearly into your microphone.</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg min-h-[150px] max-h-[300px] overflow-y-auto">
              <h3 className="font-semibold mb-2">Your Speech Transcript:</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {transcript || "Click 'Start Recording' to begin your speech..."}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons - Only show after prep phase */}
        {!isPrepPhase && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSubmitSpeech}
              disabled={!transcript.trim()}
              className="px-8 py-3 bg-blue-600 text-blue-100 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
            >
              Submit Speech
            </button>
            <button
              onClick={handleBackToHome}
              className="px-8 py-3 bg-gray-600 text-blue-100 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Prep Phase Action Button */}
        {isPrepPhase && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleStartSpeech}
              className="px-8 py-3 bg-green-600 text-blue-100 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Finish Preparation & Start Speech
            </button>
            <button
              onClick={handleBackToHome}
              className="px-8 py-3 bg-gray-600 text-blue-100 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { generateMotion } from "../../lib/debateUtils";

export default function QuickfireClash() {
  const router = useRouter();
  const [selectedMotion, setSelectedMotion] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [speechData, setSpeechData] = useState<{
    motion: string;
    role: string;
    speechText: string;
    transcript: string;
    debateType: 'quickfire-clash';
  } | null>(null);

  // Generate random motion on component mount
  useEffect(() => {
    const quickfireMotions = [
      "This House Would ban social media for under-18s",
      "This House Believes that college education should be free",
      "This House Would implement a four-day work week",
      "This House Believes that AI will do more harm than good",
      "This House Would abolish standardized testing",
      "This House Believes that space exploration is worth the cost",
      "This House Would ban single-use plastics globally",
      "This House Believes that universal basic income is necessary",
      "This House Would make voting mandatory",
      "This House Believes that remote work is the future"
    ];
    
    const randomMotion = quickfireMotions[Math.floor(Math.random() * quickfireMotions.length)];
    setSelectedMotion(randomMotion);
  }, []);

  // No authentication check - allow direct access

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isSpeaking) {
      handleFinishSpeaking();
    }
    return () => clearInterval(interval);
  }, [isSpeaking, timeLeft]);

  const handleMotionSelect = (motion: string) => {
    setSelectedMotion(motion);
  };

  const startSpeaking = () => {
    if (!selectedMotion) return;
    
    setIsSpeaking(true);
    setIsRecording(true);
    setTimeLeft(45);
    setTranscript("");
    
    // Start speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    }
  };

  const handleFinishSpeaking = () => {
    setIsSpeaking(false);
    setIsRecording(false);
    
    // Store speech data for feedback
    const data = {
      motion: selectedMotion,
      role: "Quickfire Speaker",
      speechText: transcript,
      transcript: transcript,
      debateType: "quickfire-clash" as const
    };
    
    setSpeechData(data);
    setShowFeedback(true);
  };

  const handleNewClash = () => {
    // Generate a new random motion
    const quickfireMotions = [
      "This House Would ban social media for under-18s",
      "This House Believes that college education should be free",
      "This House Would implement a four-day work week",
      "This House Believes that AI will do more harm than good",
      "This House Would abolish standardized testing",
      "This House Believes that space exploration is worth the cost",
      "This House Would ban single-use plastics globally",
      "This House Believes that universal basic income is necessary",
      "This House Would make voting mandatory",
      "This House Believes that remote work is the future"
    ];
    
    const randomMotion = quickfireMotions[Math.floor(Math.random() * quickfireMotions.length)];
    setSelectedMotion(randomMotion);
    setTranscript("");
    setShowFeedback(false);
    setSpeechData(null);
    setTimeLeft(45);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Navigate to feedback when showFeedback is true
  useEffect(() => {
    if (showFeedback && speechData) {
      const params = new URLSearchParams({
        motion: speechData.motion,
        role: speechData.role,
        speechText: speechData.speechText,
        transcript: speechData.transcript,
        debateType: speechData.debateType
      });
      router.push(`/feedback?${params.toString()}`);
    }
  }, [showFeedback, speechData, router]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBackToHome}
            className="mb-4 text-orange-600 hover:text-orange-800 underline"
          >
            ← Back to Home
          </button>
          <Image src="/Pink White Black Simple Podcast Logo copy.png" alt="DebateWithMe Logo" width={200} height={200} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Quickfire Clash ⚡</h1>
          <p className="text-lg text-gray-600">
            45 seconds to make your point. No prep, just speak!
          </p>
        </div>

        {/* Motion Display */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Motion:</h2>
            <p className="text-lg font-medium text-orange-700 bg-orange-50 p-3 rounded border-l-4 border-orange-500">
              {selectedMotion}
            </p>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-orange-600'} mb-2`}>
              {timeLeft}s
            </div>
            <p className="text-gray-600">
              {isSpeaking ? 'Time remaining' : 'Ready to speak?'}
            </p>
          </div>

          {/* Speaking Area */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isSpeaking ? 'Speaking...' : 'Your Speech'}
              </h3>
              {isRecording && (
                <div className="flex items-center space-x-2 text-red-600 mb-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Recording...</span>
                </div>
              )}
            </div>
            
            <div className="min-h-[200px] p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {transcript || "Your speech will appear here as you speak..."}
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="text-center space-y-4">
            {!isSpeaking ? (
              <button
                onClick={startSpeaking}
                className="bg-orange-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-orange-700 transition"
              >
                Start Speaking ⚡
              </button>
            ) : (
              <button
                onClick={handleFinishSpeaking}
                className="bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-red-700 transition"
              >
                Finish Speaking
              </button>
            )}
            
            <button
              onClick={handleNewClash}
              className="block mx-auto text-gray-600 hover:text-gray-800 underline"
            >
              Get New Motion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

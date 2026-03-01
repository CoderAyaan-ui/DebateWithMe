"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MicrophoneButton from '../../components/MicrophoneButton';
import { SpeechToTextService } from '../../lib/speechToText';

interface SpeechData {
  motion: string;
  role: string;
  speechText: string;
  debateType: 'world-schools' | 'british-parliamentary';
}

function SpeechDeliveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [speechData, setSpeechData] = useState<SpeechData | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [showPrepareMessage, setShowPrepareMessage] = useState(false);
  const [speechService] = useState(() => new SpeechToTextService());

  useEffect(() => {
    // Parse speech data from URL parameters
    const motion = searchParams.get('motion') || '';
    const role = searchParams.get('role') || '';
    const speechText = searchParams.get('speechText') || '';
    const debateType = (searchParams.get('debateType') as 'world-schools' | 'british-parliamentary') || 'world-schools';

    if (!motion || !role || !speechText) {
      router.push('/');
      return;
    }

    setSpeechData({ motion, role, speechText, debateType });

    // Show prepare message after 2 seconds
    const timer = setTimeout(() => {
      setShowPrepareMessage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const handleStartListening = () => {
    if (!speechService.supported) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    setError('');
    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');

    speechService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(prev => prev + (prev ? ' ' : '') + text);
          setInterimTranscript('');
        } else {
          setInterimTranscript(text);
        }
      },
      (errorMessage) => {
        setError(errorMessage);
        setIsListening(false);
      },
      () => {
        console.log('Speech recognition started');
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleFinishSpeech = () => {
    // Stop listening if active
    if (isListening) {
      handleStopListening();
    }
    
    // Check if speechData is available
    if (!speechData) {
      console.error('Speech data not available');
      return;
    }
    
    // Navigate to feedback page with all speech data
    const params = new URLSearchParams({
      motion: speechData.motion,
      role: speechData.role,
      speechText: speechData.speechText,
      debateType: speechData.debateType,
      transcript: transcript
    });
    
    router.push(`/feedback?${params.toString()}`);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!speechData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
            Speech Delivery
          </h1>
          <p className="text-center text-gray-600">
            Deliver your speech for the debate
          </p>
        </div>

        {/* Motion and Role Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Motion:</h2>
            <div className="text-lg font-medium text-blue-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              {speechData.motion}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Role:</h2>
            <div className="text-base font-medium text-green-700 bg-green-50 p-3 rounded border-l-4 border-green-500">
              {speechData.role}
            </div>
          </div>
        </div>

        {/* Prepare Message */}
        {showPrepareMessage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Prepare to speak!</strong> Your turn is coming up next.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Speech Notepad */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Prepared Speech
          </h2>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 min-h-[200px] max-h-[300px] overflow-y-auto">
            <p className="text-gray-700 whitespace-pre-wrap">
              {speechData.speechText}
            </p>
          </div>
        </div>

        {/* Microphone Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Deliver Your Speech
          </h2>
          <MicrophoneButton
            isListening={isListening}
            isSupported={speechService.supported}
            onStart={handleStartListening}
            onStop={handleStopListening}
          />
          {error && (
            <div className="mt-4 text-center text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Real-time Speech Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Live Speech Transcript
          </h2>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 min-h-[150px]">
            <div className="text-gray-700">
              {transcript && (
                <div className="mb-2">
                  <span className="font-medium">Final:</span> {transcript}
                </div>
              )}
              {interimTranscript && (
                <div className="text-gray-500 italic">
                  <span className="font-medium">Listening:</span> {interimTranscript}
                </div>
              )}
              {!transcript && !interimTranscript && (
                <div className="text-gray-400 italic">
                  Your speech will appear here as you speak...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Finish Speech Button */}
        <div className="text-center">
          <button
            onClick={handleFinishSpeech}
            className="bg-green-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-green-700 transition"
          >
            Finish Speech
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpeechDelivery() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading speech delivery...</p>
        </div>
      </div>
    }>
      <SpeechDeliveryContent />
    </Suspense>
  );
}

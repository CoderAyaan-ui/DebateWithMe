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
  
  // Multiplayer states
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [currentSpeakerName, setCurrentSpeakerName] = useState('');
  const [debateType, setDebateType] = useState<'world-schools' | 'british-parliamentary'>('world-schools');
  const [currentUserId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [lobbyId] = useState(() => searchParams?.get('lobbyId') || '');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [winner, setWinner] = useState('');
  const [debateFinished, setDebateFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes for formal debates

  useEffect(() => {
    // Parse speech data from URL parameters
    const motion = searchParams?.get('motion') || '';
    const role = searchParams?.get('role') || '';
    const speechText = searchParams?.get('speechText') || '';
    const debateType = (searchParams?.get('debateType') as 'world-schools' | 'british-parliamentary') || 'world-schools';
    
    // For multiplayer, generate default values if parameters missing
    if (!motion || !role || !speechText) {
      const defaultMotion = "This house believes that technology has made us less connected";
      const defaultRole = "1st Speaker";
      const defaultSpeechText = "Prepare your arguments for this debate...";
      
      setSpeechData({ 
        motion: motion || defaultMotion, 
        role: role || defaultRole, 
        speechText: speechText || defaultSpeechText, 
        debateType 
      });
      return;
    }

    // Use setTimeout to avoid synchronous setState
    const timer = setTimeout(() => {
      setSpeechData({ motion, role, speechText, debateType });
    }, 0);

    // Show prepare message after 2 seconds
    const prepareTimer = setTimeout(() => {
      setShowPrepareMessage(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(prepareTimer);
    };
  }, [searchParams]);

  // Set debate type and start multiplayer polling
  useEffect(() => {
    const type = (searchParams?.get('debateType') as 'world-schools' | 'british-parliamentary') || 'world-schools';
    setDebateType(type);
  }, [searchParams]);

  // Multiplayer polling for live transcript and speaker management
  useEffect(() => {
    if (lobbyId && debateType) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/lobby?debateType=${debateType}&getTranscript=true`);
          const data = await response.json();
          
          // Update live transcript
          if (data.transcript) {
            setLiveTranscript(data.transcript);
          }
          
          // Update current speaker info
          if (data.currentSpeakerIndex !== undefined) {
            setCurrentSpeakerIndex(data.currentSpeakerIndex);
            const speakers = debateType === 'world-schools' 
              ? ['1st Proposition', '1st Opposition', '2nd Proposition', '2nd Opposition', '3rd Proposition', '3rd Opposition']
              : ['Prime Minister', 'Leader of Opposition', 'Deputy Prime Minister', 'Deputy Leader of Opposition', 'Government Whip', 'Opposition Whip', 'Government Member', 'Opposition Member'];
            
            setCurrentSpeakerName(speakers[data.currentSpeakerIndex] || 'Unknown Speaker');
            
            // Check if it's my turn based on role
            const myRole = searchParams?.get('role') || '';
            setIsMyTurn(speakers[data.currentSpeakerIndex] === myRole);
          }
          
          // Update timer
          if (data.speakingTimeLeft !== undefined) {
            setTimeLeft(data.speakingTimeLeft);
          }
          
          // Check if debate is finished
          if (data.debateFinished) {
            setDebateFinished(true);
            // AI judging based on all transcripts
            if (data.allTranscripts && data.allTranscripts.length > 0) {
              determineWinner(data.allTranscripts);
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 1000);

      return () => clearInterval(pollInterval);
    }
  }, [lobbyId, debateType, searchParams]);

  // Update transcript when speaking and sync with server
  useEffect(() => {
    if (isMyTurn && isListening && transcript && lobbyId) {
      fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debateType,
          userId: currentUserId,
          userName: currentSpeakerName,
          action: 'update-transcript',
          transcript
        })
      });
    }
  }, [transcript, isMyTurn, isListening, currentUserId, currentSpeakerName, debateType, lobbyId]);

  // Timer countdown for current speaker
  useEffect(() => {
    if (timeLeft > 0 && !debateFinished) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        // Update server timer
        fetch('/api/lobby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            debateType,
            userId: currentUserId,
            userName: 'Timer',
            action: 'update-timer',
            timeLeft: timeLeft - 1
          })
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isMyTurn) {
      // Auto-finish when time is up
      handleFinishSpeech();
    }
  }, [timeLeft, debateFinished, isMyTurn, currentUserId, debateType]);

  const determineWinner = (allTranscripts: any[]) => {
    // AI judging based on content quality, arguments, and evidence
    let propositionScore = 0;
    let oppositionScore = 0;
    
    allTranscripts.forEach((speech) => {
      const content = speech.transcript.toLowerCase();
      const wordCount = speech.transcript.split(' ').length;
      let score = wordCount;
      
      // Bonus for logical connectors
      if (content.includes('because') || content.includes('therefore') || content.includes('however')) {
        score += 50;
      }
      
      // Bonus for evidence
      if (content.includes('according to') || content.includes('research shows') || content.includes('statistics')) {
        score += 100;
      }
      
      // Bonus for rebuttals
      if (content.includes('my opponent') || content.includes('they claim') || content.includes('contrary to')) {
        score += 75;
      }
      
      // Assign to team based on role
      if (speech.role.includes('Proposition') || speech.role.includes('Prime') || speech.role.includes('Deputy Prime') || speech.role.includes('Government')) {
        propositionScore += score;
      } else {
        oppositionScore += score;
      }
    });
    
    const winnerName = propositionScore > oppositionScore ? 'Proposition' : 'Opposition';
    const reason = `Proposition: ${propositionScore} points vs Opposition: ${oppositionScore} points`;
    
    setWinner(`${winnerName} wins! ${reason}`);
  };

  const handleFinishSpeech = () => {
    if (transcript.trim()) {
      // Submit speech to server for judging
      fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debateType,
          userId: currentUserId,
          userName: currentSpeakerName,
          action: 'submit-speech',
          transcript: transcript.trim(),
          speechRole: searchParams?.get('role') || 'Speaker'
        })
      });
    }
    
    // Move to next speaker
    fetch('/api/lobby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        debateType,
        userId: currentUserId,
        userName: 'System',
        action: 'next-speaker'
      })
    });
    
    // Stop listening
    if (isListening) {
      handleStopListening();
    }
  };

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

        {/* Multiplayer Live Transcript */}
        {lobbyId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Debate</h2>
            {debateFinished ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Debate Finished!</h3>
                <p className="text-yellow-700">{winner}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Speaker: <span className="font-semibold">{currentSpeakerName}</span></p>
                    <p className="text-sm text-gray-600">Time Remaining: <span className="font-semibold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></p>
                  </div>
                  <div className="text-right">
                    {isMyTurn ? (
                      <span className="text-green-600 font-semibold">Your Turn!</span>
                    ) : (
                      <span className="text-gray-600">Waiting...</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded min-h-[150px] max-h-[200px] overflow-y-auto">
                  <h3 className="font-semibold mb-2">Live Transcript:</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {liveTranscript || "Waiting for speaker to begin..."}
                  </p>
                </div>
              </>
            )}
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

        {/* Microphone Button - Only show when it's your turn */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            {isMyTurn ? "Your Turn to Speak" : "Waiting for Your Turn"}
          </h2>
          
          {isMyTurn ? (
            <>
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
              
              {/* Finish Speech Button for Multiplayer */}
              {lobbyId && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleFinishSpeech}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    Finish Speech & Next Speaker
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-600">
                <p className="text-lg mb-2">⏳ Waiting for current speaker to finish...</p>
                <p className="text-sm">You'll see the microphone button when it's your turn</p>
              </div>
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

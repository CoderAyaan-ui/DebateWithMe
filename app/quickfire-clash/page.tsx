"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { generateMotion } from "../../lib/debateUtils";
import MicrophoneButton from "../../components/MicrophoneButton";
import { SpeechToTextService } from "../../lib/speechToText";

export default function QuickfireClash() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMotion, setSelectedMotion] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [otherPlayerTranscript, setOtherPlayerTranscript] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentUserId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [debateFinished, setDebateFinished] = useState(false);
  const [winner, setWinner] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechService] = useState(() => new SpeechToTextService());

  // Get lobby info from URL
  const lobbyId = searchParams?.get('lobbyId') || '';

  // Generate random motion on component mount
  useEffect(() => {
    const quickfireMotions = [
      "This House Would ban social media for under-18s",
      "This House Believes that college education should be free",
      "This House Would implement a four-day work week",
      "This House Believes that AI will do more harm than good",
      "This House Would abolish standardized testing",
      "This House Would ban single-use plastics globally",
      "This House Believes that universal basic income is necessary",
      "This House Would make voting mandatory",
      "This House Believes that remote work is the future"
    ];
    
    const randomMotion = quickfireMotions[Math.floor(Math.random() * quickfireMotions.length)];
    setSelectedMotion(randomMotion);
  }, []);

  // Poll for multiplayer updates
  useEffect(() => {
    if (lobbyId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/lobby?debateType=quickfire-clash&getTranscript=true`);
          const data = await response.json();
          
          // Update other player's transcript
          if (data.transcript && data.transcript !== transcript) {
            setOtherPlayerTranscript(data.transcript);
          }
          
          // Update speaker info
          if (data.currentSpeakerIndex !== undefined) {
            setCurrentSpeakerIndex(data.currentSpeakerIndex);
            const myPlayerIndex = data.players?.findIndex((p: any) => p.id === currentUserId);
            setIsMyTurn(myPlayerIndex === data.currentSpeakerIndex);
          }
          
          if (data.roundNumber) setRoundNumber(data.roundNumber);
          if (data.speakingTimeLeft) setTimeLeft(data.speakingTimeLeft);
          if (data.players) setPlayers(data.players);
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000); // Reduced from 1000ms to 2000ms to reduce lag

      return () => clearInterval(pollInterval);
    }
  }, [lobbyId, currentUserId, transcript]);

  // Timer effect with multiplayer sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          // Update timer on server for other players
          fetch('/api/lobby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              debateType: 'quickfire-clash',
              userId: currentUserId,
              userName: 'Player',
              action: 'update-timer',
              timeLeft: newTime
            })
          });
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isSpeaking) {
      handleFinishSpeaking();
    }
    return () => clearInterval(interval);
  }, [isSpeaking, timeLeft, currentUserId]);

  // Update transcript when recording
  useEffect(() => {
    if (isMyTurn && isRecording && transcript) {
      fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debateType: 'quickfire-clash',
          userId: currentUserId,
          userName: 'Player',
          action: 'update-transcript',
          transcript
        })
      });
    }
  }, [transcript, isMyTurn, isRecording, currentUserId]);

  // Speech recognition setup
  useEffect(() => {
    // Speech recognition will be handled by the MicrophoneButton component
  }, []);

  const handleStartListening = () => {
    if (!speechService.supported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    speechService.startListening(
      (text: string, isFinal: boolean) => {
        setTranscript((prev) => prev + (isFinal ? ' ' : '') + text);
        setInterimTranscript(isFinal ? '' : text);
      },
      (error: string) => {
        console.error('Speech error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(true);
        setInterimTranscript('');
      },
      () => {
        setIsListening(false);
        setInterimTranscript('');
      }
    );
  };

  const handleStopListening = () => {
    speechService.stopListening();
  };

  const handleStartSpeaking = () => {
    if (!isMyTurn) return;
    
    setIsSpeaking(true);
    setIsRecording(true);
    setIsListening(true);
    setTimeLeft(45);
    setTranscript('');
    setInterimTranscript('');
    
    // Start speech recognition
    speechService.startListening(
      (text: string, isFinal: boolean) => {
        setTranscript((prev) => prev + (isFinal ? ' ' : '') + text);
        setInterimTranscript(isFinal ? '' : text);
      },
      (error: string) => {
        console.error('Speech error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(true);
        setInterimTranscript('');
      },
      () => {
        setIsListening(false);
        setInterimTranscript('');
      }
    );
  };

  const handleFinishSpeaking = () => {
    setIsSpeaking(false);
    setIsRecording(false);
    setIsListening(false);
    handleStopListening();
    
    // Move to next speaker or finish
    if (roundNumber < 5) {
      fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debateType: 'quickfire-clash',
          userId: currentUserId,
          userName: 'Player',
          action: 'next-speaker'
        })
      });
    } else {
      // Debate finished - determine winner
      determineWinner();
    }
  };

  const determineWinner = async () => {
    setDebateFinished(true);
    // Simple AI judging based on transcript length and content
    const myScore = transcript.length + (transcript.split(' ').length * 2);
    const opponentScore = otherPlayerTranscript.length + (otherPlayerTranscript.split(' ').length * 2);
    
    const winnerName = myScore > opponentScore ? 'You' : 'Opponent';
    const reason = myScore > opponentScore 
      ? `More comprehensive argument (${myScore} vs ${opponentScore} points)`
      : `More detailed argument (${opponentScore} vs ${myScore} points)`;
    
    setWinner(`${winnerName} won! ${reason}`);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Navigate to feedback when showFeedback is true
  useEffect(() => {
    if (showFeedback) {
      const params = new URLSearchParams({
        motion: selectedMotion,
        role: 'Speaker',
        speechText: transcript,
        transcript: transcript,
        debateType: 'quickfire-clash'
      });
      router.push(`/feedback?${params.toString()}`);
    }
  }, [showFeedback, transcript, selectedMotion, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="text-center px-4 w-full max-w-6xl">
        <Image src="/Pink White Black Simple Podcast Logo copy.png" alt="DebateWithMe Logo" width={200} height={200} className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Quickfire Clash</h1>
        
        {/* Motion Display */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Motion:</h2>
          <p className="text-lg">{selectedMotion}</p>
        </div>

        {/* Game Status */}
        {debateFinished ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Debate Finished!</h2>
            <p className="text-lg text-yellow-700">{winner}</p>
            <div className="mt-4 space-y-2">
              <div className="text-left bg-white p-3 rounded">
                <strong>Your arguments:</strong> {transcript}
              </div>
              <div className="text-left bg-white p-3 rounded">
                <strong>Opponent's arguments:</strong> {otherPlayerTranscript}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Players and Turn Info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Players:</h3>
                {players.map((player: any, index: number) => (
                  <div key={player.id} className={`p-2 rounded ${index === currentSpeakerIndex ? 'bg-blue-200' : ''}`}>
                    {player.name} {index === currentSpeakerIndex && '(Speaking)'}
                  </div>
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Round {roundNumber}/5</h3>
                <p className="text-2xl font-bold">{timeLeft}s</p>
                {isMyTurn ? (
                  <p className="text-green-600 font-semibold">Your Turn!</p>
                ) : (
                  <p className="text-gray-600">Opponent's turn...</p>
                )}
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Live Status</h3>
                <p className="text-sm">Connected: {players.length}/2</p>
                <p className="text-sm">Speaker: {currentSpeakerIndex === 0 ? 'Player 1' : 'Player 2'}</p>
              </div>
            </div>

            {/* Live Transcripts */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Speech:</h3>
                <div className="text-left bg-white p-3 rounded min-h-[150px] max-h-[200px] overflow-y-auto">
                  {transcript || "Start speaking when it's your turn..."}
                  {interimTranscript && (
                    <span className="text-gray-500 italic"> {interimTranscript}</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Opponent's Speech:</h3>
                <div className="text-left bg-white p-3 rounded min-h-[150px] max-h-[200px] overflow-y-auto">
                  {otherPlayerTranscript || "Waiting for opponent to speak..."}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              {isMyTurn && !isSpeaking && (
                <MicrophoneButton
                  isListening={isListening}
                  isSupported={speechService.supported}
                  onStart={handleStartSpeaking}
                  onStop={handleFinishSpeaking}
                />
              )}
              {isMyTurn && isSpeaking && (
                <button
                  onClick={handleFinishSpeaking}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Finish Speaking
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

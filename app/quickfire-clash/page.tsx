"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function QuickfireClash() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Basic game states
  const [selectedMotion, setSelectedMotion] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [player1Speech, setPlayer1Speech] = useState("");
  const [player2Speech, setPlayer2Speech] = useState("");
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState("");
  
  // Speech recognition instance
  const [recognition, setRecognition] = useState<any>(null);

  // Generate random motion
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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          
          setTranscript((prev) => prev + finalTranscript);
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech error:', event.error);
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            handleFinishSpeaking();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentPlayer(1);
    setRoundNumber(1);
    setTimeLeft(45);
  };

  const startSpeaking = () => {
    if (!recognition) {
      alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    setIsSpeaking(true);
    setIsListening(true);
    setTimeLeft(45);
    setTranscript("");
    
    recognition.start();
  };

  const handleFinishSpeaking = () => {
    setIsSpeaking(false);
    setIsListening(false);
    
    if (recognition) {
      recognition.stop();
    }
    
    // Save the speech
    if (currentPlayer === 1) {
      setPlayer1Speech(transcript);
    } else {
      setPlayer2Speech(transcript);
    }
    
    // Check if game is finished
    if (roundNumber >= 5) {
      finishGame();
    } else {
      // Move to next round
      setRoundNumber(prev => prev + 1);
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setTimeLeft(45);
      setTranscript("");
    }
  };

  const finishGame = () => {
    setGameFinished(true);
    
    // Simple scoring based on word count
    const player1Score = player1Speech.split(' ').length;
    const player2Score = player2Speech.split(' ').length;
    
    if (player1Score > player2Score) {
      setWinner(`Player 1 wins! (${player1Score} words vs ${player2Score} words)`);
    } else if (player2Score > player1Score) {
      setWinner(`Player 2 wins! (${player2Score} words vs ${player1Score} words)`);
    } else {
      setWinner(`It's a tie! Both players spoke ${player1Score} words`);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentPlayer(1);
    setIsSpeaking(false);
    setTimeLeft(45);
    setTranscript("");
    setIsListening(false);
    setRoundNumber(1);
    setPlayer1Speech("");
    setPlayer2Speech("");
    setGameFinished(false);
    setWinner("");
  };

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

        {!gameStarted ? (
          // Start Game Screen
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Ready to Debate?</h2>
            <p className="text-gray-700 mb-6">
              Two players will debate the motion in 5 rounds of 45 seconds each.
              Take turns speaking and make your arguments count!
            </p>
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
            >
              Start Debate
            </button>
          </div>
        ) : gameFinished ? (
          // Game Finished Screen
          <div className="bg-yellow-50 border-2 border-yellow-200 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-yellow-800 mb-4">Debate Finished!</h2>
            <p className="text-xl text-yellow-700 mb-6">{winner}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Player 1 Arguments:</h3>
                <p className="text-left">{player1Speech || "No speech recorded"}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Player 2 Arguments:</h3>
                <p className="text-left">{player2Speech || "No speech recorded"}</p>
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              Play Again
            </button>
          </div>
        ) : (
          // Game Playing Screen
          <>
            {/* Game Status */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Round {roundNumber}/5</h3>
                <p className="text-2xl font-bold">{timeLeft}s</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Speaker</h3>
                <p className="text-xl font-bold text-green-600">Player {currentPlayer}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Status</h3>
                <p className="text-sm">{isListening ? '🎤 Recording...' : 'Ready to speak'}</p>
              </div>
            </div>

            {/* Speech Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Player 1 Speech:</h3>
                <div className="text-left bg-white p-3 rounded min-h-[150px] max-h-[200px] overflow-y-auto">
                  {currentPlayer === 1 ? transcript : player1Speech}
                  {currentPlayer === 1 && isListening && <span className="text-red-500"> 🎤</span>}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Player 2 Speech:</h3>
                <div className="text-left bg-white p-3 rounded min-h-[150px] max-h-[200px] overflow-y-auto">
                  {currentPlayer === 2 ? transcript : player2Speech}
                  {currentPlayer === 2 && isListening && <span className="text-red-500"> 🎤</span>}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              {!isSpeaking ? (
                <button
                  onClick={startSpeaking}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
                >
                  🎤 Start Speaking (45s)
                </button>
              ) : (
                <button
                  onClick={handleFinishSpeaking}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition text-lg font-semibold"
                >
                  ⏹️ Finish Speaking
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

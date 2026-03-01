"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function QuickfireClash() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Multiplayer states
  const [selectedMotion, setSelectedMotion] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [player1Speech, setPlayer1Speech] = useState("");
  const [player2Speech, setPlayer2Speech] = useState("");
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState("");
  const [connectedPlayers, setConnectedPlayers] = useState(0);
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
    
    // Generate player ID
    const newPlayerId = Math.random().toString(36).substr(2, 9);
    setPlayerId(newPlayerId);
    
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
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

  // Simple multiplayer simulation using localStorage
  useEffect(() => {
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      try {
        // Get current game state from localStorage
        const gameState = localStorage.getItem('quickfireGameState');
        if (gameState) {
          const state = JSON.parse(gameState);
          
          // Update connected players
          if (state.connectedPlayers !== connectedPlayers) {
            setConnectedPlayers(state.connectedPlayers);
          }
          
          // Update current player
          if (state.currentPlayer !== currentPlayer) {
            setCurrentPlayer(state.currentPlayer);
          }
          
          // Update round
          if (state.roundNumber !== roundNumber) {
            setRoundNumber(state.roundNumber);
          }
          
          // Update timer
          if (state.timeLeft !== timeLeft) {
            setTimeLeft(state.timeLeft);
          }
          
          // Update speeches
          if (state.player1Speech !== player1Speech) {
            setPlayer1Speech(state.player1Speech);
          }
          if (state.player2Speech !== player2Speech) {
            setPlayer2Speech(state.player2Speech);
          }
          
          // CRITICAL: Check if it's my turn
          if (state.player1Id === playerId) {
            // I am Player 1
            setIsMyTurn(state.currentPlayer === 1);
          } else if (state.player2Id === playerId) {
            // I am Player 2
            setIsMyTurn(state.currentPlayer === 2);
          }
        }
      } catch (error) {
        console.error('Multiplayer sync error:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, playerId, currentPlayer, roundNumber, timeLeft, player1Speech, player2Speech, connectedPlayers]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Update timer in localStorage
          const gameState = localStorage.getItem('quickfireGameState');
          if (gameState) {
            const state = JSON.parse(gameState);
            state.timeLeft = newTime;
            localStorage.setItem('quickfireGameState', JSON.stringify(state));
          }
          
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
    
    // Initialize game state in localStorage
    const gameState = {
      connectedPlayers: 1,
      currentPlayer: 1,
      roundNumber: 1,
      timeLeft: 45,
      player1Id: playerId,
      player2Id: '',
      player1Speech: '',
      player2Speech: '',
      gameFinished: false
    };
    
    localStorage.setItem('quickfireGameState', JSON.stringify(gameState));
    setCurrentPlayer(1);
    setIsMyTurn(true); // Player 1 always starts
  };

  const joinGame = () => {
    setGameStarted(true);
    
    // Join existing game
    const gameState = localStorage.getItem('quickfireGameState');
    if (gameState) {
      const state = JSON.parse(gameState);
      state.connectedPlayers = 2;
      state.player2Id = playerId;
      localStorage.setItem('quickfireGameState', JSON.stringify(state));
      setCurrentPlayer(state.currentPlayer);
      setIsMyTurn(state.currentPlayer === 2); // Player 2's turn depends on current player
    }
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
    
    // Update game state
    const gameState = localStorage.getItem('quickfireGameState');
    if (gameState) {
      const state = JSON.parse(gameState);
      state.timeLeft = 45;
      localStorage.setItem('quickfireGameState', JSON.stringify(state));
    }
  };

  const handleFinishSpeaking = () => {
    setIsSpeaking(false);
    setIsListening(false);
    
    if (recognition) {
      recognition.stop();
    }
    
    // Update game state with speech
    const gameState = localStorage.getItem('quickfireGameState');
    if (gameState) {
      const state = JSON.parse(gameState);
      
      if (currentPlayer === 1) {
        state.player1Speech = transcript;
        setPlayer1Speech(transcript);
      } else {
        state.player2Speech = transcript;
        setPlayer2Speech(transcript);
      }
      
      // Check if game is finished
      if (state.roundNumber >= 5) {
        state.gameFinished = true;
        setGameFinished(true);
        
        // Calculate winner
        const player1Score = state.player1Speech.split(' ').length;
        const player2Score = state.player2Speech.split(' ').length;
        
        if (player1Score > player2Score) {
          setWinner(`Player 1 wins! (${player1Score} words vs ${player2Score} words)`);
        } else if (player2Score > player1Score) {
          setWinner(`Player 2 wins! (${player2Score} words vs ${player1Score} words)`);
        } else {
          setWinner(`It's a tie! Both players spoke ${player1Score} words`);
        }
      } else {
        // Move to next round
        state.roundNumber++;
        state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
        state.timeLeft = 45;
        setRoundNumber(state.roundNumber);
        setCurrentPlayer(state.currentPlayer);
        setTimeLeft(45);
        setTranscript("");
        
        // CRITICAL: Update my turn status for both players
        if (state.player1Id === playerId) {
          // I am Player 1
          setIsMyTurn(state.currentPlayer === 1);
        } else if (state.player2Id === playerId) {
          // I am Player 2
          setIsMyTurn(state.currentPlayer === 2);
        }
      }
      
      localStorage.setItem('quickfireGameState', JSON.stringify(state));
    }
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
          // Start/Join Game Screen
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Multiplayer Debate</h2>
            <p className="text-gray-700 mb-6">
              Two players will debate the motion in 5 rounds of 45 seconds each.
              Take turns speaking and make your arguments count!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
              >
                Create New Game
              </button>
              <button
                onClick={joinGame}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
              >
                Join Existing Game
              </button>
            </div>
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
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              Play Again
            </button>
          </div>
        ) : (
          // Game Playing Screen
          <>
            {/* Game Status */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Round {roundNumber}/5</h3>
                <p className="text-2xl font-bold">{timeLeft}s</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Speaker</h3>
                <p className="text-xl font-bold text-green-600">Player {currentPlayer}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Turn</h3>
                <p className={`text-xl font-bold ${isMyTurn ? 'text-green-600' : 'text-red-600'}`}>
                  {isMyTurn ? 'YES!' : 'WAIT...'}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Players</h3>
                <p className="text-sm">{connectedPlayers}/2 Connected</p>
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
              {isMyTurn && !isSpeaking && (
                <button
                  onClick={startSpeaking}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
                >
                  🎤 Start Speaking (45s)
                </button>
              )}
              {isMyTurn && isSpeaking && (
                <button
                  onClick={handleFinishSpeaking}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition text-lg font-semibold"
                >
                  ⏹️ Finish Speaking
                </button>
              )}
              {!isMyTurn && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600">Waiting for Player {currentPlayer} to speak...</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

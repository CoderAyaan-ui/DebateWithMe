"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import MultiplayerManager, { Player, Lobby } from "../../lib/multiplayerManager";

export default function MultiplayerMatching() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [debateType, setDebateType] = useState<'world-schools' | 'british-parliamentary' | 'quickfire-clash' | null>(null);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [debateFound, setDebateFound] = useState(false);
  const [currentUserId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [userName] = useState(() => `Player ${currentUserId.substr(0, 4)}`);
  const [multiplayerManager] = useState(() => MultiplayerManager.getInstance());

  useEffect(() => {
    const type = searchParams.get('type') as 'world-schools' | 'british-parliamentary' | 'quickfire-clash';
    if (type) {
      setDebateType(type);
      setIsSearching(true);
      
      // Join or create lobby
      const lobby = multiplayerManager.createOrJoinLobby(type, currentUserId, userName);
      setCurrentLobby(lobby);
    }
  }, [searchParams, currentUserId, userName, multiplayerManager]);

  useEffect(() => {
    if (!currentLobby) return;

    // Set up polling for real-time updates
    const stopPolling = multiplayerManager.pollForUpdates((lobbies) => {
      const updatedLobby = lobbies.get(currentLobby.id);
      if (updatedLobby && JSON.stringify(updatedLobby) !== JSON.stringify(currentLobby)) {
        setCurrentLobby(updatedLobby);
        
        // Check if lobby is full and debate should start
        if (updatedLobby.players.length >= updatedLobby.requiredPlayers && !updatedLobby.isActive) {
          setDebateFound(true);
          startDebate(updatedLobby);
        }
      }
    });

    return () => stopPolling();
  }, [currentLobby?.id, multiplayerManager]); // Only depend on lobby ID, not the whole lobby object

  const startDebate = (lobby: Lobby) => {
    // Generate motion and start debate
    const motion = generateMotion(lobby.debateType);
    multiplayerManager.startDebate(lobby.id, motion);
    
    // Navigate to debate after 2 seconds
    setTimeout(() => {
      navigateToDebate(lobby);
    }, 2000);
  };

  const navigateToDebate = (lobby: Lobby) => {
    const role = assignRole(lobby.debateType, currentUserId, lobby.players);
    
    const params = new URLSearchParams({
      motion: lobby.motion || '',
      role,
      debateType: lobby.debateType,
      multiplayer: 'true',
      playerId: currentUserId,
      lobbyId: lobby.id
    });

    if (lobby.debateType === 'quickfire-clash') {
      router.push(`/quickfire-clash?${params.toString()}`);
    } else {
      router.push(`/speech-delivery?${params.toString()}`);
    }
  };

  const generateMotion = (type: 'world-schools' | 'british-parliamentary' | 'quickfire-clash'): string => {
    const worldSchoolsMotions = [
      "This House Would ban social media for under-18s",
      "This House Believes that college education should be free",
      "This House Would implement a four-day work week",
      "This House Believes that AI will do more harm than good",
      "This House Would abolish standardized testing"
    ];

    const britishParliamentaryMotions = [
      "This House Would break up big tech companies",
      "This House Believes that post-colonial reparations are necessary",
      "This House Would implement a universal basic income funded by wealth tax",
      "This House Believes that democratic systems should incorporate elements of sortition",
      "This House Would ban all forms of animal agriculture"
    ];

    const quickfireMotions = [
      "This House Would ban single-use plastics globally",
      "This House Believes that universal basic income is necessary",
      "This House Would make voting mandatory",
      "This House Believes that remote work is the future",
      "This House Would abolish the concept of nation-states"
    ];

    const motions = type === 'world-schools' ? worldSchoolsMotions :
                   type === 'british-parliamentary' ? britishParliamentaryMotions :
                   quickfireMotions;

    return motions[Math.floor(Math.random() * motions.length)];
  };

  const assignRole = (type: 'world-schools' | 'british-parliamentary' | 'quickfire-clash', playerId: string, players: Player[]): string => {
    const worldSchoolsRoles = [
      "1st Speaker (Opening Government)",
      "2nd Speaker (Opening Government)",
      "3rd Speaker (Opening Government)",
      "1st Speaker (Opening Opposition)",
      "2nd Speaker (Opening Opposition)",
      "3rd Speaker (Opening Opposition)"
    ];

    const britishParliamentaryRoles = [
      "Prime Minister",
      "Deputy Prime Minister",
      "Government Whip",
      "Government Member",
      "Leader of Opposition",
      "Deputy Leader of Opposition",
      "Opposition Whip",
      "Opposition Member"
    ];

    const quickfireRoles = ["Speaker 1", "Speaker 2"];

    const roles = type === 'world-schools' ? worldSchoolsRoles :
                 type === 'british-parliamentary' ? britishParliamentaryRoles :
                 quickfireRoles;

    // Assign role based on player join order
    const playerIndex = players.findIndex(p => p.id === playerId);
    return roles[playerIndex] || roles[0];
  };

  const handleCancelSearch = () => {
    if (currentLobby) {
      multiplayerManager.leaveLobby(currentUserId);
    }
    setIsSearching(false);
    router.push('/');
  };

  if (!debateType || !currentLobby) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up multiplayer...</p>
        </div>
      </div>
    );
  }

  const requiredPlayers = currentLobby.requiredPlayers;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/Pink White Black Simple Podcast Logo copy.png" alt="DebateWithMe Logo" width={200} height={200} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Finding Players</h1>
          <p className="text-lg text-gray-600">
            {debateType === 'world-schools' && "World Schools Debate"}
            {debateType === 'british-parliamentary' && "British Parliamentary Debate"}
            {debateType === 'quickfire-clash' && "Quickfire Clash"}
          </p>
        </div>

        {/* Matching Status */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Search Status */}
            <div className="text-center mb-6">
              {debateFound ? (
                <div className="text-green-600">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-2">Debate Starting!</h2>
                  <p className="text-gray-600">All players found - starting debate...</p>
                </div>
              ) : (
                <div className="text-blue-600">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h2 className="text-2xl font-bold mb-2">Waiting for Players...</h2>
                  <p className="text-gray-600">
                    {currentLobby.players.length}/{requiredPlayers} players connected
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Share this link with friends to join: {typeof window !== 'undefined' ? window.location.href : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Players List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Players in Lobby:</h3>
              <div className="space-y-2">
                {currentLobby.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.id === currentUserId ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {player.name}
                          {player.id === currentUserId && " (You)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(player.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {player.isHost && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Host</span>
                    )}
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: requiredPlayers - currentLobby.players.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ?
                      </div>
                      <p className="text-gray-400">Waiting for player to join...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Button */}
            {!debateFound && (
              <div className="text-center">
                <button
                  onClick={handleCancelSearch}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Leave Lobby
                </button>
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Debate Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Type:</strong> {debateType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><strong>Players Required:</strong> {requiredPlayers}</p>
              <p><strong>Speaking Time:</strong> {
                debateType === 'quickfire-clash' ? '45 seconds per speaker' :
                '7 minutes per speaker'
              }</p>
              <p><strong>Format:</strong> {
                debateType === 'world-schools' ? '3 vs 3 team debate' :
                debateType === 'british-parliamentary' ? '4 vs 4 team debate' :
                '1 vs 1 quick debate'
              }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

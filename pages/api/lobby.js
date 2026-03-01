// Global lobby state (in production, this would be in a database)
const globalLobbies = new Map();
const globalTranscripts = new Map(); // Store live transcripts
const globalTimers = new Map(); // Store speaking timers

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { debateType, getTranscript } = req.query;
    
    if (!debateType) {
      return res.status(400).json({ error: 'debateType required' });
    }

    const lobbyId = `${debateType}-global`;
    let lobby = globalLobbies.get(lobbyId);

    if (!lobby) {
      lobby = {
        id: lobbyId,
        debateType,
        players: [],
        requiredPlayers: getRequiredPlayers(debateType),
        createdAt: new Date().toISOString(),
        isActive: false,
        currentSpeakerIndex: 0,
        speakingTimeLeft: 45,
        roundNumber: 1
      };
      globalLobbies.set(lobbyId, lobby);
    }

    // Add transcript data if requested
    if (getTranscript) {
      const transcript = globalTranscripts.get(lobbyId) || '';
      return res.status(200).json({ ...lobby, transcript });
    }

    return res.status(200).json(lobby);
  }

  if (req.method === 'POST') {
    const { debateType, userId, userName, action, transcript, timeLeft } = req.body;
    
    if (!debateType || !userId || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lobbyId = `${debateType}-global`;
    let lobby = globalLobbies.get(lobbyId);

    if (!lobby) {
      lobby = {
        id: lobbyId,
        debateType,
        players: [],
        requiredPlayers: getRequiredPlayers(debateType),
        createdAt: new Date().toISOString(),
        isActive: false,
        currentSpeakerIndex: 0,
        speakingTimeLeft: 45,
        roundNumber: 1
      };
      globalLobbies.set(lobbyId, lobby);
    }

    // Handle different actions
    if (action === 'update-transcript') {
      globalTranscripts.set(lobbyId, transcript || '');
      return res.status(200).json({ success: true });
    }

    if (action === 'update-timer') {
      lobby.speakingTimeLeft = timeLeft;
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({ success: true });
    }

    if (action === 'next-speaker') {
      lobby.currentSpeakerIndex = (lobby.currentSpeakerIndex + 1) % lobby.players.length;
      lobby.speakingTimeLeft = 45;
      if (lobby.currentSpeakerIndex === 0) {
        lobby.roundNumber++;
      }
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({ ...lobby });
    }

    // Reset lobby if full or active
    if (lobby.players.length >= lobby.requiredPlayers || lobby.isActive) {
      lobby.players = [];
      lobby.isActive = false;
      lobby.currentSpeakerIndex = 0;
      lobby.speakingTimeLeft = 45;
      lobby.roundNumber = 1;
      lobby.createdAt = new Date().toISOString();
      globalTranscripts.delete(lobbyId);
    }

    // Check if user already in lobby
    if (!lobby.players.some(p => p.id === userId)) {
      const newPlayer = {
        id: userId,
        name: userName,
        joinedAt: new Date().toISOString(),
        isHost: lobby.players.length === 0
      };
      lobby.players.push(newPlayer);
    }

    return res.status(200).json(lobby);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function getRequiredPlayers(debateType) {
  switch (debateType) {
    case 'world-schools': return 6;
    case 'british-parliamentary': return 8;
    case 'quickfire-clash': return 2;
    default: return 2;
  }
}

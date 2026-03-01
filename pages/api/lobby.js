// Global lobby state (in production, this would be in a database)
const globalLobbies = new Map();
const globalTranscripts = new Map(); // Store live transcripts
const debateTranscripts = new Map(); // Store individual speech transcripts for judging

function getRequiredPlayers(debateType) {
  switch (debateType) {
    case 'quickfire-clash':
      return 2;
    case 'world-schools':
      return 6;
    case 'british-parliamentary':
      return 8;
    default:
      return 2;
  }
}

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
        speakingTimeLeft: debateType === 'quickfire-clash' ? 45 : 480,
        roundNumber: 1,
        debateFinished: false,
        allTranscripts: []
      };
      globalLobbies.set(lobbyId, lobby);
    }

    // Add transcript data if requested
    if (getTranscript) {
      const transcript = globalTranscripts.get(lobbyId) || '';
      const allTranscripts = debateTranscripts.get(lobbyId) || [];
      return res.status(200).json({
        currentSpeakerIndex: lobby.currentSpeakerIndex,
        speakingTimeLeft: lobby.speakingTimeLeft,
        roundNumber: lobby.roundNumber,
        debateFinished: lobby.debateFinished,
        players: lobby.players,
        transcript,
        allTranscripts
      });
    }

    return res.status(200).json({
      currentSpeakerIndex: lobby.currentSpeakerIndex,
      speakingTimeLeft: lobby.speakingTimeLeft,
      roundNumber: lobby.roundNumber,
      debateFinished: lobby.debateFinished,
      players: lobby.players,
      allTranscripts: lobby.allTranscripts || []
    });
  }

  if (req.method === 'POST') {
    const { debateType, userId, userName, action, transcript, timeLeft, speechRole } = req.body;
    
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
        speakingTimeLeft: debateType === 'quickfire-clash' ? 45 : 480,
        roundNumber: 1,
        debateFinished: false,
        allTranscripts: []
      };
      globalLobbies.set(lobbyId, lobby);
    }

    // Handle different actions
    if (action === 'join') {
      // Check if player already exists
      const existingPlayer = lobby.players.find(p => p.id === userId);
      if (!existingPlayer) {
        lobby.players.push({
          id: userId,
          name: userName,
          joinedAt: new Date().toISOString()
        });
      }
      
      // Activate lobby when enough players join
      if (lobby.players.length >= lobby.requiredPlayers) {
        lobby.isActive = true;
      }
      
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({
        currentSpeakerIndex: lobby.currentSpeakerIndex,
        speakingTimeLeft: lobby.speakingTimeLeft,
        roundNumber: lobby.roundNumber,
        debateFinished: lobby.debateFinished,
        players: lobby.players,
        allTranscripts: lobby.allTranscripts || []
      });
    }

    if (action === 'update-transcript') {
      globalTranscripts.set(lobbyId, transcript || '');
      return res.status(200).json({ success: true });
    }

    if (action === 'submit-speech') {
      // Store individual speech for judging
      const allTranscripts = debateTranscripts.get(lobbyId) || [];
      allTranscripts.push({
        userId,
        userName: userName || speechRole || 'Speaker',
        role: speechRole || 'Speaker',
        transcript: transcript || '',
        timestamp: new Date().toISOString()
      });
      debateTranscripts.set(lobbyId, allTranscripts);
      
      // Update allTranscripts array for quickfire clash
      if (debateType === 'quickfire-clash') {
        lobby.allTranscripts = allTranscripts.map(t => t.transcript);
      }
      
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({
        currentSpeakerIndex: lobby.currentSpeakerIndex,
        speakingTimeLeft: lobby.speakingTimeLeft,
        roundNumber: lobby.roundNumber,
        debateFinished: lobby.debateFinished,
        players: lobby.players,
        allTranscripts: lobby.allTranscripts || []
      });
    }

    if (action === 'start-speaking') {
      lobby.isActive = true;
      lobby.speakingTimeLeft = debateType === 'quickfire-clash' ? 45 : 480;
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({
        currentSpeakerIndex: lobby.currentSpeakerIndex,
        speakingTimeLeft: lobby.speakingTimeLeft,
        roundNumber: lobby.roundNumber,
        debateFinished: lobby.debateFinished,
        players: lobby.players,
        allTranscripts: lobby.allTranscripts || []
      });
    }

    if (action === 'next-speaker') {
      lobby.currentSpeakerIndex = (lobby.currentSpeakerIndex + 1) % lobby.players.length;
      lobby.speakingTimeLeft = debateType === 'quickfire-clash' ? 45 : 480;
      
      // For formal debates, check if all speakers have finished
      if (debateType !== 'quickfire-clash') {
        const totalSpeakers = debateType === 'world-schools' ? 6 : 8;
        if (lobby.currentSpeakerIndex === 0) {
          lobby.roundNumber++;
          if (lobby.roundNumber > 1) {
            lobby.debateFinished = true;
          }
        }
      } else {
        // Quickfire clash has 5 rounds
        if (lobby.currentSpeakerIndex === 0) {
          lobby.roundNumber++;
          if (lobby.roundNumber > 5) {
            lobby.debateFinished = true;
          }
        }
      }
      
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({
        currentSpeakerIndex: lobby.currentSpeakerIndex,
        speakingTimeLeft: lobby.speakingTimeLeft,
        roundNumber: lobby.roundNumber,
        debateFinished: lobby.debateFinished,
        players: lobby.players,
        allTranscripts: lobby.allTranscripts || []
      });
    }

    if (action === 'finish-debate') {
      lobby.debateFinished = true;
      globalLobbies.set(lobbyId, lobby);
      return res.status(200).json({
        currentSpeakerIndex: lobby.currentSpeakerIndex,
        speakingTimeLeft: lobby.speakingTimeLeft,
        roundNumber: lobby.roundNumber,
        debateFinished: lobby.debateFinished,
        players: lobby.players,
        allTranscripts: lobby.allTranscripts || []
      });
    }

    // Reset lobby if full or active
    if (lobby.players.length >= lobby.requiredPlayers || lobby.isActive) {
      lobby.players = [];
      lobby.isActive = false;
      lobby.currentSpeakerIndex = 0;
      lobby.speakingTimeLeft = debateType === 'quickfire-clash' ? 45 : 480;
      lobby.roundNumber = 1;
      lobby.debateFinished = false;
      lobby.allTranscripts = [];
      globalLobbies.set(lobbyId, lobby);
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

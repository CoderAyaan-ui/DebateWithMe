// Global lobby state (in production, this would be in a database)
const globalLobbies = new Map();

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { debateType } = req.query;
    
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
        isActive: false
      };
      globalLobbies.set(lobbyId, lobby);
    }

    return res.status(200).json(lobby);
  }

  if (req.method === 'POST') {
    const { debateType, userId, userName } = req.body;
    
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
        isActive: false
      };
      globalLobbies.set(lobbyId, lobby);
    }

    // Reset lobby if full or active
    if (lobby.players.length >= lobby.requiredPlayers || lobby.isActive) {
      lobby.players = [];
      lobby.isActive = false;
      lobby.createdAt = new Date().toISOString();
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

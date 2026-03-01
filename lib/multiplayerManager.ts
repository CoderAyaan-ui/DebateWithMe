interface Player {
  id: string;
  name: string;
  joinedAt: string; // Store as string for localStorage compatibility
  isHost: boolean;
}

interface Lobby {
  id: string;
  debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash';
  players: Player[];
  requiredPlayers: number;
  createdAt: string; // Store as string for localStorage compatibility
  motion?: string;
  isActive: boolean;
}

class MultiplayerManager {
  private static instance: MultiplayerManager;
  private lobbies: Map<string, Lobby> = new Map();
  private currentUserId: string | null = null;
  private currentLobbyId: string | null = null;

  static getInstance(): MultiplayerManager {
    if (!MultiplayerManager.instance) {
      MultiplayerManager.instance = new MultiplayerManager();
    }
    return MultiplayerManager.instance;
  }

  constructor() {
    this.loadFromStorage();
    // Clean up old lobbies (older than 30 minutes)
    this.cleanupOldLobbies();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('multiplayerLobbies');
      if (stored) {
        const lobbiesData = JSON.parse(stored);
        this.lobbies = new Map(Object.entries(lobbiesData));
      }
    } catch (error) {
      console.error('Error loading lobbies:', error);
    }
  }

  private saveToStorage() {
    try {
      const lobbiesData = Object.fromEntries(this.lobbies);
      localStorage.setItem('multiplayerLobbies', JSON.stringify(lobbiesData));
    } catch (error) {
      console.error('Error saving lobbies:', error);
    }
  }

  private cleanupOldLobbies() {
    const now = new Date();
    for (const [id, lobby] of this.lobbies) {
      const createdDate = new Date(lobby.createdAt);
      if (now.getTime() - createdDate.getTime() > 30 * 60 * 1000) {
        this.lobbies.delete(id);
      }
    }
    this.saveToStorage();
  }

  private generateLobbyId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getRequiredPlayers(debateType: string): number {
    switch (debateType) {
      case 'world-schools': return 6;
      case 'british-parliamentary': return 8;
      case 'quickfire-clash': return 2;
      default: return 2;
    }
  }

  createOrJoinLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash', userId: string, userName: string): Lobby {
    // Try to find an existing lobby with space
    for (const [lobbyId, lobby] of this.lobbies) {
      if (lobby.debateType === debateType && 
          lobby.players.length < lobby.requiredPlayers && 
          !lobby.isActive &&
          !lobby.players.some(p => p.id === userId)) {
        
        // Join existing lobby
        const newPlayer: Player = {
          id: userId,
          name: userName,
          joinedAt: new Date().toISOString(),
          isHost: false
        };
        
        lobby.players.push(newPlayer);
        this.currentLobbyId = lobbyId;
        this.saveToStorage();
        
        return lobby;
      }
    }

    // Create new lobby
    const lobbyId = this.generateLobbyId();
    const hostPlayer: Player = {
      id: userId,
      name: userName,
      joinedAt: new Date().toISOString(),
      isHost: true
    };

    const newLobby: Lobby = {
      id: lobbyId,
      debateType,
      players: [hostPlayer],
      requiredPlayers: this.getRequiredPlayers(debateType),
      createdAt: new Date().toISOString(),
      isActive: false
    };

    this.lobbies.set(lobbyId, newLobby);
    this.currentLobbyId = lobbyId;
    this.saveToStorage();

    return newLobby;
  }

  getCurrentLobby(): Lobby | null {
    if (!this.currentLobbyId) return null;
    return this.lobbies.get(this.currentLobbyId) || null;
  }

  updateLobby(lobby: Lobby) {
    this.lobbies.set(lobby.id, lobby);
    this.saveToStorage();
  }

  leaveLobby(userId: string) {
    if (!this.currentLobbyId) return;

    const lobby = this.lobbies.get(this.currentLobbyId);
    if (lobby) {
      lobby.players = lobby.players.filter(p => p.id !== userId);
      
      // If lobby is empty or host left, remove it
      if (lobby.players.length === 0 || !lobby.players.some(p => p.isHost)) {
        this.lobbies.delete(this.currentLobbyId);
      }
      
      this.saveToStorage();
    }
    
    this.currentLobbyId = null;
  }

  isLobbyFull(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    return lobby ? lobby.players.length >= lobby.requiredPlayers : false;
  }

  startDebate(lobbyId: string, motion: string) {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      lobby.isActive = true;
      lobby.motion = motion;
      this.saveToStorage();
    }
  }

  // Poll for updates (simulated real-time)
  pollForUpdates(callback: (lobbies: Map<string, Lobby>) => void) {
    const checkUpdates = () => {
      this.loadFromStorage();
      callback(this.lobbies);
    };

    // Check immediately
    checkUpdates();
    
    // Set up polling
    const interval = setInterval(checkUpdates, 1000);
    
    return () => clearInterval(interval);
  }
}

export default MultiplayerManager;
export type { Player, Lobby };

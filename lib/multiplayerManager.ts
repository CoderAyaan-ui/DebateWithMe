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
      // Don't clean up global lobbies, only old random lobbies
      if (!id.includes('-global')) {
        const createdDate = new Date(lobby.createdAt);
        if (now.getTime() - createdDate.getTime() > 30 * 60 * 1000) {
          this.lobbies.delete(id);
        }
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
    // Find or create the global lobby for this debate type
    let lobby = this.findGlobalLobby(debateType);
    
    // Check if user is already in this lobby
    if (lobby.players.some(p => p.id === userId)) {
      this.currentLobbyId = lobby.id;
      return lobby;
    }

    // If lobby is full or active, reset it for new game
    if (lobby.players.length >= lobby.requiredPlayers || lobby.isActive) {
      lobby = this.resetGlobalLobby(debateType);
    }

    // Add player to the global lobby
    const newPlayer: Player = {
      id: userId,
      name: userName,
      joinedAt: new Date().toISOString(),
      isHost: lobby.players.length === 0 // First player is host
    };
    
    lobby.players.push(newPlayer);
    this.currentLobbyId = lobby.id;
    this.saveToStorage();
    
    return lobby;
  }

  private findGlobalLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash'): Lobby {
    // Try to find existing global lobby for this debate type
    for (const [lobbyId, lobby] of this.lobbies) {
      if (lobby.debateType === debateType) {
        return lobby;
      }
    }

    // Create new global lobby if none exists
    return this.createGlobalLobby(debateType);
  }

  private createGlobalLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash'): Lobby {
    const lobbyId = `${debateType}-global`;
    
    const newLobby: Lobby = {
      id: lobbyId,
      debateType,
      players: [],
      requiredPlayers: this.getRequiredPlayers(debateType),
      createdAt: new Date().toISOString(),
      isActive: false
    };

    this.lobbies.set(lobbyId, newLobby);
    return newLobby;
  }

  private resetGlobalLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash'): Lobby {
    const lobbyId = `${debateType}-global`;
    
    const resetLobby: Lobby = {
      id: lobbyId,
      debateType,
      players: [],
      requiredPlayers: this.getRequiredPlayers(debateType),
      createdAt: new Date().toISOString(),
      isActive: false
    };

    this.lobbies.set(lobbyId, resetLobby);
    return resetLobby;
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

import { Lobby, Player } from './multiplayerManager';

export class GlobalMultiplayerManager {
  private currentLobby: Lobby | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private onUpdate: ((lobby: Lobby) => void) | null = null;

  constructor() {
    this.loadFromStorage();
  }

  async createOrJoinLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash', userId: string, userName: string): Promise<Lobby> {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debateType,
          userId,
          userName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join lobby');
      }

      const lobby = await response.json();
      this.currentLobby = lobby;
      this.saveToStorage();
      
      return lobby;
    } catch (error) {
      console.error('Error joining lobby:', error);
      throw error;
    }
  }

  async getLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash'): Promise<Lobby | null> {
    try {
      const response = await fetch(`/api/lobby?debateType=${debateType}`);
      
      if (!response.ok) {
        return null;
      }

      const lobby = await response.json();
      return lobby;
    } catch (error) {
      console.error('Error getting lobby:', error);
      return null;
    }
  }

  startPolling(debateType: string, callback: (lobby: Lobby) => void) {
    this.onUpdate = callback;
    
    // Clear existing polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll every 2 seconds
    this.pollingInterval = setInterval(async () => {
      const lobby = await this.getLobby(debateType as any);
      if (lobby && this.onUpdate) {
        this.onUpdate(lobby);
      }
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.onUpdate = null;
  }

  getCurrentLobby(): Lobby | null {
    return this.currentLobby;
  }

  private saveToStorage() {
    try {
      if (this.currentLobby) {
        localStorage.setItem('currentLobby', JSON.stringify(this.currentLobby));
      }
    } catch (error) {
      console.error('Error saving lobby:', error);
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('currentLobby');
      if (saved) {
        this.currentLobby = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading lobby:', error);
    }
  }
}

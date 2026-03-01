import { Lobby, Player } from './multiplayerManager';

export class GlobalMultiplayerManager {
  private currentLobby: Lobby | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private transcriptInterval: NodeJS.Timeout | null = null;
  private onUpdate: ((lobby: Lobby) => void) | null = null;
  private onTranscriptUpdate: ((transcript: string) => void) | null = null;
  private currentUserId: string = '';

  constructor() {
    this.loadFromStorage();
  }

  async createOrJoinLobby(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash', userId: string, userName: string): Promise<Lobby> {
    this.currentUserId = userId;
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

  async getTranscript(debateType: 'world-schools' | 'british-parliamentary' | 'quickfire-clash'): Promise<string> {
    try {
      const response = await fetch(`/api/lobby?debateType=${debateType}&getTranscript=true`);
      
      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      return data.transcript || '';
    } catch (error) {
      console.error('Error getting transcript:', error);
      return '';
    }
  }

  async updateTranscript(debateType: string, transcript: string): Promise<boolean> {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debateType,
          userId: this.currentUserId,
          userName: 'Player',
          action: 'update-transcript',
          transcript
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating transcript:', error);
      return false;
    }
  }

  async updateTimer(debateType: string, timeLeft: number): Promise<boolean> {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debateType,
          userId: this.currentUserId,
          userName: 'Player',
          action: 'update-timer',
          timeLeft
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating timer:', error);
      return false;
    }
  }

  async nextSpeaker(debateType: string): Promise<Lobby | null> {
    try {
      const response = await fetch('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debateType,
          userId: this.currentUserId,
          userName: 'Player',
          action: 'next-speaker'
        })
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error moving to next speaker:', error);
      return null;
    }
  }

  startPolling(debateType: string, callback: (lobby: Lobby) => void) {
    this.onUpdate = callback;
    
    // Clear existing polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll every 2 seconds for lobby updates
    this.pollingInterval = setInterval(async () => {
      const lobby = await this.getLobby(debateType as any);
      if (lobby && this.onUpdate) {
        this.onUpdate(lobby);
      }
    }, 2000);
  }

  startTranscriptPolling(debateType: string, callback: (transcript: string) => void) {
    this.onTranscriptUpdate = callback;
    
    // Clear existing transcript polling
    if (this.transcriptInterval) {
      clearInterval(this.transcriptInterval);
    }

    // Poll every 1 second for transcript updates
    this.transcriptInterval = setInterval(async () => {
      const transcript = await this.getTranscript(debateType as any);
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(transcript);
      }
    }, 1000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.transcriptInterval) {
      clearInterval(this.transcriptInterval);
      this.transcriptInterval = null;
    }
    this.onUpdate = null;
    this.onTranscriptUpdate = null;
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

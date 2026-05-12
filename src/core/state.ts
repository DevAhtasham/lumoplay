import type { PlayerState } from '../types/player';

export class StateManager {
  private state: PlayerState;
  private listeners: Set<(state: PlayerState) => void> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): PlayerState {
    return {
      isPlaying: false,
      isMuted: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackSpeed: 1,
      isFullscreen: false,
      isPiP: false,
      isTheatrical: false,
      buffered: {} as TimeRanges,
    };
  }

  getState(): PlayerState {
    return { ...this.state };
  }

  setState(partialState: Partial<PlayerState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partialState };
    this.notifyListeners(oldState, this.state);
  }

  subscribe(listener: (state: PlayerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(_oldState: PlayerState, newState: PlayerState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(newState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  reset(): void {
    this.state = this.getInitialState();
  }
}

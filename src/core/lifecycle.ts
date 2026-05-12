import { EventEmitter } from '../events/emitter';

export class LifecycleManager {
  private emitter: EventEmitter;
  private isDestroyed: boolean = false;
  private cleanupCallbacks: Array<() => void> = [];

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  onInit(callback: () => void): void {
    if (this.isDestroyed) {
      console.warn('Cannot register init callback - player is destroyed');
      return;
    }
    callback();
  }

  onDestroy(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.emitter.removeAllListeners();

    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    this.cleanupCallbacks = [];
  }

  get isDestroyedState(): boolean {
    return this.isDestroyed;
  }
}

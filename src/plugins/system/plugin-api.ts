import type { PluginAPI } from '../../types/plugins';
import type { PlayerState } from '../../types/player';

export class SafePluginAPI implements PluginAPI {
  private player: any;

  constructor(player: any) {
    this.player = player;
  }

  play(): Promise<void> {
    return this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  seek(time: number): void {
    this.player.seek(time);
  }

  setVolume(volume: number): void {
    this.player.setVolume(volume);
  }

  setSpeed(speed: number): void {
    this.player.setSpeed(speed);
  }

  on(event: string, callback: Function): void {
    this.player.on(event, callback);
  }

  off(event: string, callback?: Function): void {
    this.player.off(event, callback);
  }

  getState(): PlayerState {
    return this.player.getState();
  }
}

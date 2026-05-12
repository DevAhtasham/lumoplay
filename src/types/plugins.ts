export interface Plugin {
  name: string;
  version: string;
  init(player: any): void | Promise<void>;
  destroy(): void | Promise<void>;
  onPlay?(): void;
  onPause?(): void;
  onSeek?(time: number): void;
  onTimeUpdate?(time: number): void;
  onVolumeChange?(volume: number): void;
  onMute?(): void;
  onUnmute?(): void;
  onFullscreen?(): void;
  onExitFullscreen?(): void;
  onPiP?(): void;
  onExitPiP?(): void;
}

export interface PluginManager {
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  get(pluginName: string): Plugin | undefined;
  has(pluginName: string): boolean;
  destroyAll(): void;
}

export interface PluginAPI {
  play(): Promise<void>;
  pause(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setSpeed(speed: number): void;
  on(event: string, callback: Function): void;
  off(event: string, callback?: Function): void;
  getState(): any;
}

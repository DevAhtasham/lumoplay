import type { EventCallback } from './events';

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  isPiP: boolean;
  isTheatrical: boolean;
  buffered: TimeRanges;
}

export interface PlayerOptions {
  src?: string;
  poster?: string;
  sources?: VideoSource[];
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  hideControls?: boolean;
  controlBar?: ControlBarOptions;
  theme?: 'light' | 'dark' | 'auto';
  customTheme?: ThemeConfig;
  autoHideDelay?: number;
  seekStep?: number;
  volumeStep?: number;
  persistVolume?: boolean;
  persistPosition?: boolean;
  plugins?: PluginConfig[];
}

export interface VideoSource {
  src: string;
  type?: string;
  label?: string;
}

export interface ControlBarOptions {
  layout?: ControlButton[];
  position?: 'top' | 'bottom';
}

export type ControlButton =
  | 'play'
  | 'volume'
  | 'progress'
  | 'time'
  | 'speed'
  | 'fullscreen'
  | 'pip';

export interface ThemeConfig {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
}

export interface PluginConfig {
  name: string;
  options?: Record<string, any>;
}

export interface PlayerAPI {
  play(): Promise<void>;
  pause(): void;
  togglePlay(): void;
  seek(time: number): void;
  restart(): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unmute(): void;
  toggleMute(): void;
  isMuted(): boolean;
  setSpeed(speed: number): void;
  getSpeed(): number;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  toggleFullscreen(): Promise<void>;
  enterPiP(): Promise<void>;
  exitPiP(): Promise<void>;
  enterTheatricalMode(): void;
  exitTheatricalMode(): void;
  isPlaying(): boolean;
  getCurrentTime(): number;
  getDuration(): number;
  getBuffered(): TimeRanges;
  getState(): PlayerState;
  use(plugin: any, options?: any): void;
  unuse(pluginName: string): void;
  hasPlugin(pluginName: string): boolean;
  on(event: string, callback: EventCallback): void;
  off(event: string, callback?: EventCallback): void;
  once(event: string, callback: EventCallback): void;
  emit(event: string, data?: any): void;
  destroy(): void;
}

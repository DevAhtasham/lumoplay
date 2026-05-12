import type { PlayerOptions, PlayerState, PlayerAPI } from '../types/player';
import type { Plugin } from '../types/plugins';
import type { EventCallback } from '../types/events';
import { EventEmitter } from '../events/emitter';
import { EventHooks } from '../events/hooks';
import { VideoWrapper } from './video-wrapper';
import { StateManager } from './state';
import { LifecycleManager } from './lifecycle';
import { isFullscreen, requestFullscreen, exitFullscreen, isPiP } from '../utils/dom';
import { saveVolume, getVolume, savePlaybackPosition, getPlaybackPosition } from '../utils/storage';
import { DEFAULT_CONFIG } from '../types/config';

export class LumoPlayer implements PlayerAPI {
  private container: HTMLElement;
  private videoElement!: HTMLVideoElement;
  private videoWrapper!: VideoWrapper;
  private emitter!: EventEmitter;
  private eventHooks!: EventHooks;
  private stateManager!: StateManager;
  private lifecycleManager!: LifecycleManager;
  private options: PlayerOptions;
  private plugins: Map<string, Plugin> = new Map();
  private videoId: string;

  constructor(selector: string | HTMLElement, options: PlayerOptions = {}) {
    this.options = this.mergeOptions(options);
    this.container = typeof selector === 'string'
      ? document.querySelector(selector) as HTMLElement
      : selector;

    if (!this.container) {
      throw new Error(`Player container not found: ${selector}`);
    }

    this.videoId = this.generateVideoId(this.options.src);
    this.initializePlayer();
  }

  private mergeOptions(options: PlayerOptions): PlayerOptions {
    return {
      autoplay: false,
      muted: false,
      controls: true,
      hideControls: false,
      autoHideDelay: DEFAULT_CONFIG.autoHideDelay,
      seekStep: DEFAULT_CONFIG.seekStep,
      volumeStep: DEFAULT_CONFIG.volumeStep,
      persistVolume: DEFAULT_CONFIG.persistVolume,
      persistPosition: DEFAULT_CONFIG.persistPosition,
      theme: DEFAULT_CONFIG.theme,
      ...options,
    };
  }

  private generateVideoId(src?: string): string {
    if (!src) return 'default';
    return btoa(src).replace(/=/g, '');
  }

  private initializePlayer(): void {
    this.emitter = new EventEmitter();
    this.eventHooks = new EventHooks();
    this.stateManager = new StateManager();
    this.lifecycleManager = new LifecycleManager(this.emitter);

    this.createVideoElement();
    this.videoWrapper = new VideoWrapper(this.videoElement, this.emitter);
    this.setupEventListeners();
    this.applyInitialSettings();
    this.loadPersistedData();
  }

  private createVideoElement(): void {
    this.videoElement = document.createElement('video');
    this.videoElement.classList.add('lumoplay-video');
    
    if (this.options.src) {
      this.videoWrapper.setSource(this.options.src);
    }
    
    if (this.options.poster) {
      this.videoWrapper.setPoster(this.options.poster);
    }

    this.container.appendChild(this.videoElement);
  }

  private setupEventListeners(): void {
    this.emitter.on('play', () => {
      this.stateManager.setState({ isPlaying: true });
      this.eventHooks.execute('play');
    });

    this.emitter.on('pause', () => {
      this.stateManager.setState({ isPlaying: false });
      this.savePlaybackPosition();
      this.eventHooks.execute('pause');
    });

    this.emitter.on('seek', ({ time }) => {
      this.eventHooks.execute('seek', time);
    });

    this.emitter.on('timeupdate', ({ time }) => {
      this.stateManager.setState({ currentTime: time });
      this.eventHooks.execute('timeupdate', time);
    });

    this.emitter.on('volumechange', ({ volume }) => {
      this.stateManager.setState({ volume });
      if (this.options.persistVolume) {
        saveVolume(volume);
      }
      this.eventHooks.execute('volumechange', volume);
    });

    this.emitter.on('ended', () => {
      this.stateManager.setState({ isPlaying: false });
      this.savePlaybackPosition();
    });
  }

  private applyInitialSettings(): void {
    if (this.options.muted) {
      this.mute();
    }

    if (this.options.autoplay) {
      this.play().catch(console.error);
    }
  }

  private loadPersistedData(): void {
    if (this.options.persistVolume) {
      const savedVolume = getVolume();
      if (savedVolume !== null) {
        this.setVolume(savedVolume);
      }
    }

    if (this.options.persistPosition) {
      const savedPosition = getPlaybackPosition(this.videoId);
      if (savedPosition && savedPosition > 0) {
        this.seek(savedPosition);
      }
    }
  }

  private savePlaybackPosition(): void {
    if (this.options.persistPosition) {
      savePlaybackPosition(this.videoId, this.getCurrentTime());
    }
  }

  // Public API
  async play(): Promise<void> {
    await this.videoWrapper.play();
  }

  pause(): void {
    this.videoWrapper.pause();
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(time: number): void {
    this.videoWrapper.seek(time);
    this.emitter.emit('seek', { time });
  }

  restart(): void {
    this.seek(0);
    this.play();
  }

  setVolume(volume: number): void {
    this.videoWrapper.setVolume(volume);
    if (volume === 0) {
      this.stateManager.setState({ isMuted: true });
    } else {
      this.stateManager.setState({ isMuted: false });
    }
  }

  getVolume(): number {
    return this.videoWrapper.getVolume();
  }

  mute(): void {
    this.videoWrapper.mute();
    this.stateManager.setState({ isMuted: true });
    this.emitter.emit('mute');
    this.eventHooks.execute('mute');
  }

  unmute(): void {
    this.videoWrapper.unmute();
    this.stateManager.setState({ isMuted: false });
    this.emitter.emit('unmute');
    this.eventHooks.execute('unmute');
  }

  toggleMute(): void {
    if (this.isMuted()) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  isMuted(): boolean {
    return this.videoWrapper.isMuted();
  }

  setSpeed(speed: number): void {
    this.videoWrapper.setSpeed(speed);
    this.stateManager.setState({ playbackSpeed: speed });
  }

  getSpeed(): number {
    return this.videoWrapper.getSpeed();
  }

  async enterFullscreen(): Promise<void> {
    await requestFullscreen(this.container);
    this.stateManager.setState({ isFullscreen: true });
    this.emitter.emit('fullscreen');
    this.eventHooks.execute('fullscreen');
  }

  async exitFullscreen(): Promise<void> {
    await exitFullscreen();
    this.stateManager.setState({ isFullscreen: false });
    this.emitter.emit('exitfullscreen');
    this.eventHooks.execute('exitfullscreen');
  }

  async toggleFullscreen(): Promise<void> {
    if (isFullscreen()) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  async enterPiP(): Promise<void> {
    if (!isPiP()) {
      await this.videoElement.requestPictureInPicture();
      this.stateManager.setState({ isPiP: true });
      this.emitter.emit('pip');
      this.eventHooks.execute('pip');
    }
  }

  async exitPiP(): Promise<void> {
    if (isPiP()) {
      await document.exitPictureInPicture();
      this.stateManager.setState({ isPiP: false });
      this.emitter.emit('exitpip');
      this.eventHooks.execute('exitpip');
    }
  }

  enterTheatricalMode(): void {
    this.container.classList.add('lumoplay-theatrical');
    this.stateManager.setState({ isTheatrical: true });
    this.emitter.emit('theatrical');
  }

  exitTheatricalMode(): void {
    this.container.classList.remove('lumoplay-theatrical');
    this.stateManager.setState({ isTheatrical: false });
    this.emitter.emit('exittheatrical');
  }

  isPlaying(): boolean {
    return this.stateManager.getState().isPlaying;
  }

  getCurrentTime(): number {
    return this.videoWrapper.getCurrentTime();
  }

  getDuration(): number {
    return this.videoWrapper.getDuration();
  }

  getBuffered(): TimeRanges {
    return this.videoWrapper.getBuffered();
  }

  getState(): PlayerState {
    return this.stateManager.getState();
  }

  // Plugin System
  use(plugin: any, options?: any): void {
    const pluginInstance = new plugin(options);
    
    if (this.plugins.has(pluginInstance.name)) {
      console.warn(`Plugin "${pluginInstance.name}" is already registered`);
      return;
    }

    const pluginAPI = this.createPluginAPI();
    
    this.lifecycleManager.onInit(async () => {
      await pluginInstance.init(pluginAPI);
      this.eventHooks.registerPluginHooks(pluginInstance);
    });

    this.plugins.set(pluginInstance.name, pluginInstance);
    this.emitter.emit('plugin:init', { pluginName: pluginInstance.name });
  }

  unuse(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      console.warn(`Plugin "${pluginName}" not found`);
      return;
    }

    this.eventHooks.unregisterPluginHooks(plugin);
    plugin.destroy();
    this.plugins.delete(pluginName);
    this.emitter.emit('plugin:destroy', { pluginName });
  }

  hasPlugin(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  private createPluginAPI(): any {
    return {
      play: () => this.play(),
      pause: () => this.pause(),
      seek: (time: number) => this.seek(time),
      setVolume: (volume: number) => this.setVolume(volume),
      setSpeed: (speed: number) => this.setSpeed(speed),
      on: (event: string, callback: Function) => this.on(event, callback),
      off: (event: string, callback?: Function) => this.off(event, callback),
      getState: () => this.getState(),
    };
  }

  // Event System
  on(event: string, callback: Function): void {
    this.emitter.on(event, callback);
  }

  off(event: string, callback?: Function): void {
    this.emitter.off(event, callback);
  }

  once(event: string, callback: Function): void {
    this.emitter.once(event, callback);
  }

  emit(event: string, data?: any): void {
    this.emitter.emit(event, data);
  }

  // Lifecycle
  destroy(): void {
    this.savePlaybackPosition();
    this.plugins.forEach((plugin, name) => {
      plugin.destroy();
      this.emitter.emit('plugin:destroy', { pluginName: name });
    });
    this.plugins.clear();
    this.videoWrapper.destroy();
    this.lifecycleManager.destroy();
    this.container.innerHTML = '';
  }
}

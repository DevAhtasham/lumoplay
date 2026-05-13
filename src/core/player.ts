import type { PlayerOptions, PlayerState, PlayerAPI } from '../types/player';
import type { Plugin } from '../types/plugins';
import { EventEmitter } from '../events/emitter';
import { EventHooks } from '../events/hooks';
import { VideoWrapper } from './video-wrapper';
import { StateManager } from './state';
import { LifecycleManager } from './lifecycle';
import { Renderer } from '../ui/renderer';
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
  private renderer!: Renderer;
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
    this.setPoster();
    this.renderer = new Renderer(this.container, this, { autoHideDelay: this.options.autoHideDelay });
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.setupTouchGestures();
    this.applyInitialSettings();
    this.loadPersistedData();
  }

  private createVideoElement(): void {
    this.container.classList.add('lumoplay');
    
    this.videoElement = document.createElement('video');
    this.videoElement.classList.add('lumoplay-video');
    
    if (this.options.src) {
      this.videoElement.src = this.options.src;
    }

    this.container.appendChild(this.videoElement);
  }

  private setPoster(): void {
    if (this.options.poster) {
      this.videoWrapper.setPoster(this.options.poster);
    }
  }

  private setupEventListeners(): void {
    this.emitter.on('play', () => {
      this.stateManager.setState({ isPlaying: true });
      this.renderer.updatePlayState(true);
      this.eventHooks.execute('play');
    });

    this.emitter.on('pause', () => {
      this.stateManager.setState({ isPlaying: false });
      this.renderer.updatePlayState(false);
      this.savePlaybackPosition();
      this.eventHooks.execute('pause');
    });

    this.emitter.on('seek', ({ time }) => {
      this.eventHooks.execute('seek', time);
    });

    this.emitter.on('timeupdate', ({ time }) => {
      this.stateManager.setState({ currentTime: time });
      const duration = this.videoWrapper.getDuration();
      const buffered = this.videoWrapper.getBuffered();
      this.renderer.updateProgress(time, duration, buffered);
      this.eventHooks.execute('timeupdate', time);
    });

    this.emitter.on('volumechange', ({ volume, muted }) => {
      this.stateManager.setState({ volume, isMuted: muted });
      this.renderer.updateVolume(volume, muted);
      if (this.options.persistVolume) {
        saveVolume(volume);
      }
      this.eventHooks.execute('volumechange', volume);
    });

    this.emitter.on('ended', () => {
      this.stateManager.setState({ isPlaying: false });
      this.savePlaybackPosition();
    });

    this.emitter.on('fullscreenchange', () => {
      const isFullscreenActive = isFullscreen();
      this.stateManager.setState({ isFullscreen: isFullscreenActive });
      this.renderer.updateFullscreen();
      this.eventHooks.execute('fullscreenchange', isFullscreenActive);
    });
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when player is focused or container is active
      if (!this.container.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.rewind(10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.forward(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.setVolume(Math.min(1, this.getVolume() + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.setVolume(Math.max(0, this.getVolume() - 0.1));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;
      }
    });
  }

  private setupTouchGestures(): void {
    let lastTapTime = 0;
    let tapTimeout: ReturnType<typeof setTimeout> | null = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    this.videoElement.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();

      // Double tap detection
      const currentTime = Date.now();
      if (currentTime - lastTapTime < 300) {
        // Double tap detected
        if (tapTimeout) clearTimeout(tapTimeout);
        const tapX = touch.clientX;
        const playerRect = this.container.getBoundingClientRect();
        const playerCenter = playerRect.left + playerRect.width / 2;

        if (tapX < playerCenter) {
          this.rewind(10);
        } else {
          this.forward(10);
        }
        lastTapTime = 0;
      } else {
        lastTapTime = currentTime;
        tapTimeout = setTimeout(() => {
          lastTapTime = 0;
        }, 300);
      }
    });

    this.videoElement.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      // Swipe detection
      if (deltaTime < 500 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
        if (deltaX > 0) {
          this.forward(10);
        } else {
          this.rewind(10);
        }
      }
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

  rewind(seconds: number): void {
    const currentTime = this.videoWrapper.getCurrentTime();
    this.seek(Math.max(0, currentTime - seconds));
  }

  forward(seconds: number): void {
    const currentTime = this.videoWrapper.getCurrentTime();
    const duration = this.videoWrapper.getDuration();
    this.seek(Math.min(duration, currentTime + seconds));
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

  getAudioTracks(): any[] {
    return this.videoWrapper.getAudioTracks();
  }

  setAudioTrack(trackId: string): void {
    this.videoWrapper.setAudioTrack(trackId);
    this.emitter.emit('audiotrackchange', { trackId });
  }

  enterMiniPlayer(): void {
    this.container.classList.add('lumoplay-mini');
    this.stateManager.setState({ isMiniPlayer: true });
    this.emitter.emit('enterminimode');
  }

  exitMiniPlayer(): void {
    this.container.classList.remove('lumoplay-mini');
    this.stateManager.setState({ isMiniPlayer: false });
    this.emitter.emit('exitminimode');
  }

  toggleMiniPlayer(): void {
    if (this.container.classList.contains('lumoplay-mini')) {
      this.exitMiniPlayer();
    } else {
      this.enterMiniPlayer();
    }
  }

  enterTheaterMode(): void {
    this.container.classList.add('lumoplay-theatrical');
    this.stateManager.setState({ isTheatrical: true });
    this.emitter.emit('entertheater');
  }

  exitTheaterMode(): void {
    this.container.classList.remove('lumoplay-theatrical');
    this.stateManager.setState({ isTheatrical: false });
    this.emitter.emit('exittheater');
  }

  toggleTheaterMode(): void {
    if (this.container.classList.contains('lumoplay-theatrical')) {
      this.exitTheaterMode();
    } else {
      this.enterTheaterMode();
    }
  }

  async enterFullscreen(): Promise<void> {
    await requestFullscreen(this.container);
    this.stateManager.setState({ isFullscreen: true });
    this.renderer.updateFullscreen();
    this.emitter.emit('fullscreen');
    this.eventHooks.execute('fullscreen');
  }

  async exitFullscreen(): Promise<void> {
    await exitFullscreen();
    this.stateManager.setState({ isFullscreen: false });
    this.renderer.updateFullscreen();
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
      on: (event: string, callback: (data?: any) => void) => this.on(event, callback),
      off: (event: string, callback?: (data?: any) => void) => this.off(event, callback),
      getState: () => this.getState(),
    };
  }

  // Event System
  on(event: string, callback: (data?: any) => void): void {
    this.emitter.on(event, callback);
  }

  off(event: string, callback?: (data?: any) => void): void {
    this.emitter.off(event, callback);
  }

  once(event: string, callback: (data?: any) => void): void {
    this.emitter.once(event, callback);
  }

  emit(event: string, data?: any): void {
    this.emitter.emit(event, data);
  }

  // UI Access
  getProgressBar() {
    return this.renderer?.getProgressBar() || null;
  }

  // Lifecycle
  destroy(): void {
    this.savePlaybackPosition();
    this.videoWrapper.destroy();
    this.renderer.destroy();
    this.lifecycleManager.destroy();
    this.container.innerHTML = '';
  }
}

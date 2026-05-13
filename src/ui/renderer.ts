import { PlayButton } from './controls/play-button';
import { VolumeControl } from './controls/volume-control';
import { ProgressBar } from './controls/progress-bar';
import { FullscreenButton } from './controls/fullscreen-button';
import { TimeDisplay } from './controls/time-display';
import { ThemeManager } from './theme-manager';
import { createElement } from '../utils/dom';

export class SeekButtons {
  private container: HTMLElement;
  private rewindButton: HTMLButtonElement;
  private forwardButton: HTMLButtonElement;

  constructor(onRewind: () => void, onForward: () => void) {
    this.container = createElement('div', ['lumoplay-seek-buttons']);
    
    this.rewindButton = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-rewind']);
    this.rewindButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
      </svg>
    `;
    this.rewindButton.setAttribute('aria-label', 'Rewind 10 seconds');
    this.rewindButton.addEventListener('click', onRewind);
    
    this.forwardButton = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-forward']);
    this.forwardButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
      </svg>
    `;
    this.forwardButton.setAttribute('aria-label', 'Forward 10 seconds');
    this.forwardButton.addEventListener('click', onForward);
    
    this.container.appendChild(this.rewindButton);
    this.container.appendChild(this.forwardButton);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

export class SpeedControl {
  private container: HTMLElement;
  private button: HTMLButtonElement;
  private speeds: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
  private currentSpeedIndex: number = 2; // Default to 1x
  private onSpeedChange: (speed: number) => void;

  constructor(onSpeedChange: (speed: number) => void) {
    this.onSpeedChange = onSpeedChange;
    this.container = createElement('div', ['lumoplay-speed-control']);
    
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-speed']);
    this.button.innerHTML = '1x';
    this.button.setAttribute('aria-label', 'Playback speed');
    this.button.addEventListener('click', () => this.cycleSpeed());
    
    this.container.appendChild(this.button);
  }

  private cycleSpeed(): void {
    this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speeds.length;
    const speed = this.speeds[this.currentSpeedIndex];
    this.button.textContent = speed + 'x';
    this.onSpeedChange(speed);
  }

  setSpeed(speed: number): void {
    const index = this.speeds.indexOf(speed);
    if (index !== -1) {
      this.currentSpeedIndex = index;
      this.button.textContent = speed + 'x';
    }
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

export class AudioTrackControl {
  private container: HTMLElement;
  private button: HTMLButtonElement;
  private menu: HTMLElement;
  private onTrackChange: (trackId: string) => void;

  constructor(onTrackChange: (trackId: string) => void) {
    this.onTrackChange = onTrackChange;
    this.container = createElement('div', ['lumoplay-audio-control']);
    
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-audio-button']);
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    `;
    this.button.setAttribute('aria-label', 'Audio tracks');
    this.button.addEventListener('click', () => this.toggleMenu());
    
    this.menu = createElement('div', ['lumoplay-audio-menu', 'hidden']);
    
    this.container.appendChild(this.button);
    this.container.appendChild(this.menu);
  }

  private toggleMenu(): void {
    this.menu.classList.toggle('hidden');
  }

  setTracks(tracks: any[]): void {
    this.menu.innerHTML = '';
    if (tracks.length === 0) {
      const noTracks = createElement('div', ['lumoplay-audio-item']);
      noTracks.textContent = 'No audio tracks';
      this.menu.appendChild(noTracks);
      return;
    }

    tracks.forEach(track => {
      const item = createElement('div', ['lumoplay-audio-item']);
      if (track.enabled) {
        item.classList.add('active');
      }
      item.textContent = track.label || track.language || 'Track';
      item.addEventListener('click', () => {
        this.onTrackChange(track.id);
        this.toggleMenu();
      });
      this.menu.appendChild(item);
    });
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

export class TheaterModeButton {
  private container: HTMLElement;
  private button: HTMLButtonElement;

  constructor(onToggle: () => void) {
    this.container = createElement('div', ['lumoplay-theater-button']);
    
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-theater-toggle']);
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    `;
    this.button.setAttribute('aria-label', 'Theater mode');
    this.button.addEventListener('click', onToggle);
    
    this.container.appendChild(this.button);
  }

  updateTheaterMode(isTheatrical: boolean): void {
    if (isTheatrical) {
      this.button.classList.add('active');
      this.button.setAttribute('aria-label', 'Exit theater mode');
    } else {
      this.button.classList.remove('active');
      this.button.setAttribute('aria-label', 'Theater mode');
    }
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

export class MiniPlayerButton {
  private container: HTMLElement;
  private button: HTMLButtonElement;

  constructor(onToggle: () => void) {
    this.container = createElement('div', ['lumoplay-mini-button']);
    
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-mini-toggle']);
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
      </svg>
    `;
    this.button.setAttribute('aria-label', 'Mini player');
    this.button.addEventListener('click', onToggle);
    
    this.container.appendChild(this.button);
  }

  updateMiniMode(isMini: boolean): void {
    if (isMini) {
      this.button.classList.add('active');
      this.button.setAttribute('aria-label', 'Exit mini player');
    } else {
      this.button.classList.remove('active');
      this.button.setAttribute('aria-label', 'Mini player');
    }
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

export class Renderer {
  private container: HTMLElement;
  private controlsContainer: HTMLElement;
  private playButton: PlayButton;
  private volumeControl: VolumeControl;
  private progressBar: ProgressBar;
  private fullscreenButton: FullscreenButton;
  private timeDisplay: TimeDisplay;
  private seekButtons: SeekButtons;
  private speedControl: SpeedControl;
  private theaterModeButton: TheaterModeButton;
  private miniPlayerButton: MiniPlayerButton;
  private themeManager: ThemeManager;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoHideDelay: number;

  constructor(
    container: HTMLElement,
    player: any,
    options: { autoHideDelay?: number } = {}
  ) {
    this.container = container;
    this.autoHideDelay = options.autoHideDelay || 3000;
    
    this.themeManager = new ThemeManager(container);
    
    this.controlsContainer = createElement('div', ['lumoplay-controls']);
    
    this.playButton = new PlayButton(() => {
      if (player.isPlaying()) {
        player.pause();
      } else {
        player.play();
      }
    });
    this.volumeControl = new VolumeControl(
      () => player.toggleMute(),
      (volume) => player.setVolume(volume)
    );
    this.progressBar = new ProgressBar((time) => player.seek(time));
    this.fullscreenButton = new FullscreenButton(() => player.toggleFullscreen());
    this.timeDisplay = new TimeDisplay();
    this.seekButtons = new SeekButtons(
      () => player.rewind(10),
      () => player.forward(10)
    );
    this.speedControl = new SpeedControl((speed) => player.setSpeed(speed));
    this.theaterModeButton = new TheaterModeButton(() => player.toggleTheaterMode());
    this.miniPlayerButton = new MiniPlayerButton(() => player.toggleMiniPlayer());

    this.controlsContainer.appendChild(this.playButton.getElement());
    this.controlsContainer.appendChild(this.seekButtons.getElement());
    this.controlsContainer.appendChild(this.volumeControl.getElement());
    this.controlsContainer.appendChild(this.progressBar.getElement());
    this.controlsContainer.appendChild(this.timeDisplay.getElement());
    this.controlsContainer.appendChild(this.speedControl.getElement());
    this.controlsContainer.appendChild(this.theaterModeButton.getElement());
    this.controlsContainer.appendChild(this.miniPlayerButton.getElement());
    this.controlsContainer.appendChild(this.fullscreenButton.getElement());

    container.appendChild(this.controlsContainer);

    this.setupAutoHide();
  }

  private setupAutoHide(): void {
    const showControls = () => {
      this.controlsContainer.classList.remove('lumoplay-hidden');
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
      this.hideTimeout = setTimeout(() => {
        this.hideControls();
      }, this.autoHideDelay);
    };

    const hideControls = () => {
      this.hideControls();
    };

    this.container.addEventListener('mousemove', showControls);
    this.container.addEventListener('mouseenter', showControls);
    this.container.addEventListener('mouseleave', hideControls);
    this.container.addEventListener('click', showControls);

    this.controlsContainer.addEventListener('mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
    });
  }

  private hideControls(): void {
    this.controlsContainer.classList.add('lumoplay-hidden');
  }

  updatePlayState(isPlaying: boolean): void {
    this.playButton.setPlaying(isPlaying);
  }

  updateVolume(volume: number, isMuted: boolean): void {
    this.volumeControl.setVolume(volume);
    this.volumeControl.setMuted(isMuted);
  }

  updateProgress(currentTime: number, duration: number, buffered: TimeRanges): void {
    this.progressBar.setCurrentTime(currentTime);
    this.progressBar.setDuration(duration);
    this.progressBar.setBuffered(buffered);
    this.timeDisplay.setCurrentTime(currentTime);
    this.timeDisplay.setDuration(duration);
  }

  getProgressBar() {
    return this.progressBar;
  }

  updateFullscreen(): void {
    this.fullscreenButton.update();
  }

  applyTheme(theme: 'light' | 'dark' | 'auto' | 'custom', customConfig?: any): void {
    this.themeManager.applyTheme(theme, customConfig);
  }

  destroy(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.playButton.destroy();
    this.volumeControl.destroy();
    this.fullscreenButton.destroy();
    this.timeDisplay.destroy();
    this.controlsContainer.remove();
    this.themeManager.destroy();
  }
}

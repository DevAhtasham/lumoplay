import { PlayButton } from './controls/play-button';
import { VolumeControl } from './controls/volume-control';
import { ProgressBar } from './controls/progress-bar';
import { FullscreenButton } from './controls/fullscreen-button';
import { TimeDisplay } from './controls/time-display';
import { PipButton } from './controls/pip-button';
import { ThemeManager } from './theme-manager';
import { CenterPlayButton } from './overlay';
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

export class SettingsButton {
  private container: HTMLElement;
  private button: HTMLButtonElement;

  constructor(onSettingsClick: () => void) {
    this.container = createElement('div', ['lumoplay-settings-button']);
    
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-settings-toggle']);
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.04.17 0 .36.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.04-.22 0-.45-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    `;
    this.button.setAttribute('aria-label', 'Settings');
    this.button.addEventListener('click', onSettingsClick);
    
    this.container.appendChild(this.button);
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

export class Renderer {
  private container: HTMLElement;
  private controlsContainer: HTMLElement;
  private playButton: PlayButton;
  private volumeControl: VolumeControl;
  private progressBar: ProgressBar;
  private fullscreenButton: FullscreenButton;
  private timeDisplay: TimeDisplay;
  private seekButtons: SeekButtons;
  private settingsButton: SettingsButton;
  private pipButton: PipButton;
  private centerPlayButton: CenterPlayButton;
  private themeManager: ThemeManager;
  private player: any;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoHideDelay: number;

  constructor(
    container: HTMLElement,
    player: any,
    options: { autoHideDelay?: number } = {}
  ) {
    this.container = container;
    this.player = player;
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
    this.settingsButton = new SettingsButton(() => {
      console.log('Settings clicked');
    });
    this.pipButton = new PipButton(() => {
      player.togglePiP().catch(console.error);
    });
    this.centerPlayButton = new CenterPlayButton(container, () => {
      if (player.isPlaying()) {
        player.pause();
      } else {
        player.play();
      }
    });

    // Listen to play/pause events to update center button state
    player.on('play', () => {
      this.centerPlayButton.updateState(true);
    });
    player.on('pause', () => {
      this.centerPlayButton.updateState(false);
      // Show controls when paused
      this.controlsContainer.classList.remove('lumoplay-hidden');
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
    });

    // Add click handler on container to toggle play/pause
    container.addEventListener('click', (e) => {
      if (e.target && !(e.target as HTMLElement).closest('.lumoplay-controls') && !(e.target as HTMLElement).closest('.lumoplay-center-play-button')) {
        if (player.isPlaying()) {
          player.pause();
        } else {
          player.play();
        }
      }
    });

    this.controlsContainer.appendChild(this.playButton.getElement());
    this.controlsContainer.appendChild(this.seekButtons.getElement());
    this.controlsContainer.appendChild(this.volumeControl.getElement());
    this.controlsContainer.appendChild(this.progressBar.getElement());
    this.controlsContainer.appendChild(this.timeDisplay.getElement());
    this.controlsContainer.appendChild(this.settingsButton.getElement());
    this.controlsContainer.appendChild(this.pipButton.getElement());
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
      // Only auto-hide if video is playing
      if (this.player && this.player.isPlaying()) {
        this.hideTimeout = setTimeout(() => {
          this.hideControls();
        }, this.autoHideDelay);
      }
    };

    const hideControls = () => {
      if (this.player && this.player.isPlaying()) {
        this.hideControls();
      }
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

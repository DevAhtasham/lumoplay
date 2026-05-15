import { PlayButton } from './controls/play-button';
import { VolumeControl } from './controls/volume-control';
import { ProgressBar } from './controls/progress-bar';
import { TimeDisplay } from './controls/time-display';
import { FullscreenButton } from './controls/fullscreen-button';
import { SettingsButton } from './controls/settings-button';
import { PipButton } from './controls/pip-button';
import { SeekButtons } from './controls/seek-buttons';
import { AudioTrackButton } from './controls/audio-track-button';
import { CenterPlayButton } from './overlay';
import { ThemeManager } from './theme-manager';
import { createElement } from '../utils/dom';

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
  private audioTrackButton: AudioTrackButton;
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
    this.fullscreenButton = new FullscreenButton(() => player.toggleFullscreen(), container);
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
    this.audioTrackButton = new AudioTrackButton((trackId) => {
      player.setAudioTrack(trackId);
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

    // Add logo
    const logoElement = document.createElement('img');
    logoElement.src = '/assets/images/lumoplay.png';
    logoElement.alt = 'LumoPlay';
    logoElement.className = 'lumoplay-logo';
    
    // Prevent drag and right-click
    logoElement.addEventListener('dragstart', (e) => e.preventDefault());
    logoElement.addEventListener('contextmenu', (e) => e.preventDefault());
    logoElement.addEventListener('mousedown', (e) => e.preventDefault());
    
    this.controlsContainer.appendChild(logoElement);

    // Add audio track button and dropdown
    this.controlsContainer.appendChild(this.audioTrackButton.getElement());
    this.controlsContainer.appendChild(this.audioTrackButton.getDropdown());

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

  updateFullscreenButton(): void {
    this.fullscreenButton.update(this.container);
  }

  updateAudioTracks(tracks: any[]): void {
    this.audioTrackButton.setTracks(tracks);
  }

  setCurrentAudioTrack(trackId: string): void {
    this.audioTrackButton.setCurrentTrack(trackId);
  }

  destroy(): void {
    this.playButton.destroy();
    this.volumeControl.destroy();
    this.progressBar.destroy();
    this.timeDisplay.destroy();
    this.seekButtons.destroy();
    this.settingsButton.destroy();
    this.pipButton.destroy();
    this.audioTrackButton.destroy();
    this.fullscreenButton.destroy();
    this.centerPlayButton.destroy();
    this.controlsContainer.remove();
    this.themeManager.destroy();
  }
}

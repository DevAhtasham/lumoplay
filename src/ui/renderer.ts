import { PlayButton } from './controls/play-button';
import { VolumeControl } from './controls/volume-control';
import { ProgressBar } from './controls/progress-bar';
import { FullscreenButton } from './controls/fullscreen-button';
import { TimeDisplay } from './controls/time-display';
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
    
    this.playButton = new PlayButton(() => player.togglePlay());
    this.volumeControl = new VolumeControl(
      () => player.toggleMute(),
      (volume) => player.setVolume(volume)
    );
    this.progressBar = new ProgressBar((time) => player.seek(time));
    this.fullscreenButton = new FullscreenButton(() => player.toggleFullscreen());
    this.timeDisplay = new TimeDisplay();

    this.controlsContainer.appendChild(this.playButton.getElement());
    this.controlsContainer.appendChild(this.volumeControl.getElement());
    this.controlsContainer.appendChild(this.progressBar.getElement());
    this.controlsContainer.appendChild(this.timeDisplay.getElement());
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

import { createElement } from '../../utils/dom';

export class VolumeControl {
  private container: HTMLElement;
  private unifiedWrapper: HTMLElement;
  private button: HTMLButtonElement;
  private slider: HTMLInputElement;
  private verticalSlider: HTMLInputElement;
  private isMuted: boolean = false;
  private volume: number = 1;

  constructor(
    onMuteToggle: () => void,
    onVolumeChange: (volume: number) => void
  ) {
    this.container = createElement('div', ['lumoplay-volume']);

    // Unified wrapper that contains both vertical slider and icon
    this.unifiedWrapper = createElement('div', ['lumoplay-volume-wrapper']);

    // Vertical slider container
    const verticalContainer = createElement('div', ['lumoplay-volume-vertical']);
    this.verticalSlider = createElement<HTMLInputElement>('input');
    this.verticalSlider.type = 'range';
    this.verticalSlider.min = '0';
    this.verticalSlider.max = '1';
    this.verticalSlider.step = '0.01';
    this.verticalSlider.value = '1';
    this.verticalSlider.setAttribute('aria-label', 'Volume');
    this.verticalSlider.addEventListener('input', (e) => {
      const volume = parseFloat((e.target as HTMLInputElement).value);
      this.volume = volume;
      this.isMuted = volume === 0;
      this.slider.value = volume.toString();
      this.updateButton();
      this.updateSliderFill();
      this.updateVerticalSliderFill();
      onVolumeChange(volume);
    });
    verticalContainer.appendChild(this.verticalSlider);

    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-mute']);
    this.button.innerHTML = this.getVolumeIcon();
    this.button.setAttribute('aria-label', 'Mute');
    this.button.addEventListener('click', onMuteToggle);

    this.slider = createElement<HTMLInputElement>('input', ['lumoplay-volume-slider']);
    this.slider.type = 'range';
    this.slider.min = '0';
    this.slider.max = '1';
    this.slider.step = '0.01';
    this.slider.value = '1';
    this.slider.setAttribute('aria-label', 'Volume');
    this.slider.addEventListener('input', (e) => {
      const volume = parseFloat((e.target as HTMLInputElement).value);
      this.volume = volume;
      this.isMuted = volume === 0;
      this.updateButton();
      this.updateSliderFill();
      this.verticalSlider.value = volume.toString();
      this.updateVerticalSliderFill();
      onVolumeChange(volume);
    });

    // Build unified structure: vertical slider on top, icon at bottom
    this.unifiedWrapper.appendChild(verticalContainer);
    this.unifiedWrapper.appendChild(this.button);
    this.container.appendChild(this.unifiedWrapper);
    this.container.appendChild(this.slider);

    this.updateSliderFill();
    this.updateVerticalSliderFill();
  }

  private getVolumeIcon(): string {
    if (this.isMuted || this.volume === 0) {
      return `
        <svg viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `;
    } else if (this.volume < 0.5) {
      return `
        <svg viewBox="0 0 24 24">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
        </svg>
      `;
    }
    return `
      <svg viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    `;
  }

  private updateButton(): void {
    this.button.innerHTML = this.getVolumeIcon();
    this.button.setAttribute('aria-label', this.isMuted ? 'Unmute' : 'Mute');
  }

  private updateSliderFill(): void {
    const percentage = this.volume * 100;
    this.slider.style.background = `linear-gradient(to right, var(--lumoplay-primary) ${percentage}%, var(--lumoplay-buffer) ${percentage}%)`;
  }

  private updateVerticalSliderFill(): void {
    const percentage = (1 - this.volume) * 100;
    this.verticalSlider.style.background = `linear-gradient(to right, var(--lumoplay-primary) ${100 - percentage}%, var(--lumoplay-buffer) ${100 - percentage}%)`;
    this.verticalSlider.style.borderRadius = '9999px';
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.slider.value = volume.toString();
    this.verticalSlider.value = volume.toString();
    this.isMuted = volume === 0;
    this.updateButton();
    this.updateSliderFill();
    this.updateVerticalSliderFill();
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.slider.value = '0';
      this.verticalSlider.value = '0';
      this.updateSliderFill();
      this.updateVerticalSliderFill();
    } else {
      this.slider.value = this.volume.toString();
      this.verticalSlider.value = this.volume.toString();
      this.updateSliderFill();
      this.updateVerticalSliderFill();
    }
    this.updateButton();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

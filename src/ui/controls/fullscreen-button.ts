import { createElement } from '../../utils/dom';
import { isFullscreen } from '../../utils/dom';

export class FullscreenButton {
  private button: HTMLButtonElement;
  private isFullscreen: boolean = false;

  constructor(onToggle: () => void) {
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-fullscreen']);
    this.button.innerHTML = this.getFullscreenIcon();
    this.button.setAttribute('aria-label', 'Enter fullscreen');
    this.button.addEventListener('click', onToggle);
  }

  private getFullscreenIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    `;
  }

  private getExitFullscreenIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
      </svg>
    `;
  }

  update(): void {
    this.isFullscreen = isFullscreen();
    this.button.innerHTML = this.isFullscreen ? this.getExitFullscreenIcon() : this.getFullscreenIcon();
    this.button.setAttribute('aria-label', this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
  }

  getElement(): HTMLButtonElement {
    return this.button;
  }

  destroy(): void {
    this.button.remove();
  }
}

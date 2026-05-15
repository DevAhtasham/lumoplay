import { createElement } from '../../utils/dom';
import { isFullscreen } from '../../utils/dom';

export class FullscreenButton {
  private button: HTMLButtonElement;
  private isFullscreen: boolean = false;
  private isTheaterMode: boolean = false;

  constructor(onToggle: () => void, container: HTMLElement) {
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-fullscreen']);
    this.button.innerHTML = this.getFullscreenIcon();
    this.button.setAttribute('aria-label', 'Enter fullscreen');
    this.button.addEventListener('click', () => {
      if (this.isTheaterMode) {
        // In theater mode, the button acts as exit theater mode
        container.classList.remove('lumoplay-theatrical');
        this.update(container);
      } else {
        onToggle();
      }
    });
    this.button.addEventListener('mouseenter', () => this.handleHover(true));
    this.button.addEventListener('mouseleave', () => this.handleHover(false));
  }

  private handleHover(isHovering: boolean): void {
    const path = this.button.querySelector('.lumoplay-exit-icon path');
    if (path) {
      if (isHovering) {
        (path as SVGPathElement).setAttribute('fill', 'black');
      } else {
        (path as SVGPathElement).setAttribute('fill', 'white');
      }
    }
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

  private getExitTheaterIcon(): string {
    return `
      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="lumoplay-exit-icon">
        <rect x="0" fill="none" width="20" height="20"/>
        <g>
          <path fill="white" d="M13 3v2h2v10h-2v2h4V3h-4zm0 8V9H5.4l4.3-4.3-1.4-1.4L1.6 10l6.7 6.7 1.4-1.4L5.4 11H13z"/>
        </g>
      </svg>
    `;
  }

  update(container?: HTMLElement): void {
    this.isFullscreen = isFullscreen();
    this.isTheaterMode = container ? container.classList.contains('lumoplay-theatrical') : false;

    if (this.isTheaterMode) {
      this.button.innerHTML = this.getExitTheaterIcon();
      this.button.setAttribute('aria-label', 'Exit theater mode');
      // Set initial color to white
      setTimeout(() => {
        const path = this.button.querySelector('.lumoplay-exit-icon path');
        if (path) {
          (path as SVGPathElement).setAttribute('fill', 'white');
        }
      }, 0);
    } else {
      this.button.innerHTML = this.isFullscreen ? this.getExitFullscreenIcon() : this.getFullscreenIcon();
      this.button.setAttribute('aria-label', this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
    }
  }

  getElement(): HTMLButtonElement {
    return this.button;
  }

  destroy(): void {
    this.button.remove();
  }
}

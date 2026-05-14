import { createElement } from '../utils/dom';

export class Overlay {
  private container: HTMLElement;
  private overlay: HTMLElement;
  private content: HTMLElement;
  private icon: HTMLElement;
  private text: HTMLElement;

  constructor(playerContainer: HTMLElement) {
    this.container = playerContainer;
    
    this.overlay = createElement('div', ['lumoplay-overlay']);
    
    this.content = createElement('div', ['lumoplay-overlay-content']);
    
    this.icon = createElement('div', ['lumoplay-overlay-icon']);
    this.text = createElement('div', ['lumoplay-overlay-text']);
    
    this.content.appendChild(this.icon);
    this.content.appendChild(this.text);
    this.overlay.appendChild(this.content);
    
    this.container.appendChild(this.overlay);
  }

  show(icon: string, message: string, duration: number = 2000): void {
    this.icon.innerHTML = icon;
    this.text.textContent = message;
    this.overlay.classList.add('lumoplay-active');

    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    this.overlay.classList.remove('lumoplay-active');
  }

  showLoading(): void {
    this.icon.innerHTML = `<div class="lumoplay-loading"></div>`;
    this.text.textContent = 'Loading...';
    this.overlay.classList.add('lumoplay-active');
  }

  hideLoading(): void {
    this.hide();
  }

  getElement(): HTMLElement {
    return this.overlay;
  }

  destroy(): void {
    this.overlay.remove();
  }
}

export class CenterPlayButton {
  private container: HTMLElement;
  private button: HTMLButtonElement;
  private icon: HTMLElement;
  private onToggle: () => void;

  constructor(playerContainer: HTMLElement, onToggle: () => void) {
    this.container = playerContainer;
    this.onToggle = onToggle;

    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-center-play-button']);
    this.button.setAttribute('aria-label', 'Play');
    
    this.icon = createElement('div', ['lumoplay-center-play-icon']);
    this.icon.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    
    this.button.appendChild(this.icon);
    this.button.addEventListener('click', () => this.onToggle());
    
    this.container.appendChild(this.button);
  }

  updateState(isPlaying: boolean): void {
    if (isPlaying) {
      this.button.classList.add('hidden');
      this.button.setAttribute('aria-label', 'Pause');
    } else {
      this.button.classList.remove('hidden');
      this.button.setAttribute('aria-label', 'Play');
    }

    // Update icon - always show play icon when visible
    this.icon.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  }

  getElement(): HTMLElement {
    return this.button;
  }

  destroy(): void {
    this.button.remove();
  }
}

import { createElement } from '../../utils/dom';

export class SeekButtons {
  private container: HTMLElement;
  private rewindButton: HTMLButtonElement;
  private forwardButton: HTMLButtonElement;

  constructor(onRewind: () => void, onForward: () => void) {
    this.container = createElement('div', ['lumoplay-seek-buttons']);
    
    this.rewindButton = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-rewind']);
    this.rewindButton.innerHTML = this.getRewindIcon();
    this.rewindButton.setAttribute('aria-label', 'Rewind 10 seconds');
    this.rewindButton.addEventListener('click', onRewind);
    
    this.forwardButton = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-forward']);
    this.forwardButton.innerHTML = this.getForwardIcon();
    this.forwardButton.setAttribute('aria-label', 'Forward 10 seconds');
    this.forwardButton.addEventListener('click', onForward);
    
    this.container.appendChild(this.rewindButton);
    this.container.appendChild(this.forwardButton);
  }

  private getRewindIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
      </svg>
    `;
  }

  private getForwardIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
      </svg>
    `;
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.rewindButton.remove();
    this.forwardButton.remove();
    this.container.remove();
  }
}

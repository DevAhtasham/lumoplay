import { createElement } from '../../utils/dom';

export class PlayButton {
  private button: HTMLButtonElement;

  constructor(onClick: () => void) {
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-play']);
    this.button.innerHTML = this.getPlayIcon();
    this.button.setAttribute('aria-label', 'Play');
    this.button.addEventListener('click', onClick);
  }

  private getPlayIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
  }

  private getPauseIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    `;
  }

  setPlaying(playing: boolean): void {
    this.button.innerHTML = playing ? this.getPauseIcon() : this.getPlayIcon();
    this.button.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  getElement(): HTMLButtonElement {
    return this.button;
  }

  destroy(): void {
    this.button.remove();
  }
}

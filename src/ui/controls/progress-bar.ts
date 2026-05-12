import { createElement } from '../../utils/dom';

export class ProgressBar {
  private container: HTMLElement;
  private buffer: HTMLElement;
  private played: HTMLElement;
  private handle: HTMLElement;
  private duration: number = 0;

  constructor(_onSeek: (time: number) => void) {
    this.container = createElement('div', ['lumoplay-progress']);
    this.container.setAttribute('role', 'slider');
    this.container.setAttribute('aria-label', 'Seek');
    this.container.setAttribute('aria-valuemin', '0');
    this.container.setAttribute('aria-valuemax', '100');
    this.container.setAttribute('aria-valuenow', '0');

    this.buffer = createElement('div', ['lumoplay-progress-buffer']);
    this.played = createElement('div', ['lumoplay-progress-played']);
    this.handle = createElement('div', ['lumoplay-progress-handle']);

    this.container.appendChild(this.buffer);
    this.container.appendChild(this.played);
    this.container.appendChild(this.handle);

    let isDragging = false;

    this.container.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.handleSeek(e);
    });

    this.container.addEventListener('mousemove', (e) => {
      if (isDragging) {
        this.handleSeek(e);
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
      }
    });

    this.container.addEventListener('click', (e) => {
      this.handleSeek(e);
    });
  }

  private handleSeek(e: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * this.duration;
    this.updatePlayed(percent);
    this.container.dispatchEvent(new CustomEvent('seek', { detail: time }));
  }

  private updatePlayed(percent: number): void {
    this.played.style.width = `${percent * 100}%`;
    this.handle.style.left = `${percent * 100}%`;
    this.container.setAttribute('aria-valuenow', Math.round(percent * 100).toString());
  }

  setCurrentTime(time: number): void {
    const percent = this.duration > 0 ? time / this.duration : 0;
    this.updatePlayed(percent);
  }

  setDuration(duration: number): void {
    this.duration = duration;
    this.container.setAttribute('aria-valuemax', duration.toString());
  }

  setBuffered(buffered: TimeRanges): void {
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const percent = this.duration > 0 ? bufferedEnd / this.duration : 0;
      this.buffer.style.width = `${percent * 100}%`;
    }
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

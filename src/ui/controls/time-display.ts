import { createElement } from '../../utils/dom';
import { formatTime } from '../../utils/format-time';

export class TimeDisplay {
  private container: HTMLElement;
  private current: HTMLElement;
  private separator: HTMLElement;
  private duration: HTMLElement;

  constructor() {
    this.container = createElement('div', ['lumoplay-time']);
    this.container.setAttribute('role', 'timer');
    this.container.setAttribute('aria-live', 'off');

    this.current = createElement('span', ['lumoplay-current-time']);
    this.current.textContent = '0:00';

    this.separator = createElement('span', ['lumoplay-time-separator']);
    this.separator.textContent = ' / ';

    this.duration = createElement('span', ['lumoplay-duration']);
    this.duration.textContent = '0:00';

    this.container.appendChild(this.current);
    this.container.appendChild(this.separator);
    this.container.appendChild(this.duration);
  }

  setCurrentTime(time: number): void {
    this.current.textContent = formatTime(time);
    this.container.setAttribute('aria-label', `${formatTime(time)} of ${this.duration.textContent}`);
  }

  setDuration(duration: number): void {
    this.duration.textContent = formatTime(duration);
    this.container.setAttribute('aria-label', `${this.current.textContent} of ${formatTime(duration)}`);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

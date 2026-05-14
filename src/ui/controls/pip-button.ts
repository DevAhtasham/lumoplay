import { createElement } from '../../utils/dom';
import { isPiP } from '../../utils/dom';

export class PipButton {
  private container: HTMLElement;
  private button: HTMLButtonElement;

  constructor(onToggle: () => void) {
    this.container = createElement('div', ['lumoplay-pip-button']);
    
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-pip-toggle']);
    this.button.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>
      </svg>
    `;
    this.button.setAttribute('aria-label', 'Picture-in-Picture');
    this.button.addEventListener('click', onToggle);
    
    // Update button state based on PiP status
    const updateButtonState = () => {
      if (isPiP()) {
        this.button.classList.add('lumoplay-active');
        this.button.setAttribute('aria-label', 'Exit Picture-in-Picture');
      } else {
        this.button.classList.remove('lumoplay-active');
        this.button.setAttribute('aria-label', 'Picture-in-Picture');
      }
    };
    
    // Listen to PiP events
    document.addEventListener('enterpictureinpicture', updateButtonState);
    document.addEventListener('leavepictureinpicture', updateButtonState);
    
    // Initial state check
    updateButtonState();
    
    this.container.appendChild(this.button);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}

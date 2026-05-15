import { createElement } from '../../utils/dom';

export class AudioTrackButton {
  private button: HTMLButtonElement;
  private dropdown: HTMLDivElement;
  private isOpen: boolean = false;
  private tracks: any[] = [];
  private currentTrackId: string | null = null;

  constructor(onTrackChange: (trackId: string) => void) {
    this.button = createElement<HTMLButtonElement>('button', ['lumoplay-control', 'lumoplay-audio-track']);
    this.button.innerHTML = this.getAudioIcon();
    this.button.setAttribute('aria-label', 'Select audio track');
    
    this.dropdown = createElement<HTMLDivElement>('div', ['lumoplay-audio-track-dropdown']);
    this.dropdown.style.display = 'none';
    
    this.button.addEventListener('click', () => this.toggleDropdown());
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.button.contains(e.target as Node) && !this.dropdown.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });
    
    this.setupTrackSelection(onTrackChange);
  }

  private getAudioIcon(): string {
    return `
      <svg viewBox="0 0 24 24">
        <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
      </svg>
    `;
  }

  private setupTrackSelection(onTrackChange: (trackId: string) => void): void {
    this.dropdown.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('lumoplay-audio-track-option')) {
        const trackId = target.getAttribute('data-track-id');
        if (trackId) {
          this.selectTrack(trackId);
          onTrackChange(trackId);
        }
      }
    });
  }

  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    this.dropdown.style.display = 'block';
    this.isOpen = true;
    this.button.setAttribute('aria-expanded', 'true');
  }

  private closeDropdown(): void {
    this.dropdown.style.display = 'none';
    this.isOpen = false;
    this.button.setAttribute('aria-expanded', 'false');
  }

  private selectTrack(trackId: string): void {
    this.currentTrackId = trackId;
    this.updateDropdownSelection();
    this.closeDropdown();
  }

  private updateDropdownSelection(): void {
    const options = this.dropdown.querySelectorAll('.lumoplay-audio-track-option');
    options.forEach(option => {
      const optionTrackId = option.getAttribute('data-track-id');
      if (optionTrackId === this.currentTrackId) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }

  setTracks(tracks: any[]): void {
    this.tracks = tracks;
    this.renderDropdown();
  }

  setCurrentTrack(trackId: string): void {
    this.currentTrackId = trackId;
    this.updateDropdownSelection();
  }

  private renderDropdown(): void {
    this.dropdown.innerHTML = '';
    
    if (this.tracks.length === 0) {
      const noTracks = createElement('div', ['lumoplay-audio-track-no-tracks']);
      noTracks.textContent = 'No audio tracks available';
      this.dropdown.appendChild(noTracks);
      return;
    }

    this.tracks.forEach(track => {
      const option = createElement('div', ['lumoplay-audio-track-option']);
      option.setAttribute('data-track-id', track.id);
      
      const label = createElement('span', ['lumoplay-audio-track-label']);
      label.textContent = track.label || `Track ${track.id}`;
      
      const language = createElement('span', ['lumoplay-audio-track-language']);
      language.textContent = track.language || 'unknown';
      
      option.appendChild(label);
      option.appendChild(language);
      
      if (track.id === this.currentTrackId) {
        option.classList.add('selected');
      }
      
      this.dropdown.appendChild(option);
    });
  }

  getElement(): HTMLButtonElement {
    return this.button;
  }

  getDropdown(): HTMLDivElement {
    return this.dropdown;
  }

  destroy(): void {
    this.button.remove();
    this.dropdown.remove();
  }
}

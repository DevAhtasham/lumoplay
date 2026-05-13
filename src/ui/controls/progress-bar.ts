import { createElement } from '../../utils/dom';

export class ProgressBar {
  private container: HTMLElement;
  private buffer: HTMLElement;
  private played: HTMLElement;
  private handle: HTMLElement;
  private duration: number = 0;
  private thumbnailPreview: HTMLElement | null = null;
  private thumbnailsEnabled: boolean = false;
  private thumbImgA: HTMLImageElement | null = null;
  private thumbImgB: HTMLImageElement | null = null;
  private activeImg: 'A' | 'B' = 'A';
  private lastThumbUrl: string = '';
  private playerContainer: HTMLElement | null = null;

  private onSeek: (time: number) => void;

  constructor(onSeek: (time: number) => void) {
    this.onSeek = onSeek;
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
    
    // Call the seek callback to actually seek the video
    this.onSeek(time);
    
    // Also dispatch event for other listeners
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

  /**
   * Enable thumbnail previews
   */
  enableThumbnails(): void {
    this.thumbnailsEnabled = true;
    this.createThumbnailPreview();
    this.setupThumbnailEvents();
  }

  /**
   * Disable thumbnail previews
   */
  disableThumbnails(): void {
    this.thumbnailsEnabled = false;
    this.removeThumbnailPreview();
    this.removeThumbnailEvents();
  }

  /**
   * Create thumbnail preview container
   */
  private createThumbnailPreview(): void {
    if (this.thumbnailPreview) return;

    // Find the player root (ancestor with class 'lumoplay') to append preview there
    // This avoids overflow:hidden clipping from the controls bar
    this.playerContainer = this.container.closest('.lumoplay') as HTMLElement;
    const mountTarget = this.playerContainer || this.container;

    this.thumbnailPreview = createElement('div', ['lumoplay-thumbnail-preview']);
    this.thumbnailPreview.style.cssText = `
      position: absolute;
      background: #000;
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.05s ease;
      z-index: 9999;
      width: 160px;
      height: 90px;
      will-change: left, top, opacity;
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
    `;

    // Double-buffer: two img elements stacked, swap between them
    const imgStyle = 'position:absolute;top:0;left:0;width:160px;height:90px;object-fit:cover;display:block;';
    this.thumbImgA = document.createElement('img');
    this.thumbImgA.style.cssText = imgStyle + 'opacity:1;';
    this.thumbImgA.draggable = false;

    this.thumbImgB = document.createElement('img');
    this.thumbImgB.style.cssText = imgStyle + 'opacity:0;';
    this.thumbImgB.draggable = false;

    this.thumbnailPreview.appendChild(this.thumbImgA);
    this.thumbnailPreview.appendChild(this.thumbImgB);
    mountTarget.appendChild(this.thumbnailPreview);
  }

  /**
   * Remove thumbnail preview container
   */
  private removeThumbnailPreview(): void {
    if (this.thumbnailPreview && this.thumbnailPreview.parentNode) {
      this.thumbnailPreview.parentNode.removeChild(this.thumbnailPreview);
    }
    this.thumbnailPreview = null;
    this.thumbImgA = null;
    this.thumbImgB = null;
    this.activeImg = 'A';
    this.lastThumbUrl = '';
    this.playerContainer = null;
  }

  /**
   * Setup thumbnail hover events
   */
  private setupThumbnailEvents(): void {
    if (!this.thumbnailsEnabled) return;

    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

    this.container.addEventListener('mousemove', (e) => {
      if (!this.thumbnailsEnabled) return;

      // Clear existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      // Handle thumbnail requests immediately for better responsiveness
      this.handleThumbnailHover(e);
    });

    this.container.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      this.hideThumbnailPreview();
    });

    this.container.addEventListener('mouseenter', () => {
      // Could preload thumbnails here
    });
  }

  /**
   * Remove thumbnail events
   */
  private removeThumbnailEvents(): void {
    // Clone and replace to remove all event listeners
    const newContainer = this.container.cloneNode(true) as HTMLElement;
    this.container.parentNode?.replaceChild(newContainer, this.container);
    this.container = newContainer;
  }

  /**
   * Handle thumbnail hover
   */
  private handleThumbnailHover(e: MouseEvent): void {
    if (!this.thumbnailPreview || !this.thumbnailsEnabled) return;

    const rect = this.container.getBoundingClientRect();
    const time = this.getTimeFromPosition(e.clientX - rect.left);
    
    // Dispatch thumbnail request event (bubbles:true so outer listeners catch it)
    this.container.dispatchEvent(new CustomEvent('thumbnailRequest', {
      detail: { time, x: e.clientX, y: e.clientY },
      bubbles: true
    }));
  }

  /**
   * Show thumbnail preview
   */
  showThumbnailPreview(thumbnailUrl: string, position: { x: number; y: number }): void {
    if (!this.thumbnailPreview || !this.thumbnailsEnabled) return;
    if (!this.thumbImgA || !this.thumbImgB) return;

    // Update position first
    this.updateThumbnailPosition(position);

    // Skip if same URL — no redraw needed
    if (thumbnailUrl === this.lastThumbUrl) {
      this.thumbnailPreview.style.opacity = '1';
      return;
    }
    this.lastThumbUrl = thumbnailUrl;

    // Double-buffer swap: write into the hidden buffer, then flip instantly
    const incoming = this.activeImg === 'A' ? this.thumbImgB : this.thumbImgA;
    const outgoing = this.activeImg === 'A' ? this.thumbImgA : this.thumbImgB;

    incoming.onload = () => {
      // Flip: show incoming, hide outgoing — no transition so it's instant
      incoming.style.opacity = '1';
      outgoing.style.opacity = '0';
      this.activeImg = this.activeImg === 'A' ? 'B' : 'A';
    };
    incoming.src = thumbnailUrl;

    // Show the container
    this.thumbnailPreview.style.opacity = '1';
  }

  /**
   * Hide thumbnail preview
   */
  hideThumbnailPreview(): void {
    if (this.thumbnailPreview) {
      this.thumbnailPreview.style.opacity = '0';
    }
  }

  /**
   * Update thumbnail preview position
   */
  private updateThumbnailPosition(position: { x: number; y: number }): void {
    if (!this.thumbnailPreview) return;

    const mountTarget = this.playerContainer || this.container;
    const mountRect = mountTarget.getBoundingClientRect();
    const progressRect = this.container.getBoundingClientRect();
    const previewWidth = 160;
    const previewHeight = 90;
    const gap = 10;

    // Position relative to the player container
    const rawLeft = (position.x - mountRect.left) - previewWidth / 2;
    const finalLeft = Math.max(0, Math.min(rawLeft, mountRect.width - previewWidth));

    // Place preview just above the progress bar
    const finalTop = (progressRect.top - mountRect.top) - previewHeight - gap;

    this.thumbnailPreview.style.left = `${finalLeft}px`;
    this.thumbnailPreview.style.top = `${finalTop}px`;
  }

  /**
   * Get time from mouse position
   */
  private getTimeFromPosition(mouseX: number): number {
    const rect = this.container.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
    return percentage * this.duration;
  }

  /**
   * Check if thumbnails are enabled
   */
  areThumbnailsEnabled(): boolean {
    return this.thumbnailsEnabled;
  }

  destroy(): void {
    this.disableThumbnails();
    this.container.remove();
  }
}

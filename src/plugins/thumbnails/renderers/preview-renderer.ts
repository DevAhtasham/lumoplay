import type { Thumbnail, ThumbnailPreviewEvent } from '../types/thumbnails';
import { ThumbnailCalculations } from '../utils/calculations';

export class PreviewRenderer {
  private previewContainer: HTMLElement | null = null;
  private previewImage: HTMLElement | null = null;
  private isVisible: boolean = false;
  private currentThumbnail: Thumbnail | null = null;
  private animationFrame: number | null = null;

  constructor(
    private containerElement: HTMLElement,
    private progressElement: HTMLElement
  ) {
    this.createPreviewContainer();
  }

  /**
   * Create preview container element
   */
  private createPreviewContainer(): void {
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'lumoplay-thumbnail-preview';
    this.previewContainer.style.cssText = `
      position: absolute;
      bottom: 100%;
      transform: translateX(-50%);
      background: #000;
      border: 1px solid #333;
      border-radius: 4px;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1000;
    `;

    this.previewImage = document.createElement('div');
    this.previewImage.style.cssText = `
      width: 160px;
      height: 90px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    `;

    this.previewContainer.appendChild(this.previewImage);
    this.containerElement.appendChild(this.previewContainer);
  }

  /**
   * Show thumbnail preview
   */
  show(event: ThumbnailPreviewEvent): void {
    if (!this.previewContainer || !this.previewImage) {
      return;
    }

    this.currentThumbnail = event.thumbnail;
    
    if (event.thumbnail && event.visible) {
      this.updateThumbnail(event.thumbnail);
      this.updatePreviewPosition(event.position);
      this.showPreview();
    } else {
      this.hidePreview();
    }
  }

  /**
   * Hide thumbnail preview
   */
  hide(): void {
    this.hidePreview();
    this.currentThumbnail = null;
  }

  /**
   * Update thumbnail display
   */
  private updateThumbnail(thumbnail: Thumbnail): void {
    if (!this.previewImage) return;

    // Check if it's a sprite thumbnail or regular image
    if (this.isSpriteThumbnail(thumbnail)) {
      this.previewImage.style.backgroundImage = `url('${thumbnail.url}')`;
      this.previewImage.style.backgroundPosition = `-${thumbnail.x}px -${thumbnail.y}px`;
      this.previewImage.style.backgroundSize = 'auto';
    } else {
      this.previewImage.style.backgroundImage = `url('${thumbnail.url}')`;
      this.previewImage.style.backgroundPosition = 'center';
      this.previewImage.style.backgroundSize = 'cover';
    }

    this.previewImage.style.width = `${thumbnail.width}px`;
    this.previewImage.style.height = `${thumbnail.height}px`;
  }

  /**
   * Update preview position
   */
  private updatePreviewPosition(position: { x: number; y: number }): void {
    if (!this.previewContainer) return;

    const progressRect = this.progressElement.getBoundingClientRect();
    const containerRect = this.containerElement.getBoundingClientRect();
    
    // Calculate optimal position
    const previewWidth = this.currentThumbnail?.width || 160;
    const previewHeight = this.currentThumbnail?.height || 90;
    
    const calculatedPosition = ThumbnailCalculations.calculatePreviewPosition(
      position.x,
      progressRect,
      previewWidth,
      previewHeight,
      containerRect
    );

    // Convert to relative positioning within container
    const relativeX = calculatedPosition.x - containerRect.left;
    const relativeY = calculatedPosition.y - containerRect.top;

    this.previewContainer.style.left = `${relativeX}px`;
    this.previewContainer.style.top = `${relativeY}px`;
  }

  /**
   * Show preview with animation
   */
  private showPreview(): void {
    if (!this.previewContainer || this.isVisible) return;

    this.isVisible = true;
    
    // Use requestAnimationFrame for smooth animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      if (this.previewContainer) {
        this.previewContainer.style.opacity = '1';
      }
    });
  }

  /**
   * Hide preview with animation
   */
  private hidePreview(): void {
    if (!this.previewContainer || !this.isVisible) return;

    this.isVisible = false;
    
    // Use requestAnimationFrame for smooth animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      if (this.previewContainer) {
        this.previewContainer.style.opacity = '0';
      }
    });
  }

  /**
   * Check if thumbnail is from sprite sheet
   */
  private isSpriteThumbnail(thumbnail: Thumbnail): boolean {
    return thumbnail.x > 0 || thumbnail.y > 0;
  }

  /**
   * Set preview size
   */
  setPreviewSize(width: number, height: number): void {
    if (!this.previewImage) return;

    this.previewImage.style.width = `${width}px`;
    this.previewImage.style.height = `${height}px`;
  }

  /**
   * Set preview styling
   */
  setPreviewStyle(styles: Partial<CSSStyleDeclaration>): void {
    if (!this.previewContainer) return;

    Object.assign(this.previewContainer.style, styles);
  }

  /**
   * Get current visibility state
   */
  getVisibility(): boolean {
    return this.isVisible;
  }

  /**
   * Get current thumbnail
   */
  getCurrentThumbnail(): Thumbnail | null {
    return this.currentThumbnail;
  }

  /**
   * Force update preview position (useful on window resize)
   */
  updatePosition(): void {
    if (!this.currentThumbnail || !this.isVisible) return;

    // Recalculate position based on current mouse position
    // This would need to be tracked separately or passed in
    // For now, this method is a placeholder for future implementation
  }

  /**
   * Add custom CSS class to preview container
   */
  addClassName(className: string): void {
    if (!this.previewContainer) return;
    
    this.previewContainer.classList.add(className);
  }

  /**
   * Remove custom CSS class from preview container
   */
  removeClassName(className: string): void {
    if (!this.previewContainer) return;
    
    this.previewContainer.classList.remove(className);
  }

  /**
   * Cleanup and destroy renderer
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.previewContainer && this.previewContainer.parentNode) {
      this.previewContainer.parentNode.removeChild(this.previewContainer);
    }

    this.previewContainer = null;
    this.previewImage = null;
    this.currentThumbnail = null;
    this.isVisible = false;
  }

  /**
   * Check if preview container exists
   */
  exists(): boolean {
    return this.previewContainer !== null;
  }

  /**
   * Get preview container element (for advanced customization)
   */
  getContainer(): HTMLElement | null {
    return this.previewContainer;
  }

  /**
   * Get preview image element (for advanced customization)
   */
  getImage(): HTMLElement | null {
    return this.previewImage;
  }
}

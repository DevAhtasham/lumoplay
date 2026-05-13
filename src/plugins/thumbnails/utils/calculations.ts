import type { Thumbnail } from '../types/thumbnails';

export class ThumbnailCalculations {
  /**
   * Convert time in seconds to percentage position on progress bar
   */
  static timeToPercentage(time: number, duration: number): number {
    if (duration <= 0) return 0;
    return Math.min(Math.max(time / duration, 0), 1);
  }

  /**
   * Convert percentage position on progress bar to time in seconds
   */
  static percentageToTime(percentage: number, duration: number): number {
    return percentage * duration;
  }

  /**
   * Convert mouse position to time based on progress bar dimensions
   */
  static positionToTime(
    mouseX: number,
    progressRect: DOMRect,
    duration: number
  ): number {
    const relativeX = mouseX - progressRect.left;
    const percentage = Math.min(Math.max(relativeX / progressRect.width, 0), 1);
    return this.percentageToTime(percentage, duration);
  }

  /**
   * Calculate sprite position for given thumbnail index
   */
  static calculateSpritePosition(
    index: number,
    columns: number,
    thumbnailWidth: number,
    thumbnailHeight: number
  ): { x: number; y: number } {
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    return {
      x: col * thumbnailWidth,
      y: row * thumbnailHeight
    };
  }

  /**
   * Find the best thumbnail for given time from an array of thumbnails
   */
  static findBestThumbnail(
    time: number,
    thumbnails: Thumbnail[]
  ): Thumbnail | null {
    if (thumbnails.length === 0) return null;

    // Find exact match or closest previous thumbnail
    let bestThumbnail = thumbnails[0];
    
    for (const thumbnail of thumbnails) {
      if (thumbnail.time <= time) {
        bestThumbnail = thumbnail;
      } else {
        break;
      }
    }

    return bestThumbnail;
  }

  /**
   * Calculate preview position relative to progress bar
   */
  static calculatePreviewPosition(
    mouseX: number,
    progressRect: DOMRect,
    previewWidth: number,
    previewHeight: number,
    containerRect: DOMRect
  ): { x: number; y: number } {
    // Calculate horizontal position (centered on mouse, but keep within bounds)
    let x = mouseX - previewWidth / 2;
    
    // Ensure preview doesn't go outside container
    if (x < containerRect.left) {
      x = containerRect.left;
    } else if (x + previewWidth > containerRect.right) {
      x = containerRect.right - previewWidth;
    }

    // Calculate vertical position (above progress bar)
    const y = progressRect.top - previewHeight - 10; // 10px gap

    return { x, y };
  }

  /**
   * Calculate thumbnail index for sprite sheets based on time
   */
  static calculateThumbnailIndex(
    time: number,
    interval: number,
    duration: number
  ): number {
    return Math.floor(time / interval);
  }

  /**
   * Parse WebVTT coordinate string (e.g., "thumbnails.jpg#xywh=0,0,160,90")
   */
  static parseWebVTTCoordinates(coordString: string): {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    const match = coordString.match(/^(.+)#xywh=(\d+),(\d+),(\d+),(\d+)$/);
    if (!match) return null;

    const [, url, x, y, width, height] = match;
    
    return {
      url,
      x: parseInt(x, 10),
      y: parseInt(y, 10),
      width: parseInt(width, 10),
      height: parseInt(height, 10)
    };
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Throttle function to limit call frequency
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
          timeoutId = null;
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
}

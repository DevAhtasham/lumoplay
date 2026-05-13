import type { Thumbnail, SpriteConfig } from '../types/thumbnails';
import { ThumbnailCalculations } from '../utils/calculations';

export class SpriteRenderer {
  /**
   * Generate thumbnails from sprite sheet configuration
   */
  generateThumbnails(config: SpriteConfig): Thumbnail[] {
    const thumbnails: Thumbnail[] = [];
    
    const {
      url,
      columns,
      rows,
      width: thumbnailWidth,
      height: thumbnailHeight,
      interval
    } = config;
    
    // Calculate total number of thumbnails
    const totalThumbnails = columns * rows;
    const totalDuration = totalThumbnails * interval;
    
    // Generate thumbnail for each position in sprite sheet
    for (let index = 0; index < totalThumbnails; index++) {
      const position = ThumbnailCalculations.calculateSpritePosition(
        index,
        columns,
        thumbnailWidth,
        thumbnailHeight
      );
      
      const time = index * interval;
      
      // Don't generate thumbnails beyond video duration (if known)
      if (time >= totalDuration) {
        break;
      }
      
      thumbnails.push({
        url,
        x: position.x,
        y: position.y,
        width: thumbnailWidth,
        height: thumbnailHeight,
        time
      });
    }
    
    return thumbnails;
  }
  
  /**
   * Create CSS background style for sprite thumbnail
   */
  createBackgroundStyle(thumbnail: Thumbnail): string {
    return `background-image: url('${thumbnail.url}'); background-position: -${thumbnail.x}px -${thumbnail.y}px; background-size: auto;`;
  }
  
  /**
   * Get CSS for sprite container
   */
  getSpriteContainerCSS(thumbnail: Thumbnail): {
    width: string;
    height: string;
    backgroundImage: string;
    backgroundPosition: string;
    backgroundSize: string;
  } {
    return {
      width: `${thumbnail.width}px`,
      height: `${thumbnail.height}px`,
      backgroundImage: `url('${thumbnail.url}')`,
      backgroundPosition: `-${thumbnail.x}px -${thumbnail.y}px`,
      backgroundSize: 'auto'
    };
  }
  
  /**
   * Validate sprite configuration
   */
  validateConfig(config: SpriteConfig): { valid: boolean; error?: string } {
    const required = ['url', 'columns', 'rows', 'width', 'height', 'interval'];
    
    for (const prop of required) {
      if (!(prop in config) || config[prop as keyof SpriteConfig] === undefined) {
        return { valid: false, error: `Missing required property: ${prop}` };
      }
    }
    
    // Validate numeric values
    if (config.columns <= 0 || config.rows <= 0) {
      return { valid: false, error: 'Columns and rows must be positive numbers' };
    }
    
    if (config.width <= 0 || config.height <= 0) {
      return { valid: false, error: 'Width and height must be positive numbers' };
    }
    
    if (config.interval <= 0) {
      return { valid: false, error: 'Interval must be a positive number' };
    }
    
    return { valid: true };
  }
  
  /**
   * Calculate sprite sheet dimensions
   */
  calculateSpriteDimensions(config: SpriteConfig): {
    width: number;
    height: number;
    totalThumbnails: number;
  } {
    const {
      columns,
      rows,
      width: thumbnailWidth,
      height: thumbnailHeight
    } = config;
    
    return {
      width: columns * thumbnailWidth,
      height: rows * thumbnailHeight,
      totalThumbnails: columns * rows
    };
  }
  
  /**
   * Get thumbnail index for specific time
   */
  getThumbnailIndex(time: number, interval: number): number {
    return Math.floor(time / interval);
  }
  
  /**
   * Get time range covered by sprite
   */
  getTimeRange(config: SpriteConfig): {
    start: number;
    end: number;
    duration: number;
  } {
    const { columns, rows, interval } = config;
    const totalThumbnails = columns * rows;
    
    return {
      start: 0,
      end: (totalThumbnails - 1) * interval,
      duration: totalThumbnails * interval
    };
  }
  
  /**
   * Optimize sprite configuration for better performance
   */
  optimizeConfig(config: SpriteConfig): SpriteConfig {
    const optimized = { ...config };
    
    // Ensure reasonable limits
    optimized.columns = Math.min(optimized.columns, 20);
    optimized.rows = Math.min(optimized.rows, 20);
    optimized.interval = Math.max(optimized.interval, 0.5);
    
    // Calculate optimal thumbnail size if not specified
    if (!optimized.width || !optimized.height) {
      // Default to 160x90 for 16:9 aspect ratio
      optimized.width = optimized.width || 160;
      optimized.height = optimized.height || 90;
    }
    
    return optimized;
  }
  
  /**
   * Generate preview HTML element for sprite thumbnail
   */
  createPreviewElement(thumbnail: Thumbnail, className: string = 'thumbnail-preview'): HTMLElement {
    const element = document.createElement('div');
    element.className = className;
    
    const css = this.getSpriteContainerCSS(thumbnail);
    
    Object.assign(element.style, css);
    
    return element;
  }
  
  /**
   * Preload sprite image
   */
  preloadSprite(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load sprite image: ${url}`));
      
      img.src = url;
    });
  }
  
  /**
   * Check if sprite image is loaded
   */
  isSpriteLoaded(url: string): Promise<boolean> {
    return this.preloadSprite(url)
      .then(() => true)
      .catch(() => false);
  }
}

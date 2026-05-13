// Thumbnail Preview Plugin Entry Point
// Provides lazy-loaded thumbnail preview functionality for LumoPlay

import type { Thumbnail, ThumbnailConfig, SpriteConfig, WebVTTConfig, ThumbnailEngine as IThumbnailEngine } from './types/thumbnails';
import { ThumbnailCache } from './engine/cache';
import { ThumbnailLoader } from './engine/loader';
import { WebVTTParser } from './parsers/webvtt-parser';
import { SpriteRenderer } from './renderers/sprite-renderer';
import { PreviewRenderer } from './renderers/preview-renderer';
import { TimelineHoverHooks } from './hooks/timeline-hover';
import { ThumbnailCalculations } from './utils/calculations';

// Re-export types
export type { Thumbnail, ThumbnailConfig, SpriteConfig, WebVTTConfig };
export type { ThumbnailEngine as IThumbnailEngine };

// Re-export classes
export { ThumbnailCache, ThumbnailLoader, WebVTTParser, SpriteRenderer, PreviewRenderer, TimelineHoverHooks, ThumbnailCalculations };

/**
 * Main Thumbnail Plugin Class
 * Provides easy integration with LumoPlay player
 */
export class ThumbnailPlugin {
  private engine: IThumbnailEngine | null = null;
  private previewRenderer: PreviewRenderer | null = null;
  private timelineHooks: TimelineHoverHooks | null = null;
  private isEnabled: boolean = false;

  constructor(
    private progressElement: HTMLElement,
    private containerElement: HTMLElement
  ) {
    this.previewRenderer = new PreviewRenderer(containerElement, progressElement);
    this.timelineHooks = new TimelineHoverHooks(progressElement, containerElement);
  }

  /**
   * Enable thumbnail previews with configuration
   */
  async enable(config: ThumbnailConfig): Promise<void> {
    if (!config.enabled) {
      throw new Error('Thumbnails must be enabled in configuration');
    }

    try {
      // Lazy load the thumbnail engine
      const { ThumbnailEngine } = await import('./engine/thumbnail-engine');
      
      this.engine = new ThumbnailEngine();
      await this.engine.loadThumbnails(config);
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Enable timeline hover tracking
      this.timelineHooks?.enable(this.getVideoDuration());
      
      this.isEnabled = true;
      
      console.log('Thumbnail previews enabled successfully');
    } catch (error) {
      console.error('Failed to enable thumbnail previews:', error);
      throw error;
    }
  }

  /**
   * Disable thumbnail previews
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.timelineHooks?.disable();
    this.previewRenderer?.hide();
    this.engine?.destroy();
    
    this.engine = null;
    this.isEnabled = false;
    
    console.log('Thumbnail previews disabled');
  }

  /**
   * Check if thumbnails are enabled
   */
  enabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get thumbnail for specific time
   */
  getThumbnail(time: number): Thumbnail | null {
    return this.engine?.getThumbnail(time) || null;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.engine?.getCacheStats() || null;
  }

  /**
   * Clear thumbnail cache
   */
  clearCache(): void {
    this.engine?.clearCache();
  }

  /**
   * Setup event handlers for thumbnail display
   */
  private setupEventHandlers(): void {
    if (!this.timelineHooks || !this.previewRenderer || !this.engine) return;

    // Handle timeline hover events
    this.timelineHooks.addEventListener('timelineHover', (event: any) => {
      const thumbnail = this.engine!.getThumbnail(event.time);
      
      this.previewRenderer.show({
        thumbnail,
        position: { x: event.x, y: event.y },
        visible: !!thumbnail
      });
    });

    // Handle mouse leave to hide preview
    this.timelineHooks.addEventListener('thumbnailDisplay', (event: any) => {
      this.previewRenderer.show(event);
    });
  }

  /**
   * Get video duration (placeholder - should be provided by player)
   */
  private getVideoDuration(): number {
    // This should be provided by the player instance
    // For now, return a reasonable default
    return 300; // 5 minutes
  }

  /**
   * Update video duration when player loads new video
   */
  setDuration(duration: number): void {
    this.timelineHooks?.setDuration(duration);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disable();
    this.previewRenderer?.destroy();
    this.timelineHooks?.destroy();
  }

  /**
   * Static factory method for easy integration
   */
  static async create(
    progressElement: HTMLElement,
    containerElement: HTMLElement,
    config: ThumbnailConfig
  ): Promise<ThumbnailPlugin> {
    const plugin = new ThumbnailPlugin(progressElement, containerElement);
    await plugin.enable(config);
    return plugin;
  }
}

/**
 * Default thumbnail configuration
 */
export const DEFAULT_THUMBNAIL_CONFIG: Partial<ThumbnailConfig> = {
  enabled: false,
  width: 160,
  height: 90,
  type: 'webvtt'
};

/**
 * Helper function to create WebVTT configuration
 */
export function createWebVTTConfig(url: string): WebVTTConfig {
  return {
    enabled: true,
    type: 'webvtt',
    url,
    ...DEFAULT_THUMBNAIL_CONFIG
  } as WebVTTConfig;
}

/**
 * Helper function to create sprite configuration
 */
export function createSpriteConfig(
  url: string,
  columns: number,
  rows: number,
  interval: number
): SpriteConfig {
  return {
    enabled: true,
    type: 'sprite',
    url,
    columns,
    rows,
    width: 160,
    height: 90,
    interval,
    ...DEFAULT_THUMBNAIL_CONFIG
  } as SpriteConfig;
}

// Export all types for external use
export * from './types/thumbnails';

import type { Thumbnail, ThumbnailConfig } from '../types/thumbnails';

export interface LoadResult {
  success: boolean;
  thumbnails?: Thumbnail[];
  error?: string;
}

export class ThumbnailLoader {
  private loadingPromises: Map<string, Promise<LoadResult>> = new Map();
  private loadedSources: Set<string> = new Set();

  /**
   * Load thumbnails from source
   */
  async load(config: ThumbnailConfig): Promise<LoadResult> {
    if (!config.enabled || !config.source) {
      return { success: false, error: 'Thumbnails disabled or no source specified' };
    }

    // Check if already loading
    if (this.loadingPromises.has(config.source)) {
      return this.loadingPromises.get(config.source)!;
    }

    // Check if already loaded
    if (this.loadedSources.has(config.source)) {
      return { success: false, error: 'Source already loaded' };
    }

    // Create loading promise
    const loadingPromise = this.performLoad(config);
    this.loadingPromises.set(config.source, loadingPromise);

    try {
      const result = await loadingPromise;
      
      if (result.success) {
        this.loadedSources.add(config.source);
      }
      
      return result;
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(config.source);
    }
  }

  /**
   * Perform the actual loading based on configuration
   */
  private async performLoad(config: ThumbnailConfig): Promise<LoadResult> {
    try {
      switch (config.type) {
        case 'webvtt':
          return await this.loadWebVTT(config);
        case 'sprite':
          return await this.loadSprite(config);
        default:
          // Auto-detect type based on file extension
          if (config.source?.endsWith('.vtt')) {
            return await this.loadWebVTT({ ...config, type: 'webvtt' });
          } else if (config.source?.match(/\.(jpg|jpeg|png|webp)$/i)) {
            return await this.loadSprite({ ...config, type: 'sprite' });
          }
          
          return { success: false, error: 'Unable to determine thumbnail type' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown loading error'
      };
    }
  }

  /**
   * Load WebVTT thumbnails
   */
  private async loadWebVTT(config: ThumbnailConfig): Promise<LoadResult> {
    if (config.type !== 'webvtt' || !('url' in config)) {
      return { success: false, error: 'Invalid configuration for WebVTT' };
    }

    try {
      const url = config.url as string;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch WebVTT: ${response.status}`);
      }

      // For now, return empty thumbnails until parser is implemented
      const thumbnails: Thumbnail[] = [];
      
      return { success: true, thumbnails };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WebVTT loading failed'
      };
    }
  }

  /**
   * Load sprite sheet thumbnails
   */
  private async loadSprite(config: ThumbnailConfig): Promise<LoadResult> {
    if (config.type !== 'sprite' || !('url' in config)) {
      return { success: false, error: 'Invalid configuration for sprite' };
    }

    try {
      // Validate sprite configuration
      if (!config.url || !config.columns || !config.rows || !config.width || !config.height) {
        throw new Error('Missing required sprite configuration');
      }

      // Preload the sprite image to validate it exists
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(void 0);
        img.onerror = () => reject(new Error('Failed to load sprite image'));
        img.src = config.url as string;
      });

      // For now, return empty thumbnails until renderer is implemented
      const thumbnails: Thumbnail[] = [];
      
      return { success: true, thumbnails };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sprite loading failed'
      };
    }
  }

  /**
   * Check if source is currently loading
   */
  isLoading(source: string): boolean {
    return this.loadingPromises.has(source);
  }

  /**
   * Check if source is already loaded
   */
  isLoaded(source: string): boolean {
    return this.loadedSources.has(source);
  }

  /**
   * Get loading progress (for multiple sources)
   */
  getLoadingProgress(): {
    total: number;
    loading: number;
    loaded: number;
  } {
    return {
      total: this.loadingPromises.size + this.loadedSources.size,
      loading: this.loadingPromises.size,
      loaded: this.loadedSources.size
    };
  }

  /**
   * Cancel loading for a specific source
   */
  cancelLoad(source: string): boolean {
    const promise = this.loadingPromises.get(source);
    if (promise) {
      this.loadingPromises.delete(source);
      return true;
    }
    return false;
  }

  /**
   * Clear all loaded sources (for cleanup)
   */
  clear(): void {
    this.loadingPromises.clear();
    this.loadedSources.clear();
  }

  /**
   * Preload multiple sources
   */
  async preloadMultiple(configs: ThumbnailConfig[]): Promise<LoadResult[]> {
    const promises = configs.map(config => this.load(config));
    return Promise.all(promises);
  }

  /**
   * Validate configuration before loading
   */
  private validateConfig(config: ThumbnailConfig): { valid: boolean; error?: string } {
    if (!config.enabled) {
      return { valid: false, error: 'Thumbnails not enabled' };
    }

    if (!config.source) {
      return { valid: false, error: 'No source specified' };
    }

    if (config.type === 'sprite') {
      const required = ['url', 'columns', 'rows', 'width', 'height', 'interval'];
      for (const prop of required) {
        if (!(prop in config) || config[prop as keyof ThumbnailConfig] === undefined) {
          return { valid: false, error: `Missing required property: ${prop}` };
        }
      }
    }

    return { valid: true };
  }
}

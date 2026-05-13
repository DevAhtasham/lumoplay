import type { Thumbnail, ThumbnailConfig, ThumbnailEngine as IThumbnailEngine } from '../types/thumbnails';
import { ThumbnailCache } from './cache';
import { ThumbnailLoader } from './loader';
import { ThumbnailCalculations } from '../utils/calculations';

export class ThumbnailEngine implements IThumbnailEngine {
  private cache: ThumbnailCache;
  private loader: ThumbnailLoader;
  private thumbnails: Thumbnail[] = [];
  private isLoadedFlag: boolean = false;
  private config: ThumbnailConfig | null = null;

  constructor(cacheSize: number = 100) {
    this.cache = new ThumbnailCache(cacheSize);
    this.loader = new ThumbnailLoader();
  }

  /**
   * Load thumbnails from configuration
   */
  async loadThumbnails(config: ThumbnailConfig): Promise<void> {
    if (!config.enabled) {
      throw new Error('Thumbnails are not enabled');
    }

    this.config = config;
    
    try {
      const result = await this.loader.load(config);
      
      if (result.success && result.thumbnails) {
        this.thumbnails = result.thumbnails;
        this.isLoadedFlag = true;
        
        // Cache all thumbnails for quick access
        this.thumbnails.forEach((thumbnail, index) => {
          const cacheKey = this.generateCacheKey(thumbnail.time);
          this.cache.set(cacheKey, thumbnail);
        });
      } else {
        throw new Error(result.error || 'Failed to load thumbnails');
      }
    } catch (error) {
      this.isLoadedFlag = false;
      throw error;
    }
  }

  /**
   * Get thumbnail for specific time
   */
  getThumbnail(time: number): Thumbnail | null {
    if (!this.isLoadedFlag || this.thumbnails.length === 0) {
      return null;
    }

    // Try to get from cache first
    const cacheKey = this.generateCacheKey(time);
    const cachedThumbnail = this.cache.get(cacheKey);
    
    if (cachedThumbnail) {
      return cachedThumbnail;
    }

    // Find best thumbnail from array
    const bestThumbnail = ThumbnailCalculations.findBestThumbnail(time, this.thumbnails);
    
    if (bestThumbnail) {
      // Cache the result
      this.cache.set(cacheKey, bestThumbnail);
    }
    
    return bestThumbnail;
  }

  /**
   * Check if thumbnails are loaded
   */
  isLoaded(): boolean {
    return this.isLoadedFlag;
  }

  /**
   * Get all loaded thumbnails
   */
  getAllThumbnails(): Thumbnail[] {
    return [...this.thumbnails];
  }

  /**
   * Get thumbnail count
   */
  getThumbnailCount(): number {
    return this.thumbnails.length;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cleanup and destroy engine
   */
  destroy(): void {
    this.cache.clear();
    this.loader.clear();
    this.thumbnails = [];
    this.isLoadedFlag = false;
    this.config = null;
  }

  /**
   * Get current configuration
   */
  getConfig(): ThumbnailConfig | null {
    return this.config ? { ...this.config } : null;
  }

  /**
   * Reload thumbnails with same configuration
   */
  async reload(): Promise<void> {
    if (!this.config) {
      throw new Error('No configuration to reload');
    }

    this.destroy();
    await this.loadThumbnails(this.config);
  }

  /**
   * Preload thumbnails for time range
   */
  async preloadRange(startTime: number, endTime: number): Promise<Thumbnail[]> {
    if (!this.isLoadedFlag) {
      return [];
    }

    const preloadTimes: number[] = [];
    const timeStep = this.calculateTimeStep();

    // Generate times to preload
    for (let time = startTime; time <= endTime; time += timeStep) {
      preloadTimes.push(time);
    }

    // Preload thumbnails
    const cacheKeys = preloadTimes.map(time => this.generateCacheKey(time));
    const loadFn = async (key: string) => {
      const time = parseFloat(key.split('_')[1]);
      return this.getThumbnail(time);
    };

    return this.cache.preload(cacheKeys, loadFn);
  }

  /**
   * Generate cache key for time
   */
  private generateCacheKey(time: number): string {
    // Round time to 2 decimal places for better cache hits
    const roundedTime = Math.round(time * 100) / 100;
    return `thumb_${roundedTime}`;
  }

  /**
   * Calculate optimal time step for preloading
   */
  private calculateTimeStep(): number {
    if (this.thumbnails.length < 2) {
      return 1;
    }

    // Calculate average time between thumbnails
    const timeDifferences: number[] = [];
    
    for (let i = 1; i < this.thumbnails.length; i++) {
      const diff = this.thumbnails[i].time - this.thumbnails[i - 1].time;
      timeDifferences.push(diff);
    }

    const avgTimeDiff = timeDifferences.reduce((sum, diff) => sum + diff, 0) / timeDifferences.length;
    
    return Math.max(avgTimeDiff / 2, 0.5); // Half the average interval, minimum 0.5s
  }

  /**
   * Get loading progress
   */
  getLoadingProgress() {
    return this.loader.getLoadingProgress();
  }

  /**
   * Check if specific time has thumbnail
   */
  hasThumbnail(time: number): boolean {
    return this.getThumbnail(time) !== null;
  }

  /**
   * Get nearest thumbnail time
   */
  getNearestThumbnailTime(time: number): number | null {
    const thumbnail = this.getThumbnail(time);
    return thumbnail ? thumbnail.time : null;
  }

  /**
   * Get time range covered by thumbnails
   */
  getTimeRange(): { start: number; end: number } | null {
    if (this.thumbnails.length === 0) {
      return null;
    }

    const times = this.thumbnails.map(t => t.time).sort((a, b) => a - b);
    
    return {
      start: times[0],
      end: times[times.length - 1]
    };
  }
}

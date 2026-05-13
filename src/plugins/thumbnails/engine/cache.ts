import type { Thumbnail, CacheEntry } from '../types/thumbnails';

export class ThumbnailCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private currentSize: number = 0;
  private accessOrder: string[] = [];

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get thumbnail from cache
   */
  get(key: string): Thumbnail | null {
    const entry = this.cache.get(key);
    
    if (entry) {
      // Update access information
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      
      // Move to end of access order (most recently used)
      this.updateAccessOrder(key);
      
      return entry.thumbnail;
    }
    
    return null;
  }

  /**
   * Add thumbnail to cache
   */
  set(key: string, thumbnail: Thumbnail): void {
    // Check if key already exists
    const existingEntry = this.cache.get(key);
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.thumbnail = thumbnail;
      existingEntry.lastAccessed = Date.now();
      existingEntry.accessCount++;
      this.updateAccessOrder(key);
      return;
    }

    // Check if cache is full
    if (this.currentSize >= this.maxSize) {
      this.evictLRU();
    }

    // Create new entry
    const entry: CacheEntry = {
      thumbnail,
      lastAccessed: Date.now(),
      accessCount: 1
    };

    this.cache.set(key, entry);
    this.currentSize++;
    this.accessOrder.push(key);
  }

  /**
   * Remove thumbnail from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.currentSize--;
      this.removeFromAccessOrder(key);
    }
    
    return deleted;
  }

  /**
   * Check if thumbnail exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    mostAccessed: Array<{ key: string; count: number }>;
  } {
    const entries = Array.from(this.cache.entries());
    const totalAccess = entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0);
    
    // Sort by access count for most accessed
    const mostAccessed = entries
      .map(([key, entry]) => ({ key, count: entry.accessCount }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      size: this.currentSize,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? 1 : 0, // Simplified hit rate
      mostAccessed
    };
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    // Remove oldest entries (10% of cache or 1, whichever is larger)
    const evictCount = Math.max(1, Math.floor(this.maxSize * 0.1));
    
    for (let i = 0; i < evictCount && this.accessOrder.length > 0; i++) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
        this.currentSize--;
      }
    }
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order array
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Get cache keys for debugging
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Preload thumbnails with given keys (for optimization)
   */
  preload(keys: string[], loadFn: (key: string) => Promise<Thumbnail | null>): Promise<Thumbnail[]> {
    const promises = keys
      .filter(key => !this.has(key))
      .map(async (key) => {
        try {
          const thumbnail = await loadFn(key);
          if (thumbnail) {
            this.set(key, thumbnail);
          }
          return thumbnail;
        } catch (error) {
          console.warn(`Failed to preload thumbnail for key: ${key}`, error);
          return null;
        }
      });

    return Promise.all(promises).then(results => 
      results.filter((thumbnail): thumbnail is Thumbnail => thumbnail !== null)
    );
  }

  /**
   * Cleanup old entries based on time
   */
  cleanup(maxAge: number = 30 * 60 * 1000): void { // 30 minutes default
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }
}

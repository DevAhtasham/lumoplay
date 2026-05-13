export interface Thumbnail {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  time: number;
}

export interface ThumbnailConfig {
  enabled: boolean;
  source?: string;
  type?: 'webvtt' | 'sprite';
  width?: number;
  height?: number;
  columns?: number;
  rows?: number;
  interval?: number;
}

export interface SpriteConfig extends ThumbnailConfig {
  type: 'sprite';
  url: string;
  columns: number;
  rows: number;
  width: number;
  height: number;
  interval: number;
}

export interface WebVTTConfig extends ThumbnailConfig {
  type: 'webvtt';
  url: string;
}

export interface ThumbnailEngine {
  loadThumbnails(config: ThumbnailConfig): Promise<void>;
  getThumbnail(time: number): Thumbnail | null;
  destroy(): void;
  isLoaded(): boolean;
}

export interface CacheEntry {
  thumbnail: Thumbnail;
  lastAccessed: number;
  accessCount: number;
}

export interface TimelineHoverEvent {
  time: number;
  position: number;
  x: number;
  y: number;
}

export interface ThumbnailPreviewEvent {
  thumbnail: Thumbnail | null;
  position: { x: number; y: number };
  visible: boolean;
}

export type ThumbnailEventType = 'timelineHover' | 'thumbnailRequest' | 'thumbnailDisplay';

export interface ThumbnailEventMap {
  timelineHover: TimelineHoverEvent;
  thumbnailRequest: { time: number };
  thumbnailDisplay: ThumbnailPreviewEvent;
}

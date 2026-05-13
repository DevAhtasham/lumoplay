import type { Thumbnail } from '../types/thumbnails';
import { ThumbnailCalculations } from '../utils/calculations';

export class WebVTTParser {
  /**
   * Parse WebVTT content and extract thumbnails
   */
  parse(vttContent: string, baseUrl: string): Thumbnail[] {
    const thumbnails: Thumbnail[] = [];
    const lines = vttContent.split('\n');
    
    let currentThumbnail: Partial<Thumbnail> | null = null;
    let inCueBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and WEBVTT header
      if (!line || line === 'WEBVTT') {
        continue;
      }
      
      // Check if line is a time cue (start --> end)
      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
        
        if (timeMatch) {
          // Save previous thumbnail if exists
          if (currentThumbnail && currentThumbnail.url) {
            thumbnails.push(currentThumbnail as Thumbnail);
          }
          
          // Start new thumbnail
          currentThumbnail = {
            time: this.parseTime(timeMatch[1]),
            url: '',
            x: 0,
            y: 0,
            width: 0,
            height: 0
          };
          
          inCueBlock = true;
        }
        continue;
      }
      
      // Check if line contains thumbnail coordinates
      if (inCueBlock && currentThumbnail && line.includes('#xywh=')) {
        const coords = ThumbnailCalculations.parseWebVTTCoordinates(line);
        
        if (coords) {
          // Resolve relative URL if needed
          currentThumbnail.url = this.resolveUrl(coords.url, baseUrl);
          currentThumbnail.x = coords.x;
          currentThumbnail.y = coords.y;
          currentThumbnail.width = coords.width;
          currentThumbnail.height = coords.height;
        }
        
        inCueBlock = false;
      }
    }
    
    // Add last thumbnail if exists
    if (currentThumbnail && currentThumbnail.url) {
      thumbnails.push(currentThumbnail as Thumbnail);
    }
    
    return thumbnails;
  }
  
  /**
   * Parse time string to seconds
   */
  private parseTime(timeString: string): number {
    const parts = timeString.split(':');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid time format: ${timeString}`);
    }
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  /**
   * Resolve URL relative to base URL
   */
  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    
    // Remove filename from baseUrl to get directory
    const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
    return baseDir + url;
  }
  
  /**
   * Validate WebVTT content format
   */
  validate(vttContent: string): { valid: boolean; error?: string } {
    if (!vttContent || typeof vttContent !== 'string') {
      return { valid: false, error: 'Invalid VTT content' };
    }
    
    if (!vttContent.startsWith('WEBVTT')) {
      return { valid: false, error: 'Missing WEBVTT header' };
    }
    
    const lines = vttContent.split('\n');
    let hasCues = false;
    
    for (const line of lines) {
      if (line.includes('-->')) {
        hasCues = true;
        break;
      }
    }
    
    if (!hasCues) {
      return { valid: false, error: 'No time cues found' };
    }
    
    return { valid: true };
  }
  
  /**
   * Extract metadata from WebVTT content
   */
  extractMetadata(vttContent: string): {
    thumbnailCount: number;
    duration: number;
    firstThumbnailTime: number;
    lastThumbnailTime: number;
  } {
    const thumbnails = this.parse(vttContent, '');
    
    if (thumbnails.length === 0) {
      return {
        thumbnailCount: 0,
        duration: 0,
        firstThumbnailTime: 0,
        lastThumbnailTime: 0
      };
    }
    
    const times = thumbnails.map(t => t.time).sort((a, b) => a - b);
    
    return {
      thumbnailCount: thumbnails.length,
      duration: times[times.length - 1] - times[0],
      firstThumbnailTime: times[0],
      lastThumbnailTime: times[times.length - 1]
    };
  }
}

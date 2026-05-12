const STORAGE_PREFIX = 'lumoplay_';

export class Storage {
  static setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue ?? null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

export function savePlaybackPosition(videoId: string, time: number): void {
  Storage.setItem(`position_${videoId}`, time);
}

export function getPlaybackPosition(videoId: string): number | null {
  return Storage.getItem<number>(`position_${videoId}`);
}

export function saveVolume(volume: number): void {
  Storage.setItem('volume', volume);
}

export function getVolume(): number | null {
  return Storage.getItem<number>('volume', 1);
}

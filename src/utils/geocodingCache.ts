interface CacheEntry {
  data: any;
  timestamp: number;
}

class GeocodingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60;
  private readonly MAX_CACHE_SIZE = 50;
  private readonly DISTANCE_THRESHOLD = 0.0001;

  private generateKey(latitude: number, longitude: number): string {
    const roundedLat = Math.round(latitude * 10000) / 10000;
    const roundedLng = Math.round(longitude * 10000) / 10000;
    return `${roundedLat},${roundedLng}`;
  }

  get(latitude: number, longitude: number): any | null {
    const key = this.generateKey(latitude, longitude);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(latitude: number, longitude: number, data: any): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const key = this.generateKey(latitude, longitude);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      cacheDurationMs: this.CACHE_DURATION,
    };
  }
}

export const geocodingCache = new GeocodingCache();

setInterval(() => {
  geocodingCache.cleanup();
}, 1000 * 60 * 10);

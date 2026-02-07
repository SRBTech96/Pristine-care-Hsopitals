/**
 * Intelligent caching layer for API requests
 * Implements memoization, deduplication, and TTL-based cache invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface PendingRequest {
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval every 5 minutes
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Get from cache or execute the fetch function
   * Deduplicates concurrent requests for the same key
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default TTL
  ): Promise<T> {
    // Check if data is in cache and not expired
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise;
    }

    // Create new request
    let resolve: (value: any) => void;
    let reject: (error: any) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.pendingRequests.set(key, { promise, resolve: resolve!, reject: reject! });

    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      this.pendingRequests.delete(key);
      resolve!(data);
      return data;
    } catch (error) {
      this.pendingRequests.delete(key);
      reject!(error);
      throw error;
    }
  }

  /**
   * Set cache data
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate multiple cache entries by pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache stats (for monitoring)
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      totalMemory: this.getCacheMemory(),
    };
  }

  /**
   * Estimate cache memory usage
   */
  private getCacheMemory(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry.data).length;
    }
    return totalSize;
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Clear cache on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    apiCache.destroy();
  });
}

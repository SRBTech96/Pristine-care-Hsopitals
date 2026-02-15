/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and other performance metrics
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint (milliseconds)
  fid?: number; // First Input Delay (milliseconds)
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte (milliseconds)
  fcp?: number; // First Contentful Paint (milliseconds)

  // Additional metrics
  pageLoadTime?: number;
  networkLatency?: number;
  apiResponseTimes?: Record<string, number>;
  memoryUsage?: number;
  fps?: number; // Average Frames Per Second
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private apiTimings: Map<string, number[]> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeWebVitals();
      this.initializeNavigationTiming();
      this.setupPeriodicReporting();
    }
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    // LCP - Largest Contentful Paint
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        console.debug("LCP observer not supported");
      }

      // CLS - Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              this.metrics.cls = (this.metrics.cls || 0) + (entry as any).value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (e) {
        console.debug("CLS observer not supported");
      }

      // FCP - First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            this.metrics.fcp = Math.round(entries[entries.length - 1].startTime);
          }
        });
        fcpObserver.observe({ entryTypes: ["paint"] });
      } catch (e) {
        console.debug("FCP observer not supported");
      }
    }

    // FID - First Input Delay (or use INP - Interaction to Next Paint instead)
    if ("PerformanceObserver" in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.fid = Math.round((entry as any).processingDuration);
            break; // Only track first interaction
          }
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch (e) {
        console.debug("FID observer not supported");
      }
    }
  }

  /**
   * Initialize navigation timing metrics
   */
  private initializeNavigationTiming(): void {
    if ("performance" in window && "navigation" in window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime =
        perfData.loadEventEnd - perfData.navigationStart;
      const ttfb = perfData.responseStart - perfData.navigationStart;

      this.metrics.pageLoadTime = pageLoadTime;
      this.metrics.ttfb = ttfb;

      // Network latency estimate
      const networkLatency = perfData.responseEnd - perfData.fetchStart;
      this.metrics.networkLatency = networkLatency;
    }
  }

  /**
   * Track API response time
   */
  trackApiCall(endpoint: string, duration: number): void {
    if (!this.enabled) return;

    if (!this.apiTimings.has(endpoint)) {
      this.apiTimings.set(endpoint, []);
    }
    this.apiTimings.get(endpoint)!.push(duration);
  }

  /**
   * Get average API response time
   */
  getAverageApiTime(endpoint?: string): number {
    if (endpoint) {
      const times = this.apiTimings.get(endpoint) || [];
      if (times.length === 0) return 0;
      return times.reduce((a, b) => a + b) / times.length;
    }

    let totalTime = 0;
    let totalCount = 0;

    for (const times of this.apiTimings.values()) {
      totalTime += times.reduce((a, b) => a + b, 0);
      totalCount += times.length;
    }

    return totalCount === 0 ? 0 : totalTime / totalCount;
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics {
    // Add API timings
    const apiResponseTimes: Record<string, number> = {};
    for (const [endpoint, times] of this.apiTimings.entries()) {
      if (times.length > 0) {
        apiResponseTimes[endpoint] = times.reduce((a, b) => a + b) / times.length;
      }
    }

    return {
      ...this.metrics,
      apiResponseTimes,
    };
  }

  /**
   * Report metrics (send to analytics)
   */
  async reportMetrics(endpoint: string = "https://analytics.pristinehospital.com"): Promise<void> {
    if (!this.enabled) return;

    try {
      const metrics = this.getMetrics();
      
      // Filter out undefined values
      const reportData = Object.entries(metrics).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // Use sendBeacon for reliability (won't be blocked if page unloads)
      if ("sendBeacon" in navigator) {
        navigator.sendBeacon(endpoint, JSON.stringify(reportData));
      } else {
        // Fallback to fetch
        await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(reportData),
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        });
      }
    } catch (error) {
      console.debug("Failed to report metrics:", error);
    }
  }

  /**
   * Report metrics periodically
   */
  private setupPeriodicReporting(): void {
    // Report every 5 minutes
    setInterval(() => {
      this.reportMetrics();
    }, 5 * 60 * 1000);

    // Report on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.reportMetrics();
      });
    }
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear all metrics
   */
  reset(): void {
    this.metrics = {};
    this.apiTimings.clear();
  }

  /**
   * Get performance summary for debugging
   */
  getSummary(): string {
    const metrics = this.getMetrics();
    return `
      Performance Metrics:
      - LCP: ${metrics.lcp}ms
      - FCP: ${metrics.fcp}ms
      - CLS: ${metrics.cls?.toFixed(3)}
      - TTFB: ${metrics.ttfb}ms
      - Page Load: ${metrics.pageLoadTime}ms
      - Network Latency: ${metrics.networkLatency}ms
      - Avg API Response: ${this.getAverageApiTime().toFixed(0)}ms
    `.trim();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Log summary in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      console.log(performanceMonitor.getSummary());
    }, 3000); // Wait 3 seconds, then log
  });
}

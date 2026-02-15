/**
 * Core Web Vitals Monitoring Script
 * Can be embedded in Next.js Script component for non-blocking performance tracking
 */

export function setupWebVitalsMonitoring() {
  /**
   * Report Web Vitals to analytics
   */
  function reportWebVitals(metric: any) {
    // Only send in production
    if (process.env.NODE_ENV !== "production") {
      console.debug("Web Vital", metric.name, metric.value);
      return;
    }

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value.toFixed(3),
      rating: metric.rating,
      delta: metric.delta.toFixed(3),
      id: metric.id,
      navigation_type: metric.navigationTiming?.type,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/web-vitals",
        body
      );
    }
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  function observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;

        reportWebVitals({
          name: "LCP",
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: getRating("LCP", lastEntry.renderTime || lastEntry.loadTime),
          delta: lastEntry.renderTime || lastEntry.loadTime,
          id: `lcp-${Date.now()}`,
        });
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.debug("LCP observer not supported");
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  function observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          reportWebVitals({
            name: "FID",
            value: (entry as any).processingDuration,
            rating: getRating("FID", (entry as any).processingDuration),
            delta: (entry as any).processingDuration,
            id: `fid-${Date.now()}`,
          });
        });
      });

      observer.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.debug("FID observer not supported");
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  function observeCLS() {
    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;

            reportWebVitals({
              name: "CLS",
              value: clsValue,
              rating: getRating("CLS", clsValue),
              delta: (entry as any).value,
              id: `cls-${Date.now()}`,
            });
          }
        }
      });

      observer.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.debug("CLS observer not supported");
    }
  }

  /**
   * Get rating (good, needs improvement, poor)
   */
  function getRating(
    metric: "LCP" | "FID" | "CLS",
    value: number
  ): "good" | "needs-improvement" | "poor" {
    switch (metric) {
      case "LCP":
        return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
      case "FID":
        return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
      case "CLS":
        return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
      default:
        return "good";
    }
  }

  // Setup observers when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observeLCP();
      observeFID();
      observeCLS();
    });
  } else {
    observeLCP();
    observeFID();
    observeCLS();
  }

  // Also report on page unload for CLS finalization
  window.addEventListener("beforeunload", () => {
    // Final metrics will be sent via sendBeacon
  });
}

// Auto-initialize if not already done
if (typeof window !== "undefined") {
  (window as any).__PRISTINE_VITALS_SETUP__ = setupWebVitalsMonitoring;
}

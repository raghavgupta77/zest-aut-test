/**
 * Performance Optimization Service
 * 
 * Comprehensive performance optimization system that provides:
 * - Code splitting and lazy loading utilities
 * - Caching for static assets and API responses
 * - Performance monitoring and metrics collection
 * - Loading state management
 * - Bundle size optimization
 * - Memory leak prevention
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface CacheConfig {
  enableApiCache: boolean;
  enableAssetCache: boolean;
  apiCacheTTL: number; // in milliseconds
  assetCacheTTL: number;
  maxCacheSize: number; // in MB
  cacheStrategy: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  error?: string;
}

export class PerformanceService {
  private cacheConfig: CacheConfig;
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private performanceObserver?: PerformanceObserver;
  private loadingStates = new Map<string, LoadingState>();
  private loadingStateListeners = new Map<string, Set<(state: LoadingState) => void>>();

  constructor(cacheConfig: Partial<CacheConfig> = {}) {
    this.cacheConfig = {
      enableApiCache: true,
      enableAssetCache: true,
      apiCacheTTL: 300000, // 5 minutes
      assetCacheTTL: 3600000, // 1 hour
      maxCacheSize: 50, // 50MB
      cacheStrategy: 'memory',
      ...cacheConfig
    };

    this.initializePerformanceMonitoring();
    this.setupCacheCleanup();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    try {
      // Monitor navigation timing
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  /**
   * Handle performance entry
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'paint':
        this.handlePaintEntry(entry as PerformancePaintTiming);
        break;
      case 'largest-contentful-paint':
        this.handleLCPEntry(entry as any);
        break;
      case 'first-input':
        this.handleFIDEntry(entry as any);
        break;
      case 'layout-shift':
        this.handleCLSEntry(entry as any);
        break;
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): Partial<PerformanceMetrics> {
    if (typeof window === 'undefined' || !window.performance) {
      return {};
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const metrics: Partial<PerformanceMetrics> = {};

    if (navigation) {
      metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    }

    paint.forEach((entry) => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    return metrics;
  }

  /**
   * Cache API response
   */
  cacheApiResponse(key: string, data: any, customTTL?: number): void {
    if (!this.cacheConfig.enableApiCache) {
      return;
    }

    const ttl = customTTL || this.cacheConfig.apiCacheTTL;
    this.setCache(key, data, ttl);
  }

  /**
   * Get cached API response
   */
  getCachedApiResponse<T>(key: string): T | null {
    if (!this.cacheConfig.enableApiCache) {
      return null;
    }

    return this.getCache<T>(key);
  }

  /**
   * Cache static asset
   */
  cacheAsset(key: string, data: any, customTTL?: number): void {
    if (!this.cacheConfig.enableAssetCache) {
      return;
    }

    const ttl = customTTL || this.cacheConfig.assetCacheTTL;
    this.setCache(key, data, ttl);
  }

  /**
   * Get cached asset
   */
  getCachedAsset<T>(key: string): T | null {
    if (!this.cacheConfig.enableAssetCache) {
      return null;
    }

    return this.getCache<T>(key);
  }

  /**
   * Set loading state
   */
  setLoadingState(key: string, state: LoadingState): void {
    this.loadingStates.set(key, state);
    this.notifyLoadingStateListeners(key, state);
  }

  /**
   * Get loading state
   */
  getLoadingState(key: string): LoadingState | null {
    return this.loadingStates.get(key) || null;
  }

  /**
   * Subscribe to loading state changes
   */
  subscribeToLoadingState(key: string, listener: (state: LoadingState) => void): () => void {
    if (!this.loadingStateListeners.has(key)) {
      this.loadingStateListeners.set(key, new Set());
    }
    
    this.loadingStateListeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.loadingStateListeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.loadingStateListeners.delete(key);
        }
      }
    };
  }

  /**
   * Clear loading state
   */
  clearLoadingState(key: string): void {
    this.loadingStates.delete(key);
    this.notifyLoadingStateListeners(key, { isLoading: false });
  }

  /**
   * Preload component
   */
  async preloadComponent(importFunction: () => Promise<any>): Promise<any> {
    try {
      const startTime = performance.now();
      const component = await importFunction();
      const loadTime = performance.now() - startTime;
      
      // Log preload performance
      console.debug(`Component preloaded in ${loadTime.toFixed(2)}ms`);
      
      return component;
    } catch (error) {
      console.error('Component preload failed:', error);
      throw error;
    }
  }

  /**
   * Lazy load component with loading state
   */
  lazyLoadComponent(
    importFunction: () => Promise<any>,
    loadingKey: string,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<React.ComponentType<any>> {
    return React.lazy(async () => {
      this.setLoadingState(loadingKey, { isLoading: true, loadingText: 'Loading component...' });
      
      try {
        const startTime = performance.now();
        const component = await importFunction();
        const loadTime = performance.now() - startTime;
        
        // Log load performance
        console.debug(`Component loaded in ${loadTime.toFixed(2)}ms`);
        
        this.clearLoadingState(loadingKey);
        return component;
      } catch (error) {
        this.setLoadingState(loadingKey, { 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to load component' 
        });
        throw error;
      }
    });
  }

  /**
   * Optimize image loading
   */
  optimizeImageLoading(imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    lazy?: boolean;
  } = {}): string {
    const { width, height, quality = 80, format = 'webp', lazy = true } = options;
    
    // This would typically integrate with an image optimization service
    // For now, return the original URL with query parameters
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format !== 'webp') params.set('f', format);
    if (lazy) params.set('lazy', 'true');
    
    const queryString = params.toString();
    return queryString ? `${imageUrl}?${queryString}` : imageUrl;
  }

  /**
   * Measure function performance
   */
  measurePerformance<T>(
    name: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> {
    const startTime = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then((value) => {
        const endTime = performance.now();
        console.debug(`${name} completed in ${(endTime - startTime).toFixed(2)}ms`);
        return value;
      }).catch((error) => {
        const endTime = performance.now();
        console.debug(`${name} failed in ${(endTime - startTime).toFixed(2)}ms`);
        throw error;
      });
    } else {
      const endTime = performance.now();
      console.debug(`${name} completed in ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    }
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.memoryCache.clear();
    
    if (this.cacheConfig.cacheStrategy === 'localStorage') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('perf_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } else if (this.cacheConfig.cacheStrategy === 'sessionStorage') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('perf_cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    memoryCache: { size: number; entries: number };
    estimatedSize: number;
  } {
    const memoryCacheSize = this.estimateMemoryCacheSize();
    
    return {
      memoryCache: {
        size: memoryCacheSize,
        entries: this.memoryCache.size
      },
      estimatedSize: memoryCacheSize
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    this.clearAllCaches();
    this.loadingStates.clear();
    this.loadingStateListeners.clear();
  }

  // Private methods

  private setCache(key: string, data: any, ttl: number): void {
    const cacheKey = `perf_cache_${key}`;
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };

    switch (this.cacheConfig.cacheStrategy) {
      case 'memory':
        this.memoryCache.set(cacheKey, cacheEntry);
        break;
      case 'localStorage':
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        } catch (error) {
          console.warn('Failed to cache to localStorage:', error);
        }
        break;
      case 'sessionStorage':
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        } catch (error) {
          console.warn('Failed to cache to sessionStorage:', error);
        }
        break;
    }
  }

  private getCache<T>(key: string): T | null {
    const cacheKey = `perf_cache_${key}`;
    let cacheEntry: { data: any; timestamp: number; ttl: number } | null = null;

    switch (this.cacheConfig.cacheStrategy) {
      case 'memory':
        cacheEntry = this.memoryCache.get(cacheKey) || null;
        break;
      case 'localStorage':
        try {
          const stored = localStorage.getItem(cacheKey);
          cacheEntry = stored ? JSON.parse(stored) : null;
        } catch (error) {
          console.warn('Failed to read from localStorage cache:', error);
        }
        break;
      case 'sessionStorage':
        try {
          const stored = sessionStorage.getItem(cacheKey);
          cacheEntry = stored ? JSON.parse(stored) : null;
        } catch (error) {
          console.warn('Failed to read from sessionStorage cache:', error);
        }
        break;
    }

    if (!cacheEntry) {
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now - cacheEntry.timestamp > cacheEntry.ttl) {
      this.removeFromCache(cacheKey);
      return null;
    }

    return cacheEntry.data as T;
  }

  private removeFromCache(cacheKey: string): void {
    switch (this.cacheConfig.cacheStrategy) {
      case 'memory':
        this.memoryCache.delete(cacheKey);
        break;
      case 'localStorage':
        localStorage.removeItem(cacheKey);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(cacheKey);
        break;
    }
  }

  private setupCacheCleanup(): void {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 300000);
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage cache
    if (this.cacheConfig.cacheStrategy === 'localStorage') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('perf_cache_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const entry = JSON.parse(stored);
              if (now - entry.timestamp > entry.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });
    }

    // Clean sessionStorage cache
    if (this.cacheConfig.cacheStrategy === 'sessionStorage') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('perf_cache_')) {
          try {
            const stored = sessionStorage.getItem(key);
            if (stored) {
              const entry = JSON.parse(stored);
              if (now - entry.timestamp > entry.ttl) {
                sessionStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted entries
            sessionStorage.removeItem(key);
          }
        }
      });
    }
  }

  private estimateMemoryCacheSize(): number {
    let size = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      size += key.length * 2; // Approximate string size
      size += JSON.stringify(entry).length * 2; // Approximate object size
    }
    return size;
  }

  private notifyLoadingStateListeners(key: string, state: LoadingState): void {
    const listeners = this.loadingStateListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          console.error('Error in loading state listener:', error);
        }
      });
    }
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = {
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
      timeToInteractive: entry.domInteractive - entry.fetchStart
    };
    
    console.debug('Navigation metrics:', metrics);
  }

  private handlePaintEntry(entry: PerformancePaintTiming): void {
    console.debug(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
  }

  private handleLCPEntry(entry: any): void {
    console.debug(`Largest Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
  }

  private handleFIDEntry(entry: any): void {
    console.debug(`First Input Delay: ${entry.processingStart - entry.startTime}ms`);
  }

  private handleCLSEntry(entry: any): void {
    if (!entry.hadRecentInput) {
      console.debug(`Cumulative Layout Shift: ${entry.value}`);
    }
  }
}

// React import for lazy loading
import React from 'react';

export default PerformanceService;
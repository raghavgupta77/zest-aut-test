/**
 * usePerformance Hook
 * 
 * React hook for performance optimization with:
 * - Loading state management
 * - Caching utilities
 * - Performance monitoring
 * - Lazy loading helpers
 * - Memory leak prevention
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import PerformanceService from '../services/performanceService';
import type { LoadingState, PerformanceMetrics } from '../services/performanceService';

// Global performance service instance
let performanceService: PerformanceService | null = null;

// Initialize performance service
export const initializePerformance = (config?: {
  enableApiCache?: boolean;
  enableAssetCache?: boolean;
  apiCacheTTL?: number;
  assetCacheTTL?: number;
  maxCacheSize?: number;
  cacheStrategy?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
}) => {
  if (!performanceService) {
    performanceService = new PerformanceService(config);
  }
  return performanceService;
};

export interface UsePerformanceOptions {
  enableCaching?: boolean;
  enableLoadingStates?: boolean;
  enableMetrics?: boolean;
}

export const usePerformance = (options: UsePerformanceOptions = {}) => {
  const {
    enableCaching = true,
    enableLoadingStates = true,
    enableMetrics = true
  } = options;

  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update performance metrics
  const updateMetrics = useCallback(() => {
    if (!performanceService || !enableMetrics || !mountedRef.current) {
      return;
    }

    const currentMetrics = performanceService.getPerformanceMetrics();
    setMetrics(currentMetrics);
  }, [enableMetrics]);

  // Update metrics on mount and periodically
  useEffect(() => {
    if (enableMetrics) {
      updateMetrics();
      
      // Update metrics every 5 seconds
      const interval = setInterval(updateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [enableMetrics, updateMetrics]);

  // Cache API response
  const cacheApiResponse = useCallback((key: string, data: any, ttl?: number) => {
    if (!performanceService || !enableCaching) {
      return;
    }
    performanceService.cacheApiResponse(key, data, ttl);
  }, [enableCaching]);

  // Get cached API response
  const getCachedApiResponse = useCallback(<T>(key: string): T | null => {
    if (!performanceService || !enableCaching) {
      return null;
    }
    return performanceService.getCachedApiResponse<T>(key);
  }, [enableCaching]);

  // Cache asset
  const cacheAsset = useCallback((key: string, data: any, ttl?: number) => {
    if (!performanceService || !enableCaching) {
      return;
    }
    performanceService.cacheAsset(key, data, ttl);
  }, [enableCaching]);

  // Get cached asset
  const getCachedAsset = useCallback(<T>(key: string): T | null => {
    if (!performanceService || !enableCaching) {
      return null;
    }
    return performanceService.getCachedAsset<T>(key);
  }, [enableCaching]);

  // Execute with caching
  const executeWithCache = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    if (!performanceService || !enableCaching) {
      return await operation();
    }

    // Check cache first
    const cached = performanceService.getCachedApiResponse<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute operation and cache result
    const result = await operation();
    performanceService.cacheApiResponse(key, result, ttl);
    return result;
  }, [enableCaching]);

  // Measure performance of operation
  const measurePerformance = useCallback(<T>(
    name: string,
    operation: () => T | Promise<T>
  ): T | Promise<T> => {
    if (!performanceService) {
      return operation();
    }
    return performanceService.measurePerformance(name, operation);
  }, []);

  // Debounce function
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    if (!performanceService) {
      return func;
    }
    return performanceService.debounce(func, delay);
  }, []);

  // Throttle function
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    if (!performanceService) {
      return func;
    }
    return performanceService.throttle(func, delay);
  }, []);

  // Optimize image loading
  const optimizeImage = useCallback((imageUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    lazy?: boolean;
  }): string => {
    if (!performanceService) {
      return imageUrl;
    }
    return performanceService.optimizeImageLoading(imageUrl, options);
  }, []);

  // Preload component
  const preloadComponent = useCallback(async (importFunction: () => Promise<any>): Promise<any> => {
    if (!performanceService) {
      return await importFunction();
    }
    return await performanceService.preloadComponent(importFunction);
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    if (!performanceService) {
      return null;
    }
    return performanceService.getCacheStatistics();
  }, []);

  // Clear all caches
  const clearCaches = useCallback(() => {
    if (performanceService) {
      performanceService.clearAllCaches();
    }
  }, []);

  return {
    // Metrics
    metrics,
    updateMetrics,
    
    // Caching
    cacheApiResponse,
    getCachedApiResponse,
    cacheAsset,
    getCachedAsset,
    executeWithCache,
    getCacheStats,
    clearCaches,
    
    // Performance utilities
    measurePerformance,
    debounce,
    throttle,
    optimizeImage,
    preloadComponent,
    
    // Service availability
    isAvailable: !!performanceService
  };
};

// Hook for loading state management
export const useLoadingState = (key: string) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!performanceService) {
      return;
    }

    // Get initial state
    const initialState = performanceService.getLoadingState(key);
    if (initialState && mountedRef.current) {
      setLoadingState(initialState);
    }

    // Subscribe to changes
    const unsubscribe = performanceService.subscribeToLoadingState(key, (state) => {
      if (mountedRef.current) {
        setLoadingState(state);
      }
    });

    return unsubscribe;
  }, [key]);

  const setLoading = useCallback((state: LoadingState) => {
    if (performanceService) {
      performanceService.setLoadingState(key, state);
    }
  }, [key]);

  const clearLoading = useCallback(() => {
    if (performanceService) {
      performanceService.clearLoadingState(key);
    }
  }, [key]);

  const startLoading = useCallback((text?: string, progress?: number) => {
    setLoading({ isLoading: true, loadingText: text, progress });
  }, [setLoading]);

  const stopLoading = useCallback(() => {
    setLoading({ isLoading: false });
  }, [setLoading]);

  const setError = useCallback((error: string) => {
    setLoading({ isLoading: false, error });
  }, [setLoading]);

  const setProgress = useCallback((progress: number, text?: string) => {
    setLoading({ isLoading: true, progress, loadingText: text });
  }, [setLoading]);

  return {
    ...loadingState,
    setLoading,
    clearLoading,
    startLoading,
    stopLoading,
    setError,
    setProgress
  };
};

// Hook for lazy component loading
export const useLazyComponent = (
  importFunction: () => Promise<any>,
  loadingKey: string
) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, startLoading, stopLoading, setError: setLoadingError } = useLoadingState(loadingKey);

  const loadComponent = useCallback(async () => {
    if (Component) {
      return; // Already loaded
    }

    try {
      startLoading('Loading component...');
      const loadedComponent = await importFunction();
      setComponent(() => loadedComponent.default || loadedComponent);
      stopLoading();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load component';
      setError(errorMessage);
      setLoadingError(errorMessage);
    }
  }, [Component, importFunction, startLoading, stopLoading, setLoadingError]);

  // Auto-load on mount
  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  return {
    Component,
    isLoading,
    error,
    reload: loadComponent
  };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    if (!performanceService) {
      return;
    }

    setIsMonitoring(true);
    
    const updateMetrics = () => {
      const currentMetrics = performanceService!.getPerformanceMetrics();
      setMetrics(currentMetrics);
    };

    // Initial update
    updateMetrics();

    // Update every second while monitoring
    const interval = setInterval(updateMetrics, 1000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
};

export default usePerformance;
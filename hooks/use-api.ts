import useSWR, { SWRConfiguration, mutate } from 'swr';
import { CacheManager } from '@/lib/performance';

// Create a cache manager instance
const cacheManager = new CacheManager(300); // 5 minutes TTL

// Default fetcher with error handling
const defaultFetcher = async (url: string) => {
  // Check cache first
  const cached = cacheManager.get(url);
  if (cached) {
    return cached;
  }
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await res.json().catch(() => ({ message: 'Unknown error' }));
    const httpError = new Error('An error occurred while fetching the data.') as Error & { info?: unknown; status?: number };
    httpError.info = info;
    httpError.status = res.status;
    throw error;
  }
  
  const data = await res.json();
  
  // Cache the successful response
  cacheManager.set(url, data);
  
  return data;
};

// Custom SWR configuration
const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  onError: (error) => {
    console.error('SWR Error:', error);
  },
};

// Generic API hook
export function useApi<T = any>(
  endpoint: string | null,
  options?: SWRConfiguration
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    endpoint,
    defaultFetcher,
    {
      ...swrConfig,
      ...options,
    }
  );
  
  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isError: !!error,
  };
}

// Time entries hook
export function useTimeEntries(filters?: {
  clientId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  
  const endpoint = `/api/v1/time-entries${params.toString() ? `?${params}` : ''}`;
  
  return useApi<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(endpoint);
}

// Clients hook
export function useClients(options?: {
  search?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  
  const endpoint = `/api/v1/clients${params.toString() ? `?${params}` : ''}`;
  
  return useApi<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stats: {
      totalClients: number;
      activeClients: number;
      totalRevenue: number;
      totalOutstanding: number;
      averageRate: number;
    };
  }>(endpoint);
}

// Mutation helper for POST requests
export async function postApi<T = any>(
  endpoint: string,
  data: any
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const httpError = new Error('Request failed') as Error & { status?: number };
    httpError.status = response.status;
    throw httpError;
  }
  
  const result = await response.json();
  
  // Clear cache for related endpoints
  cacheManager.clear();
  
  // Revalidate SWR cache
  mutate(endpoint);
  
  return result;
}

// Mutation helper for PUT requests
export async function putApi<T = any>(
  endpoint: string,
  data: any
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const httpError = new Error('Request failed') as Error & { status?: number };
    httpError.status = response.status;
    throw httpError;
  }
  
  const result = await response.json();
  
  // Clear cache for related endpoints
  cacheManager.clear();
  
  // Revalidate SWR cache
  mutate(endpoint);
  
  return result;
}

// Mutation helper for DELETE requests
export async function deleteApi<T = any>(
  endpoint: string
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const httpError = new Error('Request failed') as Error & { status?: number };
    httpError.status = response.status;
    throw httpError;
  }
  
  const result = await response.json();
  
  // Clear cache for related endpoints
  cacheManager.clear();
  
  // Revalidate SWR cache
  mutate(endpoint);
  
  return result;
}

// Optimistic update helper
export function optimisticUpdate<T>(
  endpoint: string,
  updater: (data: T) => T
) {
  mutate(
    endpoint,
    async (current?: T) => {
      if (!current) return current;
      const updated = updater(current);
      return updated;
    },
    false // Don't revalidate immediately
  );
}

// Prefetch data for better UX
export async function prefetchData(endpoint: string) {
  try {
    const data = await defaultFetcher(endpoint);
    // Pre-populate SWR cache
    mutate(endpoint, data, false);
  } catch (error) {
    console.error('Prefetch error:', error);
  }
}

// Batch fetch multiple endpoints
export async function batchFetch(endpoints: string[]) {
  const promises = endpoints.map(endpoint => prefetchData(endpoint));
  await Promise.allSettled(promises);
}

// Clear all caches
export function clearAllCaches() {
  cacheManager.clear();
  // Clear SWR cache
  mutate(() => true, undefined, { revalidate: false });
}



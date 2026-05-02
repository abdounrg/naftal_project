import { useState, useEffect, useCallback } from 'react';

interface UseApiDataOptions {
  fetchFn: (params?: Record<string, unknown>) => Promise<{ data: { data: unknown; meta?: unknown } }>;
  autoFetch?: boolean;
}

// Flatten nested objects so DataTable columns can access them as flat keys
function flattenRow(row: Record<string, unknown>): Record<string, unknown> {
  const flat: Record<string, unknown> = { ...row };
  // Flatten _count: { stations: 5, users: 2 } → _count_stations: 5, _count_users: 2
  if (row._count && typeof row._count === 'object' && !Array.isArray(row._count)) {
    for (const [subKey, subVal] of Object.entries(row._count as Record<string, unknown>)) {
      flat[`_count_${subKey}`] = subVal;
    }
  }
  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'meta' && key !== '_count') {
      const obj = value as Record<string, unknown>;
      if ('name' in obj) {
        // Objects with name: replace the key with the name string
        flat[key] = obj.name;
        flat[key + '_name'] = obj.name;
      }
      // Pull up all primitive fields from nested objects (e.g. tpe.serial → serial)
      for (const [subKey, subVal] of Object.entries(obj)) {
        if (subVal === null || subVal === undefined || typeof subVal !== 'object') {
          // Only set if not already present at top level (don't overwrite own fields)
          if (!(subKey in row)) flat[subKey] = subVal;
        } else if (typeof subVal === 'object' && !Array.isArray(subVal)) {
          const subObj = subVal as Record<string, unknown>;
          if ('name' in subObj) {
            flat[subKey] = subObj.name;
            flat[subKey + '_name'] = subObj.name;
            // One more level deep
            for (const [deepKey, deepVal] of Object.entries(subObj)) {
              if (deepVal === null || deepVal === undefined || typeof deepVal !== 'object') {
                if (!(deepKey in row) && !(deepKey in flat)) flat[deepKey] = deepVal;
              } else if (typeof deepVal === 'object' && !Array.isArray(deepVal)) {
                const deepObj = deepVal as Record<string, unknown>;
                if ('name' in deepObj) {
                  flat[deepKey] = deepObj.name;
                  flat[deepKey + '_name'] = deepObj.name;
                }
              }
            }
          }
        }
      }
    }
  }
  return flat;
}

export function useApiData<T>({ fetchFn, autoFetch = true }: UseApiDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn(params);
      const result = response.data.data;
      const arr = Array.isArray(result) ? result : [];
      setData(arr.map((item: any) => flattenRow(item)) as T[]);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  return { data, loading, error, refetch: fetch, setData };
}

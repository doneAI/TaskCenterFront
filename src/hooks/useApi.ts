import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  apiCall: () => Promise<T>;
  dependencies?: any[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useApi = <T>({
  apiCall,
  dependencies = [],
  autoRefresh = false,
  refreshInterval = 30000,
}: UseApiOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

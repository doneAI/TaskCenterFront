import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  interval: number;
  enabled: boolean;
  onRefresh: () => void;
}

export const useAutoRefresh = ({ 
  interval, 
  enabled, 
  onRefresh 
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(onRefresh, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, onRefresh]);
};

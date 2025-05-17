
import { useState, useEffect, useRef } from 'react';

interface RefreshOptions {
  intervalMinutes?: number;
  enabled?: boolean;
  onRefresh?: () => Promise<void>;
}

const DEFAULT_REFRESH_INTERVAL = 1; // Default 1 minute

export const useRefreshData = ({
  intervalMinutes = DEFAULT_REFRESH_INTERVAL,
  enabled = true,
  onRefresh
}: RefreshOptions) => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(intervalMinutes * 60);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const refresh = async () => {
    if (isRefreshing || !enabled) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastRefreshed(new Date());
      setTimeUntilRefresh(intervalMinutes * 60);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Update countdown timer every second
    timerRef.current = window.setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          refresh();
          return intervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    // Set main refresh interval
    intervalRef.current = window.setInterval(() => {
      refresh();
    }, intervalMinutes * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalMinutes]);

  const formatTimeUntilRefresh = () => {
    const minutes = Math.floor(timeUntilRefresh / 60);
    const seconds = timeUntilRefresh % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
    refresh,
    isRefreshing,
    lastRefreshed,
    timeUntilRefresh,
    formattedTimeUntilRefresh: formatTimeUntilRefresh()
  };
};

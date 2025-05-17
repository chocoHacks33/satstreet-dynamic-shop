
import { useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseRefreshDataProps {
  onRefresh?: () => void;
  intervalMs?: number;
}

export const useRefreshData = ({ onRefresh, intervalMs = 60000 }: UseRefreshDataProps = {}) => {
  const queryClient = useQueryClient();
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(intervalMs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet'] })
      ]);
      
      // Call the optional onRefresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsRefreshing(false);
      setTimeUntilRefresh(intervalMs);
    }
  }, [queryClient, onRefresh, intervalMs]);

  // Format the time until refresh
  const formattedTimeUntilRefresh = `${Math.floor(timeUntilRefresh / 1000)}s`;

  // Set up the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRefresh(prevTime => {
        const newTime = prevTime - 1000;
        if (newTime <= 0) {
          refreshData();
          return intervalMs;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshData, intervalMs]);

  return { refreshData, isRefreshing, formattedTimeUntilRefresh };
};

export default useRefreshData;

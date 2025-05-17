
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRefreshData = () => {
  const queryClient = useQueryClient();

  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['product'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    ]);
  }, [queryClient]);

  return { refreshData };
};

export default useRefreshData;

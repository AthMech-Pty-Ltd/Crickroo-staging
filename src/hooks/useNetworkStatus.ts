import { useEffect, useState } from 'react';
import { NetInfo } from '../utils/network';

export function useNetworkStatus(): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    NetInfo.fetch().then(state => {
      if (!mounted) return;
      setIsConnected(
        state.isConnected === true && state.isInternetReachable !== false,
      );
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(
        state.isConnected === true && state.isInternetReachable !== false,
      );
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isConnected };
}

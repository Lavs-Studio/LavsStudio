import { useEffect, useState } from 'react';

export default function useRemoteData(fetcher, fallbackValue) {
  const [data, setData] = useState(fallbackValue);
  const [isLoading, setIsLoading] = useState(Boolean(fetcher));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!fetcher) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetcher();
        if (isMounted && result !== null && result !== undefined) {
          setData(result);
        }
      } catch (err) {
        console.error('Remote data fetch error:', err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [fetcher]);

  return [data, isLoading, error, setData];
}
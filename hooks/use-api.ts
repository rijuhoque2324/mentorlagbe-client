"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Small client-side data-fetching helper for API-backed pages.
 * Every consumer gets loading, empty and error states without a data library.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [version, setVersion] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current();

        if (!active) {
          return;
        }

        setData(result);
      } catch (caught) {
        if (!active) {
          return;
        }

        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError(
                caught instanceof Error
                  ? caught.message
                  : "Something went wrong. Please try again.",
                { cause: caught },
              ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
    // The caller owns the dependency list for the fetcher.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const refetch = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  return { data, loading, error, refetch, setData };
}

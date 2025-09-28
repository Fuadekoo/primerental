"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSafeActionOptions {
  retryCount?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export default function useSafeAction<T, Args extends unknown[]>(
  func: (...args: Args) => Promise<T>,
  args: Args,
  options: UseSafeActionOptions = {}
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
  } = options;

  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const executeAction = useCallback(
    async (forceRetry = false) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);

      try {
        // Validate function
        if (!func || typeof func !== "function") {
          throw new Error("Invalid function provided to useSafeAction");
        }

        // Validate args
        if (!args || !Array.isArray(args)) {
          throw new Error("Invalid arguments provided to useSafeAction");
        }

        const result = await func(...args);

        if (isMountedRef.current) {
          setData(result);
          setRetryCount(0);
          onSuccess?.(result);
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        const error =
          err instanceof Error ? err : new Error("Unknown error occurred");
        setError(error);
        onError?.(error);

        // Retry logic
        if (retryCount < maxRetries && !forceRetry) {
          setRetryCount((prev) => prev + 1);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              executeAction();
            }
          }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [func, args, retryCount, maxRetries, retryDelay, onError, onSuccess]
  );

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    executeAction(true);
  }, [executeAction]);

  useEffect(() => {
    executeAction();
  }, [executeAction]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    retry,
    retryCount,
  };
}

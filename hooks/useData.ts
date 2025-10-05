"use client";

import { useEffect, useState, useRef } from "react";

export function useData<Args extends unknown[], Data>(
  func: (...args: Args) => Promise<Data>,
  onFinish: ((data: Data) => void) | null,
  ...args: Args
): [data: Data | undefined, isLoading: boolean, refresh: () => void] {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data>();
  const [refresh, setRefresh] = useState("");
  const onFinishRef = useRef(onFinish);
  const argsRef = useRef(args);

  // Update refs when values change
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    argsRef.current = args;
  }, [args]);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (isCancelled) return;

      setIsLoading(true);
      try {
        const result = await func(...argsRef.current);
        if (!isCancelled) {
          setData(result);
          onFinishRef.current?.(result);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("useData error:", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [func, refresh]);

  return [data, isLoading, () => setRefresh(new Date().toISOString())];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseData<T extends (...args: any) => Promise<any>> = {
  data: Awaited<ReturnType<T>> | undefined;
  isLoading: boolean;
};

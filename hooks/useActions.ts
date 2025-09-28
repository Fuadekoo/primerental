"use client";

import { startTransition, useActionState, useEffect, useCallback } from "react";

export default function useAction<
  T extends true | undefined,
  Args extends unknown[],
  Data
>(
  func: (...args: Args) => Promise<Data>,
  [isPrevFetch, onFinish]: [T, ((data: Data) => void) | undefined],
  ...args: T extends true ? Args : undefined[]
): [
  Data | undefined,
  T extends true ? () => void : (...payload: Args) => void,
  boolean
] {
  const [data, action, loading] = useActionState(
    async (prev: Data | undefined, payload: Args) => {
      try {
        if (!func || typeof func !== 'function') {
          console.error('useAction: Invalid function provided');
          return prev;
        }
        return await func(...payload);
      } catch (error) {
        console.error('useAction: Error in action:', error);
        return prev;
      }
    },
    undefined
  );

  // Memoize the action function to prevent unnecessary re-renders
  const memoizedAction = useCallback((payload: Args) => {
    try {
      if (isPrevFetch && payload && payload.length > 0) {
        startTransition(() => {
          action(payload);
        });
      }
    } catch (error) {
      console.error('useAction: Error in memoized action:', error);
    }
  }, [action, isPrevFetch]);

  useEffect(() => {
    if (isPrevFetch && args && args.length > 0) {
      try {
        startTransition(() => {
          action(args as Args);
        });
      } catch (error) {
        console.error('useAction: Error in useEffect:', error);
      }
    }
  }, [...(args || [])]);

  useEffect(() => {
    if (data && onFinish && typeof onFinish === 'function') {
      try {
        onFinish(data);
      } catch (error) {
        console.error('useAction: Error in onFinish callback:', error);
      }
    }
  }, [data, onFinish]);

  return [
    data,
    (...newArgs: Args) => {
      try {
        const payload = (isPrevFetch && newArgs.length === 0 ? args : newArgs) as Args;
        if (payload && payload.length > 0) {
          startTransition(() => {
            action(payload);
          });
        }
      } catch (error) {
        console.error('useAction: Error in return function:', error);
      }
    },
    loading,
  ];
}

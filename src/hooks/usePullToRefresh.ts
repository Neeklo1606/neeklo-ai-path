import { useRef, useCallback, useState, useEffect } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80, maxPull = 120 }: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    const el = containerRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [isRefreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || isRefreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      setPullDistance(Math.min(dy * 0.5, maxPull));
    }
  }, [isRefreshing, maxPull]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6);
      try { await onRefresh(); } catch {}
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return { containerRef, pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd };
}

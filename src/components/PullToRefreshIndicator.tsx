import { Loader2 } from "lucide-react";

interface Props {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export default function PullToRefreshIndicator({ pullDistance, isRefreshing, threshold = 80 }: Props) {
  if (pullDistance <= 0 && !isRefreshing) return null;
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = pullDistance * 3;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
      style={{ height: pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 48 : 0) : 0 }}
    >
      <div
        className="flex items-center justify-center"
        style={{ opacity: Math.max(progress, isRefreshing ? 1 : 0) }}
      >
        <Loader2
          size={22}
          className={`text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`}
          style={!isRefreshing ? { transform: `rotate(${rotation}deg)` } : undefined}
        />
      </div>
    </div>
  );
}

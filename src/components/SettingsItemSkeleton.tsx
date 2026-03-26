import { Skeleton } from "@/components/ui/skeleton";

const SettingsItemSkeleton = () => (
  <div className="game-card flex items-center gap-3">
    <Skeleton className="w-9 h-9 rounded-xl" />
    <div className="flex-1">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
    <Skeleton className="w-4 h-4 rounded" />
  </div>
);

export const SettingsSkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SettingsItemSkeleton key={i} />
    ))}
  </div>
);

export default SettingsItemSkeleton;

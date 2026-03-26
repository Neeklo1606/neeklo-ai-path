import { Skeleton } from "@/components/ui/skeleton";

const ProjectCardSkeleton = () => (
  <div className="game-card">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="w-9 h-9 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-1.5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-lg" />
      <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
  </div>
);

export const ProjectCardSkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <ProjectCardSkeleton key={i} />
    ))}
  </div>
);

export default ProjectCardSkeleton;

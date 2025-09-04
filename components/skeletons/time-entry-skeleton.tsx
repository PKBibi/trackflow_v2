import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TimeEntrySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export function TimeEntryListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TimeEntrySkeleton key={i} />
      ))}
    </div>
  );
}

export function TimeEntryTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}



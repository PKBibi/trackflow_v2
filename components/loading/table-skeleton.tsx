import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  showHeader?: boolean
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}: TableSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Table header */}
        {showHeader && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4 w-20" />
            ))}
          </div>
        )}
        
        {/* Table rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="grid gap-4 py-2" 
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-32" : colIndex === columns - 1 ? "w-16" : "w-24"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
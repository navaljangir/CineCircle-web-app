import { SeriesCard } from "./SeriesCard";
import type { Series } from "~/types/series";

interface SeriesGridProps {
  series: Series[];
  loading?: boolean;
  className?: string;
}

export function SeriesGrid({
  series,
  loading = false,
  className = "",
}: SeriesGridProps) {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No series found</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}>
      {series.map((item) => (
        <SeriesCard
          key={item.id}
          series={item}
        />
      ))}
    </div>
  );
}

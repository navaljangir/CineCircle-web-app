import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SeriesCard } from "./SeriesCard";
import type { Series } from "~/types/series";

interface VirtualizedSeriesGridProps {
  series: Series[];
  loading?: boolean;
  className?: string;
}

export function VirtualizedSeriesGrid({
  series,
  loading = false,
  className = "",
}: VirtualizedSeriesGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate number of columns based on screen width
  const getColumnCount = () => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width < 768) return 1; // md
    if (width < 1024) return 2; // lg
    if (width < 1280) return 3; // xl
    return 4; // 2xl+
  };

  const columnCount = getColumnCount();
  const rowCount = Math.ceil(series.length / columnCount);

  // Virtualizer for rows only (horizontal stays normal)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420, // Approximate height of a series card
    overscan: 2, // Render 2 extra rows for smooth scrolling
  });

  useEffect(() => {
    const handleResize = () => {
      rowVirtualizer.measure();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rowVirtualizer]);

  if (loading) {
    return (
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-video bg-muted animate-pulse rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-10 bg-muted animate-pulse rounded" />
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
    <div ref={parentRef} className={`h-full overflow-auto ${className}`}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowSeries = series.slice(startIndex, startIndex + columnCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-1">
                {rowSeries.map((seriesItem) => (
                  <SeriesCard key={seriesItem.id} series={seriesItem} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

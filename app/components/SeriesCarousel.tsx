import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { LazyImage } from "~/components/ui/lazy-image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSeriesPath } from "~/lib/seriesUtils";
import type { Series } from "~/types/series";
import { useRef } from "react";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";

interface SeriesCarouselProps {
  title: string;
  series: Series[];
  viewAllLink?: string;
}

export function SeriesCarousel({ title, series, viewAllLink }: SeriesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [carouselRef, isVisible] = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '200px',
  });

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!series || series.length === 0) {
    return null;
  }

  return (
    <section ref={carouselRef} className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <Button asChild variant="outline" size="sm">
                <Link to={viewAllLink}>View All</Link>
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={scrollLeft}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={scrollRight}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isVisible && series.map((seriesItem) => (
            <Link 
              key={seriesItem.id} 
              to={getSeriesPath(seriesItem.title)}
              className="flex-shrink-0"
            >
              <Card className="w-72 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-0">
                  {seriesItem.image_url ? (
                    <LazyImage
                      src={seriesItem.image_url}
                      alt={seriesItem.title}
                      aspectRatio="16/9"
                      containerClassName="rounded-t-lg"
                    />
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="space-y-2">
                      {seriesItem.partner_name && (
                        <Badge variant="secondary" className="text-xs">
                          {seriesItem.partner_name}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {seriesItem.title}
                      </h3>
                      {seriesItem.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {seriesItem.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

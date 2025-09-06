import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { getSeriesPath } from "~/lib/seriesUtils";
import type { FeaturedSeries as FeaturedSeriesType } from "~/types/series";

interface FeaturedSeriesProps {
  series: FeaturedSeriesType | null;
}

export function FeaturedSeries({ series }: FeaturedSeriesProps) {
  if (!series) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Series</h2>
          <p className="text-muted-foreground">
            Discover our handpicked series collection
          </p>
        </div>

        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link to={getSeriesPath(series.title)}>
            <div className="relative">
              {series.image_url && (
                <div className="aspect-video w-full">
                  <img
                    src={series.image_url}
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="space-y-2">
                  {series.partner_name && (
                    <Badge variant="secondary" className="mb-2">
                      {series.partner_name}
                    </Badge>
                  )}
                  <h3 className="text-2xl font-bold">{series.title}</h3>
                  {series.description && (
                    <p className="text-gray-200 line-clamp-2 max-w-2xl">
                      {series.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </section>
  );
}

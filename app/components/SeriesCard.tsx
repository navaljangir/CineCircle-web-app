import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { LazyImage } from "~/components/ui/lazy-image";
import { Film, Play } from "lucide-react";
import { getSeriesPath } from "~/lib/seriesUtils";
import type { Series } from "~/types/series";

interface SeriesCardProps {
  series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link to={getSeriesPath(series.title)}>
        {series.image_url ? (
          <LazyImage
            src={series.image_url}
            alt={series.title}
            aspectRatio="16/9"
            className="group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </Link>
      <CardHeader>
        <div className="space-y-2">
          {series.partner_name && (
            <Badge variant="secondary" className="text-xs">
              {series.partner_name}
            </Badge>
          )}
          <Link to={getSeriesPath(series.title)}>
            <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {series.title}
            </CardTitle>
          </Link>
          {series.description && (
            <CardDescription className="line-clamp-2">
              {series.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link to={getSeriesPath(series.title)}>
            <Play className="mr-2 h-4 w-4" />
            View Series
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

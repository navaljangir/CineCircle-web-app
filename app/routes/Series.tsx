import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link } from "react-router";
import { getFeaturedSeries, getAllSeries } from "~/services/seriesService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { LazyImage } from "~/components/ui/lazy-image";
import { VirtualizedSeriesGrid } from "~/components/VirtualizedSeriesGrid";
import { Film, Play } from "lucide-react";
import { getSeriesPath } from "~/lib/seriesUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Series - CineCircle" },
    { name: "description", content: "Explore our collection of series and shows on CineCircle." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Load featured series and recent series
    const [featuredSeries, allSeriesResponse] = await Promise.all([
      getFeaturedSeries(request),
      getAllSeries({ page: 1, limit: 12 }, request)
    ]);
    return {
      featuredSeries,
      allSeries: allSeriesResponse?.series || [],
      pagination: allSeriesResponse?.pagination || { page: 1, totalPages: 1, total: 0 }
    };
  } catch (error) {
    console.error('Error loading series:', error);
    return {
      featuredSeries: null,
      allSeries: [],
      pagination: { page: 1, totalPages: 1, total: 0 }
    };
  }
}

export default function Series() {
  const { featuredSeries, allSeries, pagination } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Featured Series Section */}
        {featuredSeries && (
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-6">Featured Series</h1>
            <Card className="overflow-hidden">
              <Link to={getSeriesPath(featuredSeries.title)}>
                <div className="relative">
                  {featuredSeries.image_url && (
                    <LazyImage
                      src={featuredSeries.image_url}
                      alt={featuredSeries.title}
                      aspectRatio="16/9"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <div className="space-y-2">
                      {featuredSeries.partner_name && (
                        <Badge variant="secondary" className="mb-2">
                          {featuredSeries.partner_name}
                        </Badge>
                      )}
                      <h2 className="text-2xl font-bold">{featuredSeries.title}</h2>
                      {featuredSeries.description && (
                        <p className="text-gray-200 line-clamp-2 max-w-2xl">
                          {featuredSeries.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          </section>
        )}

        {/* All Series Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Series</h2>
            <div className="text-sm text-muted-foreground">
              {pagination.total} series available
            </div>
          </div>

          {allSeries.length > 0 ? (
            <VirtualizedSeriesGrid series={allSeries} className="mb-8" />
          ) : (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No series found</h3>
              <p className="text-muted-foreground">
                Check back later for new series additions.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

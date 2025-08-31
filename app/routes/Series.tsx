import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link } from "react-router";
import { getFeaturedSeries, getAllSeries } from "~/services/seriesService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Film, Play } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Series - CineCircle" },
    { name: "description", content: "Explore our collection of series and shows on CineCircle." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Load featured series and recent series
    const [featuredSeries, allSeries] = await Promise.all([
      getFeaturedSeries(request),
      getAllSeries({ page: 1, limit: 12 }, request)
    ]);

    return {
      featuredSeries,
      allSeries: allSeries.data || [],
      pagination: allSeries.pagination || { page: 1, totalPages: 1, total: 0 }
    };
  } catch (error) {
    console.error('Error loading series:', error);
    return {
      featuredSeries: [],
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
        {featuredSeries && featuredSeries.length > 0 && (
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-6">Featured Series</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredSeries.map((series) => (
                <Card key={series.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {series.partner?.logo_url ? (
                        <img 
                          src={series.partner.logo_url} 
                          alt={series.partner.name}
                          className="h-8 w-8 rounded"
                        />
                      ) : (
                        <Film className="h-8 w-8" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{series.title}</CardTitle>
                        <CardDescription>{series.partner?.name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {series.description}
                    </p>
                    <Button asChild>
                      <Link to={`/series/${series.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Series Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Series</h2>
          {allSeries.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allSeries.map((series) => (
                <Card key={series.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{series.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {series.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/series/${series.id}`}>
                        View Episodes
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Series Found</h3>
              <p className="text-muted-foreground">
                Check back later for new series content.
              </p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  asChild
                  variant={page === pagination.page ? "default" : "outline"}
                >
                  <Link to={`/series?page=${page}`}>
                    {page}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link } from "react-router";
import { getSeriesByTitle } from "~/services/seriesService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Film, Play, ArrowLeft } from "lucide-react";
import { slugToTitle } from "~/lib/seriesUtils";
import type { Movie } from "~/types/series";
import { formatDuration } from "~/lib/uiHelper";

export const meta: MetaFunction = ({ params }) => {
  const displayTitle = params.title ? slugToTitle(params.title) : 'Series';
  return [
    { title: `${displayTitle} - CineCircle` },
    { name: "description", content: "Watch series movies on CineCircle." },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const titleSlug = params.title || "";
  
  if (!titleSlug) {
    throw new Response("Series title is required", { status: 400 });
  }

  try {
    // Convert URL slug back to proper title
    const seriesTitle = slugToTitle(titleSlug);
    
    const series = await getSeriesByTitle(seriesTitle, request);
    
    if (!series) {
      throw new Response("Series not found", { status: 404 });
    }

    return { series };
  } catch (error) {
    console.error('Error loading series:', error);
    throw new Response("Failed to load series", { status: 500 });
  }
}

export default function SeriesDetail() {
  const { series } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link to="/series">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Series
            </Link>
          </Button>
        </div>

        {/* Series Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Series Image */}
            {series.image_url && (
              <div className="lg:w-1/3">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={series.image_url}
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Series Info */}
            <div className="lg:w-2/3 space-y-4">
              {series.partner_name && (
                <Badge variant="secondary" className="w-fit">
                  {series.partner_name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold">{series.title}</h1>
              {series.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {series.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Movies */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Movies in this Series</h2>
          
          {series.movies && series.movies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {series.movies.map((movie: Movie) => (
                <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/movies/${movie.id}`}>
                    <div className="aspect-[2/3] relative">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Film className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex justify-between items-end">
                          {movie.release_year && (
                            <Badge variant="secondary" className="text-xs">
                              {movie.release_year}
                            </Badge>
                          )}
                          {movie.imdb_rating && (
                            <Badge variant="outline" className="text-xs">
                              ⭐ {movie.imdb_rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">
                      {movie.title}
                    </CardTitle>
                    {movie.synopsis && (
                      <CardDescription className="line-clamp-2">
                        {movie.synopsis}
                      </CardDescription>
                    )}
                    {movie.duration_minutes && (
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(movie.duration_minutes)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={`/movies/${movie.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No movies available</h3>
              <p className="text-muted-foreground">
                This series doesn't have any movies yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

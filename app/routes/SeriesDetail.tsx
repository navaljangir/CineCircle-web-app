import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link } from "react-router";
import { getSeriesById } from "~/services/seriesService";
import { getContentById } from "~/services/contentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Film, Play, Clock, Calendar } from "lucide-react";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Series ${params.id} - CineCircle` },
    { name: "description", content: "Watch series episodes on CineCircle." },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const seriesId = parseInt(params.id || "");
  
  if (isNaN(seriesId)) {
    throw new Response("Invalid series ID", { status: 400 });
  }

  try {
    const series = await getSeriesById(seriesId, request);
    
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
        {/* Series Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {series.partner?.logo_url ? (
              <img 
                src={series.partner.logo_url} 
                alt={series.partner.name}
                className="h-12 w-12 rounded"
              />
            ) : (
              <Film className="h-12 w-12" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{series.title}</h1>
              {series.partner && (
                <p className="text-muted-foreground">by {series.partner.name}</p>
              )}
            </div>
          </div>
          
          {series.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {series.description}
            </p>
          )}
        </div>

        {/* Episodes/Content List */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Episodes</h2>
          
          {series.content && series.content.length > 0 ? (
            <div className="space-y-4">
              {series.content
                .sort((a, b) => {
                  // Sort by season and episode number if available
                  if (a.season !== b.season) {
                    return (a.season || 0) - (b.season || 0);
                  }
                  return (a.episodeNumber || 0) - (b.episodeNumber || 0);
                })
                .map((content) => (
                  <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{content.title}</h3>
                            <div className="flex space-x-2">
                              {content.season && (
                                <Badge variant="secondary">
                                  Season {content.season}
                                </Badge>
                              )}
                              {content.episodeNumber && (
                                <Badge variant="outline">
                                  Episode {content.episodeNumber}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {content.contentType}
                              </Badge>
                            </div>
                          </div>
                          
                          {content.description && (
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {content.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {content.duration && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{Math.round(content.duration / 60)} min</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(content.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button asChild>
                            <Link to={`/content/${content.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              Watch
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress bar if user has watch progress */}
                      {content.watchProgress && content.watchProgress.progress_percentage > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-muted-foreground">
                              {Math.round(content.watchProgress.progress_percentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${content.watchProgress.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Episodes Available</h3>
              <p className="text-muted-foreground">
                This series doesn't have any episodes yet. Check back later!
              </p>
            </div>
          )}
        </section>

        {/* Back to Series */}
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/series">
              ← Back to All Series
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

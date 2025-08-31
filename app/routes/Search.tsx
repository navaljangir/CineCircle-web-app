import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link, useSearchParams } from "react-router";
import { searchContent } from "~/services/contentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Film, Search, Play } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Search Content - CineCircle" },
    { name: "description", content: "Search for movies, series, and episodes on CineCircle." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  
  if (!query.trim()) {
    return { results: [], query: "" };
  }

  try {
    const results = await searchContent(query, {}, request);
    return { results, query };
  } catch (error) {
    console.error('Error searching content:', error);
    return { results: [], query, error: "Search failed" };
  }
}

export default function SearchContent() {
  const { results, query, error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Content</h1>
          
          {/* Search Form */}
          <form method="get" className="flex gap-4 max-w-2xl">
            <div className="flex-1">
              <Input
                name="q"
                type="search"
                placeholder="Search for movies, series, episodes..."
                defaultValue={query}
                className="w-full"
              />
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        {/* Search Results */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {query && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Search results for "{query}" ({results.length} found)
            </h2>
            
            {results.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((content) => (
                  <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant="outline">
                              {content.contentType}
                            </Badge>
                            {content.season && (
                              <Badge variant="secondary">
                                S{content.season}
                              </Badge>
                            )}
                            {content.episodeNumber && (
                              <Badge variant="secondary">
                                E{content.episodeNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {content.poster_url ? (
                          <img
                            src={content.poster_url}
                            alt={content.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                            <Film className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {content.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {content.description}
                        </p>
                      )}
                      <div className="flex space-x-2">
                        <Button asChild size="sm">
                          <Link to={`/content/${content.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Watch
                          </Link>
                        </Button>
                        {content.seriesId && (
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/series/${content.seriesId}`}>
                              View Series
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or browse our series collection.
                </p>
                <Button asChild>
                  <Link to="/series">
                    Browse Series
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!query && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search for Content</h3>
            <p className="text-muted-foreground mb-6">
              Find movies, series, and episodes by title, description, or tags.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild variant="outline">
                <Link to="/series">
                  Browse All Series
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

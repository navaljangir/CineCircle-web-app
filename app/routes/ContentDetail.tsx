import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link, useActionData } from "react-router";
import { useState } from "react";
import { getContentById, addToWatchlist, removeFromWatchlist, updateWatchProgress } from "~/services/contentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Film, Play, Clock, Calendar, Plus, Minus, Heart } from "lucide-react";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Content ${params.id} - CineCircle` },
    { name: "description", content: "Watch content on CineCircle." },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const contentId = parseInt(params.id || "");
  
  if (isNaN(contentId)) {
    throw new Response("Invalid content ID", { status: 400 });
  }

  try {
    const content = await getContentById(contentId, request);
    
    if (!content) {
      throw new Response("Content not found", { status: 404 });
    }

    return { content };
  } catch (error) {
    console.error('Error loading content:', error);
    throw new Response("Failed to load content", { status: 500 });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const contentId = parseInt(params.id || "");
  const formData = await request.formData();
  const actionType = formData.get("action") as string;

  try {
    switch (actionType) {
      case "add_to_watchlist":
        await addToWatchlist(contentId, request);
        return { success: true, message: "Added to watchlist" };
      
      case "remove_from_watchlist":
        await removeFromWatchlist(contentId, request);
        return { success: true, message: "Removed from watchlist" };
      
      case "update_progress":
        const progressSeconds = parseInt(formData.get("progress_seconds") as string);
        const totalSeconds = parseInt(formData.get("total_duration_seconds") as string);
        const completed = formData.get("completed") === "true";
        
        await updateWatchProgress(contentId, {
          progress_seconds: progressSeconds,
          total_duration_seconds: totalSeconds,
          completed,
        }, request);
        
        return { success: true, message: "Progress updated" };
      
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error('Error performing action:', error);
    return { success: false, error: "Action failed" };
  }
}

export default function ContentDetail() {
  const { content } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isWatchlistToggling, setIsWatchlistToggling] = useState(false);

  const handleWatchlistToggle = async (event: React.FormEvent) => {
    setIsWatchlistToggling(true);
    // Form submission will be handled by React Router
    setTimeout(() => setIsWatchlistToggling(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Content Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">{content.title}</h1>
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
                  <Badge 
                    variant={content.status === 'ready' ? 'default' : 'secondary'}
                  >
                    {content.status}
                  </Badge>
                </div>
              </div>
              
              {content.description && (
                <p className="text-lg text-muted-foreground max-w-3xl mb-4">
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
            
            {/* Action Buttons */}
            <div className="flex space-x-2 ml-4">
              {content.status === 'ready' && (
                <Button size="lg">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </Button>
              )}
              
              <form method="post" onSubmit={handleWatchlistToggle}>
                <input
                  type="hidden"
                  name="action"
                  value={content.isInWatchlist ? "remove_from_watchlist" : "add_to_watchlist"}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isWatchlistToggling}
                >
                  {content.isInWatchlist ? (
                    <>
                      <Minus className="mr-2 h-4 w-4" />
                      Remove from Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Progress bar if user has watch progress */}
          {content.watchProgress && content.watchProgress.progress_percentage > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Your Progress</span>
                <span className="text-muted-foreground">
                  {Math.round(content.watchProgress.progress_percentage)}% complete
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${content.watchProgress.progress_percentage}%` }}
                />
              </div>
              {content.watchProgress.completed && (
                <p className="text-sm text-green-600 mt-2">✓ Completed</p>
              )}
            </div>
          )}
        </div>

        {/* Video Player Placeholder */}
        {content.status === 'ready' && content.video_url && (
          <section className="mb-8">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">Video Player</p>
                    <p className="text-muted-foreground">
                      Video player would be integrated here
                    </p>
                    <Button className="mt-4">
                      Start Playing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Content Details */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Content Information</h4>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type:</dt>
                      <dd>{content.contentType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status:</dt>
                      <dd>{content.status}</dd>
                    </div>
                    {content.duration && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Duration:</dt>
                        <dd>{Math.round(content.duration / 60)} minutes</dd>
                      </div>
                    )}
                    {content.seriesId && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Series:</dt>
                        <dd>
                          <Link 
                            to={`/series/${content.seriesId}`}
                            className="text-primary hover:underline"
                          >
                            View Series
                          </Link>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                {content.tags && content.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Messages */}
        {actionData && (
          <div className={`mb-4 p-4 rounded-lg ${
            actionData.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {actionData.success ? actionData.message : actionData.error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link to="/series">
              ← Back to Series
            </Link>
          </Button>
          
          {content.seriesId && (
            <Button asChild variant="outline">
              <Link to={`/series/${content.seriesId}`}>
                View All Episodes
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

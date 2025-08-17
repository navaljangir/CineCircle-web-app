import type { LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Film, Clock, Bookmark, Search, Star, Play } from "lucide-react";
import { getMovies } from "~/services/movieService";
import { useAppSelector } from "~/hooks";
import { selectUser, selectIsAuthenticated } from "~/lib/store/slices/authSlice";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { User } from "~/types/auth";
import type { Movie } from "~/types/movie";

export async function meta() {
  return [
    { title: "Dashboard - CineCircle" },
    { name: "description", content: "Your CineCircle dashboard" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get some movies for the dashboard
    const moviesData = await getMovies({ limit: 8 }, request);
    
    return data({
      recentMovies: moviesData.data,
    });
  } catch (error) {
    // User is not authenticated, redirect to login
    return redirect("/login");
  }
}

export function shouldRevalidate() {
  return true;
}

export default function Dashboard() {
  const { recentMovies } = useLoaderData<typeof loader>();
  
  // Get user data from Redux store  
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  // Redirect to login if not authenticated (this should rarely happen due to root loader)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Redirecting to login...</p>
          <Button asChild>
            <Link to="/login">Click here if not redirected automatically</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Welcome back, {user.name}!</CardTitle>
                <CardDescription>
                  Ready to discover your next favorite movie?
                </CardDescription>
              </div>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Movies Watched</p>
                      <p className="text-2xl font-bold">127</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <Bookmark className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Watchlist</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-accent/10 rounded-full">
                      <Star className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump to your favorite CineCircle features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex-col space-y-2" variant="outline">
                <Link to="/movies">
                  <Film className="h-6 w-6" />
                  <span>Browse Movies</span>
                </Link>
              </Button>
              
              <Button asChild className="h-20 flex-col space-y-2" variant="outline">
                <Link to="/watchlist">
                  <Bookmark className="h-6 w-6" />
                  <span>My Watchlist</span>
                </Link>
              </Button>
              
              <Button asChild className="h-20 flex-col space-y-2" variant="outline">
                <Link to="/history">
                  <Clock className="h-6 w-6" />
                  <span>Watch History</span>
                </Link>
              </Button>
              
              <Button asChild className="h-20 flex-col space-y-2" variant="outline">
                <Link to="/search">
                  <Search className="h-6 w-6" />
                  <span>Search Movies</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Movies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Popular Movies</CardTitle>
              <CardDescription>
                Trending movies you might enjoy
              </CardDescription>
            </div>
            <Button asChild variant="ghost">
              <Link to="/movies">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recentMovies.map((movie: Movie) => (
                <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={movie.poster_url || "/placeholder-movie.jpg"}
                      alt={movie.title}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" asChild>
                        <Link to={`/movies/${movie.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold truncate mb-1">{movie.title}</h4>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{movie.year}</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

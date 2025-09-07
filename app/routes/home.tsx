import type { Route } from "./+types/Home";
import { Link, useLoaderData } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Film, Play, Star, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ThemeToggle } from "~/components/ThemeToggle";
import { FeaturedSeries } from "~/components/FeaturedSeries";
import { FeaturedMovies } from "~/components/FeaturedMovies";
import { SeriesCarousel } from "~/components/SeriesCarousel";
import { MovieCarousel } from "~/components/MovieCarousel";
import { getFeaturedSeries, getAllSeries } from "~/services/seriesService";
import { getFeaturedMovies } from "~/services/movieService";
import type { FeaturedSeries as FeaturedSeriesType, Series } from "~/types/series";
import type { Movie } from "~/types/movie";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [featuredSeries, allSeriesResponse, featuredMovies] = await Promise.all([
      getFeaturedSeries(request),
      getAllSeries({ page: 1, limit: 12 }, request),
      getFeaturedMovies(6, request)
    ]);

    return {
      featuredSeries,
      recentSeries: allSeriesResponse?.series || [],
      featuredMovies: featuredMovies || []
    };
  } catch (error) {
    console.error('Error loading home data:', error);
    return {
      featuredSeries: null,
      recentSeries: [],
      featuredMovies: []
    };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CineCircle - Discover Your Next Favorite Movie & Series" },
    { name: "description", content: "Join CineCircle and discover amazing movies and series with our community of film enthusiasts." },
  ];
}

export default function Home() {
  const { featuredSeries, recentSeries, featuredMovies: initialFeaturedMovies } = useLoaderData<typeof loader>();

  // Use React Query for featured movies with better caching
  const {
    data: featuredMovies = initialFeaturedMovies,
    isLoading: moviesLoading
  } = useQuery({
    queryKey: ['featured-movies-home'],
    queryFn: () => getFeaturedMovies(6),
    initialData: initialFeaturedMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Discover Your Next
              <span className="text-primary"> Favorite Movie</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
              Join CineCircle and explore a world of cinema. Track what you've watched, 
              discover new favorites, and connect with fellow movie enthusiasts.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">
                <Play className="mr-2 h-5 w-5" />
                Start Watching
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/movies">Browse Movies</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/series">Browse Series</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Featured Movies Section */}
      {featuredMovies.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Movies</h2>
            <Button asChild variant="outline">
              <Link to="/movies">View All Movies</Link>
            </Button>
          </div>
          <FeaturedMovies limit={5} />
        </section>
      )}

      {/* Featured Series Section */}
      <FeaturedSeries series={featuredSeries} />

      {/* Recent Series Carousel */}
      <SeriesCarousel 
        title="Latest Series" 
        series={recentSeries} 
        viewAllLink="/series"
      />

      {/* Featured Movies Carousel */}
      {!moviesLoading && featuredMovies.length > 0 && (
        <MovieCarousel 
          title="Featured Movies" 
          movies={featuredMovies} 
          viewAllLink="/movies"
        />
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Discover Movies & Series</CardTitle>
              <CardDescription>
                Explore our vast collection of movies and series from every genre and era
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Rate & Review</CardTitle>
              <CardDescription>
                Share your thoughts and see what others think about your favorite movies and series
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Join Community</CardTitle>
              <CardDescription>
                Connect with fellow movie and series lovers and share recommendations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Start Your Cinema Journey?</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of movie and series enthusiasts on CineCircle
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Film className="h-5 w-5" />
              <span className="font-semibold">CineCircle</span>
            </div>
            <p className="text-muted-foreground text-sm mt-4 md:mt-0">
              © 2025 CineCircle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

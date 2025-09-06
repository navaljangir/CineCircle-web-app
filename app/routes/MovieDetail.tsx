import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Film } from "lucide-react";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Movie ${params.id} - CineCircle` },
    { name: "description", content: "Watch movies on CineCircle." },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const movieId = params.id || "";
  
  // TODO: Implement movie loading logic
  // For now, return a placeholder
  return { 
    movie: {
      id: movieId,
      title: "Movie Title",
      description: "Movie description will be loaded here."
    }
  };
}

export default function MovieDetail() {
  const { movie } = useLoaderData<typeof loader>();

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

        {/* Movie Content */}
        <div className="text-center py-12">
          <Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          <p className="text-muted-foreground mb-6">
            Movie detail page - Coming soon!
          </p>
          <p className="text-sm text-muted-foreground">
            Movie ID: {movie.id}
          </p>
        </div>
      </div>
    </div>
  );
}

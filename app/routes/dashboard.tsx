import type { LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";
import { getMovies } from "~/services/movieService";
import { useAppSelector } from "~/hooks";
import { selectUser, selectIsAuthenticated } from "~/lib/store/slices/authSlice";
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
        <div className="text-center">
          <p>Redirecting to login...</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Click here if not redirected automatically
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CineCircle</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}!</span>
              <Link
                to="/profile"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/logout"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Welcome back
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.name}
                    </dd>
                  </dl>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/movies"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h5v2H2V4h5zM6 6v15a1 1 0 001 1h10a1 1 0 001-1V6H6z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Browse Movies
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Discover and explore our movie collection
                    </p>
                  </div>
                </Link>

                <Link
                  to="/watchlist"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      My Watchlist
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      View your saved movies to watch later
                    </p>
                  </div>
                </Link>

                <Link
                  to="/history"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Watch History
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Review your recently watched movies
                    </p>
                  </div>
                </Link>

                <Link
                  to="/search"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Search Movies
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Find movies by title, genre, or year
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Movies */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Popular Movies
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentMovies.map((movie: Movie) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    className="relative group bg-white rounded-lg border border-gray-300 hover:border-indigo-500 hover:shadow-md transition-all"
                  >
                    <div className="aspect-w-3 aspect-h-4">
                      <img
                        className="object-cover rounded-t-lg"
                        src={movie.poster_url || "/placeholder-movie.jpg"}
                        alt={movie.title}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {movie.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {movie.year} • ⭐ {movie.rating.toFixed(1)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  to="/movies"
                  className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  View all movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

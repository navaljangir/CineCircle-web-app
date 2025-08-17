import type { Route } from "./+types/_well-known";

// Loader for well-known URLs - return 404 for all well-known requests
export async function loader({ params }: Route.LoaderArgs) {
  // Log the request for debugging (optional)
  console.log(`Well-known URL requested: /.well-known/${params['*']}`);
  
  // Return a 404 response for all well-known URLs
  throw new Response("Not Found", { status: 404 });
}

// This component won't be rendered due to the 404 response above
export default function WellKnownRoute() {
  return null;
}

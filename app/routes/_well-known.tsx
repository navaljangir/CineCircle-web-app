import type { Route } from "./+types/_well-known";

export async function loader({ params }: Route.LoaderArgs) {

  throw new Response("Not Found", { status: 404 });
}

export default function WellKnownRoute() {
  return null;
}

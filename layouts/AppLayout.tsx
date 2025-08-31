import { Outlet, useLoaderData } from "react-router";   
import { AppProviders } from "~/Providers";
import { AuthInitializer } from "~/lib/store/authInitializer";
import { getAuthenticatedUser, userInit } from "~/services/authService";
import type { User } from "~/types/auth";

// Loader to get user data if authenticated
export async function loader({ request }: { request: Request }) {
  try {
    const result = await userInit(request);
    console.log('Auth loader result:', result);
    return result?.data;
  } catch (error) {
    console.error('Error loading user data:', error);
    return { user: null };
  }
}

export function shouldRevalidate(){
  return null;
}

export default function AppLayout() {
  const data = useLoaderData<{ user: User | null }>();

  return (
    <AppProviders >
      <AuthInitializer userData={data?.user || null} />
      <Outlet />
    </AppProviders>
  );
}

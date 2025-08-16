import { Provider } from "react-redux";
import { store } from "~/lib/store/store";
import { AuthInitializer } from "~/lib/store/authInitializer";
import type { User } from "~/types/auth";

interface AppProvidersProps {
  children: React.ReactNode;
  user?: User | null;
}

/**
 * App Providers Component
 * Contains all providers for the application
 */
export function AppProviders({ children, user }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <AuthInitializer userData={user || null} />
      {children}
    </Provider>
  );
}

export default AppProviders;

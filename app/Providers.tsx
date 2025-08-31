import { Provider } from "react-redux";
import { store } from "~/lib/store/store";
import { AuthInitializer } from "~/lib/store/authInitializer";
import type { User } from "~/types/auth";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * App Providers Component
 * Contains all providers for the application
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

export default AppProviders;

import type { User } from '~/types/auth';
import { store } from '~/lib/store/store';
import { setUser, setAuthData, clearAuth } from '~/lib/store/slices/authSlice';

/**
 * Function to set user data directly in the store (for use in loaders)
 * This is useful when you already have user data and just want to set it
 */
export function setUserInStore(user: User): void {
  store.dispatch(setUser(user));
}

/**
 * Function to set complete auth data in the store (for use after login)
 */
export function setAuthInStore(authData: {
  user: User;
  accessToken: string;
  refreshToken: string;
}): void {
  store.dispatch(setAuthData(authData));
}

/**
 * Function to clear auth from the store (for logout)
 */
export function clearAuthFromStore(): void {
  store.dispatch(clearAuth());
}

/**
 * Get the current user from the Redux store
 */
export function getCurrentUser(): User | null {
  const state = store.getState();
  return state.auth.user;
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated(): boolean {
  const state = store.getState();
  return state.auth.isAuthenticated;
}

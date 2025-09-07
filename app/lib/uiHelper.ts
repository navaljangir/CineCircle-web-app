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

/**
 * Safely format any decimal number to specified decimal places
 * Handles cases where value might be string, number, null, or undefined
 * @param value - The value to format (string, number, null, undefined)
 * @param decimalPlaces - Number of decimal places to keep (default: 1)
 * @param allowZero - Whether to return formatted zero values (default: false)
 * @returns Formatted string or null if invalid/zero
 */
export function formatDecimal(
  value: any, 
  decimalPlaces: number = 1, 
  allowZero: boolean = false
): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return null;
  }
  
  if (!allowZero && numericValue <= 0) {
    return null;
  }
  
  return numericValue.toFixed(decimalPlaces);
}

/**
 * Format percentage with specified decimal places
 * @param value - The percentage value to format
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted percentage string or null
 */
export function formatPercentage(value: any, decimalPlaces: number = 1): string | null {
  const formatted = formatDecimal(value, decimalPlaces, true);
  return formatted ? `${formatted}%` : null;
}

/**
 * Format currency/money values with specified decimal places
 * @param value - The monetary value to format
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted currency string or null
 */
export function formatCurrency(
  value: any, 
  decimalPlaces: number = 2, 
  currency: string = '$'
): string | null {
  const formatted = formatDecimal(value, decimalPlaces, true);
  return formatted ? `${currency}${formatted}` : null;
}

/**
 * Format large currency amounts (like box office) with locale formatting
 * @param value - The monetary value to format
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted currency string with locale formatting or null
 */
export function formatLargeCurrency(
  value: any, 
  currency: string = '$'
): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue) || numericValue <= 0) {
    return null;
  }
  
  return `${currency}${numericValue.toLocaleString()}`;
}

/**
 * Format rating scores (like Rotten Tomatoes) with no decimal places
 * @param value - The score value to format
 * @returns Formatted score string or null
 */
export function formatScore(value: any): string | null {
  return formatDecimal(value, 0, false);
}

/**
 * Format duration from minutes to human readable format (e.g., "2h 30m")
 */
export function formatDuration(durationMinutes: number | undefined | null): string | null {
  if (!durationMinutes || durationMinutes <= 0) {
    return null;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

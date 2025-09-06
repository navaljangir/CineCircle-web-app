/**
 * Utility functions for handling series titles and URLs
 */

/**
 * Convert a series title to a URL-friendly slug
 * Uses standard URL encoding to preserve all characters
 * @param title - The series title
 * @returns URL-friendly encoded title
 */
export function titleToSlug(title: string): string {
  // Use encodeURIComponent to properly encode all special characters
  // Then replace spaces with hyphens for better readability
  return encodeURIComponent(title.trim())
    .replace(/%20/g, '-') // Replace encoded spaces with hyphens for prettier URLs
    .toLowerCase();
}

/**
 * Convert a URL slug back to a readable title
 * This reverses the titleToSlug conversion
 * @param slug - The URL slug
 * @returns Readable title with proper capitalization
 */
export function slugToTitle(slug: string): string {
  // Replace hyphens back to %20 (encoded spaces) then decode
  const decoded = decodeURIComponent(slug.replace(/-/g, '%20'));
  
  // Apply title case formatting
  return decoded.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get the series URL path using title
 * @param title - The series title
 * @returns URL path for the series
 */
export function getSeriesPath(title: string): string {
  return `/series/${titleToSlug(title)}`;
}

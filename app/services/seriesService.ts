import { get } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";
import type { Series, FeaturedSeries } from "~/types/series";
import type { PaginatedResponse } from "~/types/api";

/**
 * Series Services
 */

// Get featured series for homepage
export async function getFeaturedSeries(request?: Request) {
  const response = await get<FeaturedSeries[]>({
    url: ENDPOINTS.GET_FEATURED_SERIES,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get series by ID with all its content
export async function getSeriesById(seriesId: number, request?: Request) {
  const response = await get<Series>({
    url: `${ENDPOINTS.GET_SERIES_BY_ID}/${seriesId}`,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get all series with pagination
export async function getAllSeries(
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {},
  request?: Request
) {
  const response = await get<PaginatedResponse<Series>>({
    url: ENDPOINTS.GET_ALL_SERIES,
    query: options,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

import { get, put, deleteRequest } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";
import type { User } from "~/types/auth";

/**
 * User Services
 */

// Get user profile
export async function getUserProfile(request?: Request) {
  const response = await get<{ user: User }>({
    url: ENDPOINTS.GET_USER_PROFILE,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Update user profile
export async function updateUserProfile(userData: Partial<User>, request?: Request) {
  const response = await put<User>({
    url: ENDPOINTS.UPDATE_USER_PROFILE,
    body: userData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  request?: Request
) {
  const response = await put<{ message: string }>({
    url: ENDPOINTS.CHANGE_PASSWORD,
    body: { currentPassword, newPassword },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Deactivate account
export async function deactivateAccount(request?: Request) {
  const response = await deleteRequest<{ message: string }>({
    url: ENDPOINTS.DEACTIVATE_ACCOUNT,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get user sessions
export async function getUserSessions(request?: Request) {
  const response = await get<any[]>({
    url: ENDPOINTS.GET_USER_SESSIONS,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Revoke user session
export async function revokeUserSession(token: string, request?: Request) {
  const response = await deleteRequest<{ message: string }>({
    url: `${ENDPOINTS.REVOKE_SESSION}/${token}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

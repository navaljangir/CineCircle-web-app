import { post, get } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "~/types/auth";

/**
 * Authentication Services
 */

// Login with email and password
export async function login(credentials: LoginCredentials, request?: Request) {
  const response = await post<AuthResponse>({
    url: ENDPOINTS.LOGIN,
    body: credentials,
    useAuth: false,
    fetchRequest: request,
  });
  
  // The response should contain both user and accessToken
  // Based on your example: { user: {...}, accessToken: "..." }
  return response.data;
}

// Register new user
export async function register(credentials: RegisterCredentials, request?: Request) {
  const response = await post<AuthResponse>({
    url: ENDPOINTS.REGISTER,
    body: credentials,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// OAuth login (Google, Facebook, etc.)
export async function oauthLogin(
  oauthData: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    picture?: string;
  },
  request?: Request
) {
  const response = await post<AuthResponse>({
    url: ENDPOINTS.OAUTH_LOGIN,
    body: oauthData,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// OTP login
export async function otpLogin(
  otpData: {
    phone?: string;
    email?: string;
    name?: string;
  },
  request?: Request
) {
  const response = await post<AuthResponse>({
    url: ENDPOINTS.OTP_LOGIN,
    body: otpData,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Refresh access token (uses refresh token from cookies)
export async function refreshToken(request?: Request) {
  const response = await post<{ accessToken: string; refreshToken: string; expiresIn: string }>({
    url: ENDPOINTS.REFRESH_TOKEN,
    useAuth: false, // Don't use access token for refresh
    fetchRequest: request,
    // No body needed since refresh token is in cookies
  });
  
  return response.data;
}

// Logout (uses refresh token from cookies)
export async function logout(request?: Request) {
  const response = await post<{ message: string }>({
    url: ENDPOINTS.LOGOUT,
    useAuth: false, // Don't use access token for logout
    fetchRequest: request,
    // No body needed since refresh token is in cookies
  });
  
  return response.data;
}

// Logout from all devices
export async function logoutAll(request?: Request) {
  const response = await post<{ message: string }>({
    url: ENDPOINTS.LOGOUT_ALL,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get authenticated user data (for loader functions)
export async function getAuthenticatedUser(request?: Request) {
    const response = await get<{ user: User }>({
      url: ENDPOINTS.GET_USER_PROFILE,
      useAuth: true,
      fetchRequest: request,
    });
    
    return response;
}


export async function userInit(request : Request){
  return get({
    url : ENDPOINTS.GET_USER_INIT,
    useAuth: true,
    fetchRequest: request,
  })
}
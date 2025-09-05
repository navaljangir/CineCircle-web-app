import { useEffect } from 'react';
import { useAppDispatch } from '~/hooks';
import { setAuthData, clearAuth } from './slices/authSlice';
import type { User } from '~/types/auth';

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

interface InitialDataType{
  user: User | null;
  accessToken: string | null;
}

interface AuthInitializerProps {
  initialData: InitialDataType | null;
  authData?: AuthData | null;
}

export function AuthInitializer({ initialData, authData }: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (authData) {
      // If we have full auth data (user + tokens), use that
      dispatch(setAuthData({
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken || '',
      }));
    } else if (initialData && initialData.user) {
      // If we only have user data, just set the user
      dispatch(setAuthData({
        user: initialData?.user,
        accessToken: initialData.accessToken || '',
        refreshToken: '', // No refresh token in this case
      }));
    } else {
      // No auth data, clear state
      dispatch(clearAuth());
    }
  }, [initialData, authData, dispatch]);
  
  return null;
}

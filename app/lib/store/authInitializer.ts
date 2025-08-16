import { useEffect } from 'react';
import { useAppDispatch } from '~/hooks';
import { setUser, clearAuth } from './slices/authSlice';
import type { User } from '~/types/auth';

interface AuthInitializerProps {
  userData: User | null;
}

export function AuthInitializer({ userData }: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    } else {
      dispatch(clearAuth());
    }
  }, [userData, dispatch]);
  
  return null;
}

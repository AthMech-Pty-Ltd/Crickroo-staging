import { useAuthContext } from '../store/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();

  return {
    ...context,
    user: context.registrationData,
  };
};

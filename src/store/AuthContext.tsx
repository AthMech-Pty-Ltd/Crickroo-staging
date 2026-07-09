import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { Platform } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { RegistrationData } from '../types';
import { INITIAL_REGISTRATION_DATA } from '../constants/auth';

interface AuthContextType {
  registrationData: RegistrationData;
  setRegistrationData: (data: RegistrationData) => void;
  updateRegistrationFields: (fields: Partial<RegistrationData>) => void;
  resetRegistration: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  permissions: { camera: boolean; location: boolean; microphone: boolean };
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(
    INITIAL_REGISTRATION_DATA,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
    microphone: false,
  });

  const refreshPermissions = useCallback(async () => {
    const CAMERA_PERMISSION = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    });
    const LOCATION_PERMISSION = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    });
    const MICROPHONE_PERMISSION = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    });

    const [cameraStatus, locationStatus, microphoneStatus] = await Promise.all([
      CAMERA_PERMISSION
        ? check(CAMERA_PERMISSION)
        : Promise.resolve(RESULTS.UNAVAILABLE),
      LOCATION_PERMISSION
        ? check(LOCATION_PERMISSION)
        : Promise.resolve(RESULTS.UNAVAILABLE),
      MICROPHONE_PERMISSION
        ? check(MICROPHONE_PERMISSION)
        : Promise.resolve(RESULTS.UNAVAILABLE),
    ]);

    setPermissions({
      camera: cameraStatus === RESULTS.GRANTED,
      location: locationStatus === RESULTS.GRANTED,
      microphone: microphoneStatus === RESULTS.GRANTED,
    });
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  const updateRegistrationFields = useCallback(
    (fields: Partial<RegistrationData>) => {
      setRegistrationData(prev => ({ ...prev, ...fields }));
    },
    [],
  );

  const resetRegistration = useCallback(() => {
    setRegistrationData(INITIAL_REGISTRATION_DATA);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        registrationData,
        setRegistrationData,
        updateRegistrationFields,
        resetRegistration,
        isAuthenticated,
        setIsAuthenticated,
        permissions,
        refreshPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPlatformsContextType {
  selectedPlatforms: number[];
  setSelectedPlatforms: (platforms: number[]) => void;
  loading: boolean;
}

const UserPlatformsContext = createContext<UserPlatformsContextType | undefined>(undefined);

export const UserPlatformsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPlatforms, setSelectedPlatformsState] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('selectedPlatforms');
        if (stored) setSelectedPlatformsState(JSON.parse(stored));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  // Save to AsyncStorage when changed
  const setSelectedPlatforms = (platforms: number[]) => {
    setSelectedPlatformsState(platforms);
    AsyncStorage.setItem('selectedPlatforms', JSON.stringify(platforms));
  };

  return (
    <UserPlatformsContext.Provider value={{ selectedPlatforms, setSelectedPlatforms, loading }}>
      {children}
    </UserPlatformsContext.Provider>
  );
};

export const useUserPlatforms = () => {
  const ctx = useContext(UserPlatformsContext);
  if (!ctx) throw new Error('useUserPlatforms must be used within UserPlatformsProvider');
  return ctx;
};

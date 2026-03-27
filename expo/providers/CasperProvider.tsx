import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CasperContextType = {
  hasSeenIntro: boolean;
  setHasSeenIntro: (value: boolean) => void;
  selectedPortal: string | null;
  setSelectedPortal: (portal: string | null) => void;
};

const CasperContext = createContext<CasperContextType | null>(null);

export function CasperProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenIntro, setHasSeenIntroState] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  useEffect(() => {
    console.log('[CasperProvider] Loading intro state');
    AsyncStorage.getItem('hasSeenIntro')
      .then((value) => {
        console.log('[CasperProvider] Intro state loaded:', value);
        if (value === 'true') {
          setHasSeenIntroState(true);
        }
      })
      .catch((error) => {
        console.error('[CasperProvider] Failed to load intro state:', error);
      });
  }, []);

  const setHasSeenIntro = useCallback((value: boolean) => {
    console.log('[CasperProvider] Setting intro state:', value);
    setHasSeenIntroState(value);
    AsyncStorage.setItem('hasSeenIntro', value.toString())
      .catch((error) => {
        console.error('[CasperProvider] Failed to save intro state:', error);
      });
  }, []);

  const value = useMemo(
    () => ({
      hasSeenIntro,
      setHasSeenIntro,
      selectedPortal,
      setSelectedPortal,
    }),
    [hasSeenIntro, setHasSeenIntro, selectedPortal]
  );

  return (
    <CasperContext.Provider value={value}>
      {children}
    </CasperContext.Provider>
  );
}

export function useCasper() {
  const ctx = useContext(CasperContext);
  if (!ctx) {
    throw new Error('useCasper must be used within <CasperProvider />');
  }
  return ctx;
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Settings {
  enableTransitions: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setEnableTransitions: (enabled: boolean) => void;
}

const defaultSettings: Settings = {
  enableTransitions: true,
};

const STORAGE_KEY = 'app-settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.enableTransitions) {
      root.classList.remove('no-transitions');
    } else {
      root.classList.add('no-transitions');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setEnableTransitions = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enableTransitions: enabled }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setEnableTransitions }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

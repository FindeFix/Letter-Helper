import React, { createContext, useContext, useState, useEffect } from "react";
import { type Settings, type AppMode } from "./types";
import { getSettings, updateDisabledLetters } from "./db";
import { isConfigured } from "./supabase";

const MODE_KEY = "buchstaben_mode";

interface AppContextValue {
  settings: Settings;
  loading: boolean;
  saveDisabledLetters: (letters: string[]) => Promise<void>;
  saveMode: (mode: AppMode) => void;
  reload: () => void;
}

const defaultSettings: Settings = { id: "global", disabled_letters: [], mode: "editor" };

const AppContext = createContext<AppContextValue>({
  settings: defaultSettings,
  loading: false,
  saveDisabledLetters: async () => {},
  saveMode: () => {},
  reload: () => {},
});

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    mode: (localStorage.getItem(MODE_KEY) as AppMode) || "editor",
  }));
  const [loading, setLoading] = useState(isConfigured());

  const load = async () => {
    if (!isConfigured()) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(prev => ({ ...data, mode: prev.mode }));
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveDisabledLetters = async (letters: string[]) => {
    await updateDisabledLetters(letters);
    setSettings(prev => ({ ...prev, disabled_letters: letters }));
  };

  const saveMode = (mode: AppMode) => {
    localStorage.setItem(MODE_KEY, mode);
    setSettings(prev => ({ ...prev, mode }));
  };

  return (
    <AppContext.Provider value={{ settings, loading, saveDisabledLetters, saveMode, reload: load }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

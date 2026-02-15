import { useState, useCallback } from "react";

export interface Preferences {
  budgetAlertThreshold: number;
  defaultTaskPriority: number;
  autoArchiveCompleted: boolean;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = "solutioniq_preferences";

const defaults: Preferences = {
  budgetAlertThreshold: 90,
  defaultTaskPriority: 3,
  autoArchiveCompleted: false,
  notificationsEnabled: true,
};

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(load);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, update };
}

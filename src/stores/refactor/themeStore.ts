import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDBStorage } from "./IndexedDB";
import { create } from 'zustand';

enum Themes {
  dark = 'dark',
  light = 'light',
}

interface ThemeStore {
  theme: Themes;
}

export const themeStore = create<ThemeStore>()(
  persist((_set, _get) => ({
    theme: Themes.dark,
  }), {
    name: 'theme',
    version: 1,
    storage: createJSONStorage(() => indexedDBStorage),
    partialize: (state) => ({
      theme: state.theme,
    }),
  })
);

export const themeActions = {
  set: (theme: Themes) => {
    themeStore.setState({ theme })
  },
  toggle: () => {
    const { theme } = themeStore.getState();
    if (theme === Themes.dark) {
      themeActions.set(Themes.light);
    } else {
      themeActions.set(Themes.dark);
    }
  }
}


import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDBStorage } from "./IndexedDB";

interface UserStore {
  user: any, // the user instance
  data: any, // encrypted data 
}

interface UserActions {
  login: (user: any) => void,
  logout: () => void,
}

export const useUser = create<UserStore>()(
  persist((set, get) => ({
    user: null, // the user instance
    data: null, // encrypted data 
  }), {
    name: 'user',
    version: 1,
    storage: createJSONStorage(() => indexedDBStorage),
    partialize: (state) => ({ data: state.data }),
  })
);

export const login = (user: any) => useUser.setState({ user: user })

export const logout = () => useUser.setState((state) => {
  
  return { user: null }
})
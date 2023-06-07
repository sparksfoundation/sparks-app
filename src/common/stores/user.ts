import { Identity } from '@features/identity';
import { create } from 'zustand';

export type User = {
  user: typeof Identity
}

export interface UserStore {
  user: typeof Identity | undefined;
  login: (state?: typeof Identity) => void;
  logout: () => void;
}

export const useUser = create<UserStore>((set) => ({
  user: undefined,
  login: (user) => set({ user }),
  logout: () => set({ user: undefined }),
}))
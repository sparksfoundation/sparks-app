import { create } from 'zustand';

export type SideNavOpen = boolean;

export type SideNaveStore = {
  open: SideNavOpen,
  openSideNav: () => void,
  closeSideNav: () => void,
}

export const useSideNav = create<SideNaveStore>((set) => ({
  open: false,
  openSideNav: () => set({ open: true }),
  closeSideNav: () => set({ open: false }),
}))

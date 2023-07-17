import { create } from 'zustand';
import { createSelectors } from './createSelectors';

type SideNavOpen = boolean;

interface SideNavStore {
    open: SideNavOpen,
}

export const sideNavStore = create<SideNavStore>(() => ({
    open: false,
}));

export const useSideNavStore = createSelectors(sideNavStore);

export const sideNavActions = {
    open: () => {
        sideNavStore.setState({ open: true })
    },
    close: () => {
        sideNavStore.setState({ open: false })
    },
}


import { create } from 'zustand';

type SideNavOpen = boolean;

interface SideNavStore {
    open: SideNavOpen,
}

export const sideNavStore = create<SideNavStore>(() => ({
    open: false,
}))

export const sideNavActions = {
    open: () => {
        sideNavStore.setState({ open: true })
    },
    close: () => {
        sideNavStore.setState({ open: false })
    },
}


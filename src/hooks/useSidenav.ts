import { useCallback, useState } from "react";

interface SidenavHook {
  sidenavOpen: boolean;
  openSidenav: () => void;
  closeSidenav: () => void;
}

const useSidenav = (): SidenavHook => {
  const [sidenavOpen, setSidenavOpen] = useState(false);

  const openSidenav = useCallback((): void => {
    setSidenavOpen(true);
  }, []);

  const closeSidenav = useCallback((): void => {
    setSidenavOpen(false);
  }, []);

  return {
    closeSidenav,
    openSidenav,
    sidenavOpen,
  };
};

export default useSidenav;

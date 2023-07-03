import { Bars3Icon } from "@heroicons/react/24/outline";
import { Sidenav } from "@components/Sidenav";
import { H3, NoiseBackground } from "sparks-ui";
import { Outlet } from "react-router-dom";
import { useSideNav } from "@stores/sidenav";

export const PrivateLayoutHeader = ({ title }: { title: string }) => {
  const { openSideNav } = useSideNav();
  return (
    <header className="flex items-center justify-stretch h-16">
      <button
        type="button"
        className="p-4 z-20 text-fg-800 dark:text-fg-200 block lg:hidden grow-0"
        onClick={openSideNav}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <H3 className="text-center grow">{title}</H3>
    </header>
  )
};

export const PrivateLayout = () => {
  const { open, closeSideNav } = useSideNav();
  return (
    <div className="w-full h-full overflow-hidden absolute">
      <NoiseBackground />
      <Sidenav sidenavOpen={open} closeSidenav={closeSideNav} />
      <div className="lg:pl-72 h-full w-full overflow-hidden absolute">
        <div className="top-0 left-0 w-full h-full relative flex flex-col p-2">
            <Outlet />
        </div>
      </div>
    </div>
  );
};

import { Bars3Icon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Sidenav } from "@components/Sidenav";
import { ThemeSwitcher } from "@components/ThemeSwitcher";
import { NoiseBackground } from "sparks-ui";
import { Outlet } from "react-router-dom";
import { useSidenav } from "@hooks";

export const PrivateLayout = () => {
  const { closeSidenav, openSidenav, sidenavOpen } = useSidenav();

  return (
    <>
      <div className="h-full">
        <NoiseBackground />
        <Sidenav sidenavOpen={sidenavOpen} closeSidenav={closeSidenav} />

        <div className="lg:pl-72 h-full">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
            onClick={openSidenav}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <main className="relative py-6 px-6 w-full h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

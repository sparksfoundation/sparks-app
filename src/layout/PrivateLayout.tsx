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
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-slate-50 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
              onClick={openSidenav}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="relative flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-950 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  name="search"
                />
              </form>
              <div className="flex items-center">
                <ThemeSwitcher className="relative top-auto left-auto" />
              </div>
            </div>
          </div>
          <main className="relative py-10 px-10 w-full h-[calc(100%_-_4rem)]">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

import { Fragment } from "react";
import { H4, Logo, NoiseBackground, clsxm } from "sparks-ui";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import {
  EnvelopeIcon,
  HomeModernIcon,
  IdentificationIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import { ProfileMenu } from "@components/ProfileMenu";
import { Paths } from "@routes/paths";
import { themeStore } from "@stores/refactor/themeStore";
import { sideNavActions, sideNavStore } from "@stores/refactor/sideNavStore";

const navigation = [
  {
    name: "Dashboard",
    href: Paths.USER,
    icon: HomeModernIcon,
  },
  {
    name: "Credentials",
    href: Paths.USER_CREDENTIALS,
    icon: IdentificationIcon,
  },
  { 
    name: "Messenger",
    href: Paths.USER_MESSENGER,
    icon: EnvelopeIcon,
  },
  {
    name: "Sandbox",
    href: Paths.USER_SANDBOX,
    icon: RocketLaunchIcon,
  },
];

export const Sidenav = () => {
  const theme = themeStore((state) => state.theme);
  const open = sideNavStore((state) => state.open);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={sideNavActions.close}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-bg-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={sideNavActions.close}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-slate-300 dark:text-slate-200"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div
                  className={
                    "flex grow z-50 flex-col gap-y-5 overflow-y-auto bg-slate-200 dark:bg-slate-900 px-6 pb-4 ring-1 ring-slate-300/5 " +
                    theme
                  }
                >
                  <NoiseBackground />
                  <div className="flex h-16 shrink-0 items-center relative">
                    <Logo className="h-6 w-6" />
                    <H4 className="ml-2">SPARKS</H4>
                  </div>
                  <nav className="flex flex-1 flex-col relative">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                  clsxm(
                                    isActive
                                      ? "dark:bg-slate-800/50 bg-slate-400/20 text-slate-800 dark:text-slate-200"
                                      : "text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-800/50",
                                    "cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )
                                }
                                end
                                onClick={sideNavActions.close}
                              >
                                <item.icon
                                  className="h-6 w-6 shrink-0"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <ProfileMenu />
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto shadow-xl shadow-slate-950/50 dark:bg-slate-950 bg-slate-200 dark:text-slate-100 text-slate-950 px-6 pb-4">
          <NoiseBackground />
          <div className="relative flex h-16 shrink-0 items-center">
            <Logo className="h-6 w-6" />
            <H4 className="ml-2">SPARKS</H4>
          </div>
          <nav className="relative flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          clsxm(
                            isActive
                              ? "dark:bg-slate-800/50 bg-slate-400/20 text-slate-800 dark:text-slate-200"
                              : "text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-800/50",
                            "cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )
                        }
                        end
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <ProfileMenu />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

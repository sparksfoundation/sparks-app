import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { HomeModernIcon, IdentificationIcon, RocketLaunchIcon } from "@heroicons/react/24/solid"
import { ProfileMenu } from "@components/ProfileMenu"
import { ThemeSwitcher } from "@components/ThemeSwitcher"
import { H4, Logo, NoiseBackground, clsxm } from "sparks-ui"
import { Link, Outlet } from "react-router-dom";
import { USER_PATH, USER_SANDBOX_PATH } from  "@utils/routeHelpers"
import { useTheme } from "@stores/theme"

const navigation = [
  { name: "Dashboard", href: USER_PATH, icon: HomeModernIcon, current: true },
  { name: "Credentials", href: "#", icon: IdentificationIcon, current: false },
  { name: "Sandbox", href: USER_SANDBOX_PATH, icon: RocketLaunchIcon, current: false },
]

export const PrivateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const theme = useTheme(state => state.theme)

  return (
    <>
      <div className="h-full">
        <NoiseBackground />
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
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
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-slate-300 dark:text-slate-200" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className={"flex grow z-50 flex-col gap-y-5 overflow-y-auto bg-slate-200 dark:bg-slate-900 px-6 pb-4 ring-1 ring-slate-300/5 " + theme}>
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
                                <Link
                                  to={item.href}
                                  className={clsxm(
                                    item.current
                                      ? "dark:bg-slate-800/50 bg-slate-400/20 text-slate-800 dark:text-slate-200"
                                      : "text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-800/50",
                                    "cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </Link>
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
              <Logo className="h-6 w-6" /><H4 className="ml-2">SPARKS</H4>
            </div>
            <nav className="relative flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={clsxm(
                            item.current
                              ? "dark:bg-slate-800/50 bg-slate-400/20 text-slate-800 dark:text-slate-200"
                              : "text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-800/50",
                            "cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
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

        <div className="lg:pl-72 h-full">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-slate-50 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-slate-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />

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
  )
}

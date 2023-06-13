
import { Fragment } from "react"
import { useUser } from "@stores/user"
import { Menu, Transition } from "@headlessui/react"
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/20/solid"
import { Cog6ToothIcon } from "@heroicons/react/24/solid"
import { clsxm } from "sparks-ui";
import { Link } from "react-router-dom";

const options = [
  {
    name: "Settings",
    icon: Cog6ToothIcon,
    path: "/user/settings"
  },
  {
    name: "Log out",
    icon: ArrowRightOnRectangleIcon,
    path: "/auth/unlock"
  },
]

export const ProfileMenu = () => {
  const { user, logout } = useUser(state => ({ user: state.user as any, logout: state.logout }))

  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="-m-1.5 flex items-center p-1.5 w-full">
        <span className="sr-only">Open user menu</span>
        <img
          className="h-8 w-8 rounded-full bg-gray-50"
          src={user?.avatar as string}
          alt={`${user?.name} avatar`}
        />
        <div className="hidden lg:flex lg:items-center flex justify-between w-full">
          <div className="ml-4 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200" aria-hidden="true">
            {user?.name as string}
          </div>
          <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsxm(
            "absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md",
            "dark:bg-slate-800/50 bg-slate-400/20 py-2 shadow-lg ring-1 ring-gray-900/5",
            "focus:outline-none bottom-full w-full"
          )}
        >
          {options.map((item) => (
            <Menu.Item key={item.name}>
              <Link
                to={item.path}
                className={clsxm(
                  "text-slate-800 dark:text-slate-200",
                  "hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-800/50",
                  "cursor-pointer group flex gap-x-3 p-2 text-sm leading-6 font-semibold"
                )}
                onClick={item.name === 'Log out' ? logout : undefined}
              >
                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

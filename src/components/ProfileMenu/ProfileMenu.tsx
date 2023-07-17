import { Fragment, forwardRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";

import { Cog6ToothIcon, SunIcon, MoonIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { clsxm } from "sparks-ui";
import { Link } from "react-router-dom";
import { Paths } from "@routes/paths";
import { userActions, userStore } from "@stores/userStore";
import { themeStore, themeActions } from "@stores/themeStore";

const MenuLink = forwardRef(({ label, Icon, ...rest }: any, ref) => {
  return (
    <Link
      className={clsxm(
        "text-slate-800 dark:text-slate-200",
        "hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-800/50",
        "cursor-pointer group flex gap-x-3 p-2 text-sm leading-6 font-semibold"
      )}
      {...rest}
      ref={ref}
    >
      <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
});

export const ProfileMenu = () => {
  const user = userStore(state => state.user);
  const { logout } = userActions;
  const theme = themeStore(state => state.theme);

  return (
    <Menu as="div" className="relative w-full z-50">
      <Menu.Button className="-m-1.5 flex items-center p-1.5 w-full">
        <span className="sr-only">Open user menu</span>
        <img
          className="h-8 w-8 rounded-full bg-gray-50"
          src={user?.agents.profile.avatar as string}
          alt={`${user?.agents.profile.handle} avatar`}
        />
        <div className="flex lg:flex lg:items-center justify-between w-full">
          <div
            className="ml-4 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200"
            aria-hidden="true"
          >
            {user?.agents.profile.handle as string}
          </div>
          <ChevronDownIcon
            className="ml-2 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
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
          <Menu.Item>
            <MenuLink
              onClick={() => navigator.clipboard.writeText(user?.identifier as string) }
              label="Copy Identifier"
              Icon={DocumentDuplicateIcon}
            />
          </Menu.Item>
          <Menu.Item>
            <MenuLink
              onClick={themeActions.toggle}
              label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              Icon={theme === 'dark' ? SunIcon : MoonIcon}
            />
          </Menu.Item>
          <Menu.Item>
            <MenuLink to={Paths.USER_SETTINGS} label="Settings" Icon={Cog6ToothIcon} />
          </Menu.Item>
          <Menu.Item>
            <MenuLink onClick={logout} label="Logout" Icon={ArrowRightOnRectangleIcon} />
          </Menu.Item>
        </Menu.Items>
      </Transition >
    </Menu >
  );
};

import { Fragment, forwardRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { clsxm } from "sparks-ui";
import { Link } from "react-router-dom";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import { useUserStore, userActions } from "@stores/userStore";

const MenuLink = forwardRef(({ label, Icon, disabled, ...rest }: any, ref) => {
  return (
    <Link
      disabled={disabled}
      className={clsxm(
        "text-slate-800 dark:text-slate-200 whitespace-nowrap",
        "hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-400/20 dark:hover:bg-slate-700/50",
        "cursor-pointer group flex gap-x-3 p-2 px-6 text-sm leading-6 font-semibold",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      {...rest}
      ref={ref}
    >
      <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
});

export const CredentialCardMenu = ({credential}: { credential: Record<string, any> }) => {
  const user = useUserStore.use.user();

  async function deleteCredential() {
    if (!user) return;
    user.agents.presenter.removeCredential(credential);
    await userActions.save();
  }

  return (
    <Menu as="div" className="relative z-50">
      <Menu.Button className="-m-1.5 flex items-center p-1.5 w-full">
        <span className="sr-only">Open chat menu</span>
        <div className="flex lg:flex lg:items-center justify-between w-full">
          <EllipsisHorizontalIcon className="h-8 w-8 text-fg-800 dark:text-fg-200" />
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
            "absolute w-auto right-0 z-10 mt-2.5 origin-top-right rounded-md",
            "dark:bg-bg-800/100 bg-bg-100/90 py-2 shadow-lg ring-1 ring-gray-900/5",
            "focus:outline-none top-full"
          )}
        >
          {/* <Menu.Item>
            <MenuLink
              label="Update Credential"
              Icon={LinkIcon}
              disabled={false}
              onClick={() => {}}
            />
          </Menu.Item> */}
          <Menu.Item>
            <MenuLink
              label="Delete Credential"
              Icon={TrashIcon}
              onClick={() => deleteCredential()}
            />
          </Menu.Item>
        </Menu.Items>
      </Transition >
    </Menu >
  );
};
